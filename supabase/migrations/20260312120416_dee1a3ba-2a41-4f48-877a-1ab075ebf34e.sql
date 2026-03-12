
CREATE OR REPLACE FUNCTION public.recalculate_loan_on_update()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $$
BEGIN
  -- Recalculate monthly_installment and remaining when amount or installments_count changes
  IF NEW.amount IS DISTINCT FROM OLD.amount OR NEW.installments_count IS DISTINCT FROM OLD.installments_count THEN
    IF NEW.installments_count <= 0 THEN
      NEW.installments_count := 1;
    END IF;
    NEW.monthly_installment := ROUND(NEW.amount / NEW.installments_count, 2);
    NEW.remaining := NEW.amount - (COALESCE(NEW.paid_count, 0) * NEW.monthly_installment);
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_recalculate_loan_on_update
  BEFORE UPDATE ON public.loans
  FOR EACH ROW
  EXECUTE FUNCTION public.recalculate_loan_on_update();
