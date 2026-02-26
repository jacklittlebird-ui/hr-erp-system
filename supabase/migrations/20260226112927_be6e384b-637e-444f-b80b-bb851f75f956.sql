
-- Create the trigger that was missing
CREATE TRIGGER trg_generate_loan_installments
  BEFORE INSERT ON public.loans
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_loan_installments();

-- Fix the existing loan that was inserted without the trigger
UPDATE public.loans
SET monthly_installment = ROUND(amount / installments_count, 2),
    remaining = amount,
    paid_count = 0
WHERE monthly_installment = 0 AND installments_count > 0;
