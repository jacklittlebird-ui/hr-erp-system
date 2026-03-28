
-- Regenerate all installments for active/pending loans using the fixed logic
DO $$
DECLARE
  loan_rec RECORD;
  i integer;
  due date;
  installment_amount numeric(12,2);
BEGIN
  FOR loan_rec IN SELECT * FROM loans WHERE status IN ('active', 'pending') LOOP
    DELETE FROM loan_installments WHERE loan_id = loan_rec.id;

    FOR i IN 1..loan_rec.installments_count LOOP
      due := (loan_rec.start_date + make_interval(months => i - 1))::date;

      IF i = loan_rec.installments_count THEN
        installment_amount := GREATEST(0, ROUND(loan_rec.amount - (loan_rec.monthly_installment * (loan_rec.installments_count - 1)), 2));
      ELSE
        installment_amount := loan_rec.monthly_installment;
      END IF;

      INSERT INTO loan_installments (loan_id, employee_id, installment_number, amount, due_date, status, paid_at)
      VALUES (
        loan_rec.id, loan_rec.employee_id, i, installment_amount, due,
        CASE WHEN i <= COALESCE(loan_rec.paid_count, 0) THEN 'paid' ELSE 'pending' END,
        CASE WHEN i <= COALESCE(loan_rec.paid_count, 0) THEN now() ELSE NULL END
      );
    END LOOP;
  END LOOP;
END;
$$;
