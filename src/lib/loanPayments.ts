import { supabase } from '@/integrations/supabase/client';

const getPeriodDueDate = (year: string, month: string) => `${year}-${month}-01`;

const updateInstallmentsStatus = async (installmentIds: string[], status: 'paid' | 'pending') => {
  if (installmentIds.length === 0) return;

  const payload = status === 'paid'
    ? { status: 'paid', paid_at: new Date().toISOString() }
    : { status: 'pending', paid_at: null };

  const { error } = await supabase
    .from('loan_installments')
    .update(payload)
    .in('id', installmentIds);

  if (error) throw error;
};

export const recalculateLoanSummary = async (loanId: string) => {
  const [{ data: loan, error: loanError }, { data: installments, error: installmentsError }] = await Promise.all([
    supabase
      .from('loans')
      .select('id, amount, installments_count')
      .eq('id', loanId)
      .single(),
    supabase
      .from('loan_installments')
      .select('amount, status')
      .eq('loan_id', loanId),
  ]);

  if (loanError) throw loanError;
  if (installmentsError) throw installmentsError;

  const paidInstallments = (installments || []).filter((installment) => installment.status === 'paid');
  const paidCount = paidInstallments.length;
  const paidAmount = paidInstallments.reduce((sum, installment) => sum + Number(installment.amount || 0), 0);
  const remaining = Math.max(Number(loan.amount || 0) - paidAmount, 0);
  const status = paidCount >= Number(loan.installments_count || 0) && Number(loan.installments_count || 0) > 0
    ? 'completed'
    : 'active';

  const { error: updateError } = await supabase
    .from('loans')
    .update({
      paid_count: paidCount,
      remaining,
      status,
    })
    .eq('id', loanId);

  if (updateError) throw updateError;
};

export const markInstallmentPaid = async (installmentId: string) => {
  const { data: installment, error } = await supabase
    .from('loan_installments')
    .select('id, loan_id')
    .eq('id', installmentId)
    .single();

  if (error) throw error;

  await updateInstallmentsStatus([installment.id], 'paid');
  await recalculateLoanSummary(installment.loan_id);
};

export const revertInstallmentPayment = async (installmentId: string) => {
  const { data: installment, error } = await supabase
    .from('loan_installments')
    .select('id, loan_id')
    .eq('id', installmentId)
    .single();

  if (error) throw error;

  await updateInstallmentsStatus([installment.id], 'pending');
  await recalculateLoanSummary(installment.loan_id);
};

export const markLoanInstallmentsPaidForPeriod = async (employeeIds: string[], month: string, year: string) => {
  const uniqueEmployeeIds = Array.from(new Set(employeeIds.filter(Boolean)));
  if (uniqueEmployeeIds.length === 0) return;

  const dueDate = getPeriodDueDate(year, month);
  const { data: installments, error } = await supabase
    .from('loan_installments')
    .select('id, loan_id')
    .in('employee_id', uniqueEmployeeIds)
    .eq('due_date', dueDate)
    .eq('status', 'pending');

  if (error) throw error;
  if (!installments || installments.length === 0) return;

  await updateInstallmentsStatus(installments.map((installment) => installment.id), 'paid');

  const loanIds = Array.from(new Set(installments.map((installment) => installment.loan_id)));
  await Promise.all(loanIds.map(recalculateLoanSummary));
};

export const revertLoanPaymentsForPeriod = async (employeeId: string, month: string, year: string) => {
  if (!employeeId) return;

  const dueDate = getPeriodDueDate(year, month);
  const { data: installments, error } = await supabase
    .from('loan_installments')
    .select('id, loan_id')
    .eq('employee_id', employeeId)
    .eq('due_date', dueDate)
    .eq('status', 'paid');

  if (error) throw error;
  if (!installments || installments.length === 0) return;

  await updateInstallmentsStatus(installments.map((installment) => installment.id), 'pending');

  const loanIds = Array.from(new Set(installments.map((installment) => installment.loan_id)));
  await Promise.all(loanIds.map(recalculateLoanSummary));
};