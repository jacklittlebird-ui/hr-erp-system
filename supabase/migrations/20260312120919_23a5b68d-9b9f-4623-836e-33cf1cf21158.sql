CREATE OR REPLACE FUNCTION public.recalculate_loan_on_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  i integer;
  due date;
  installment_amount numeric(12,2);
  should_regenerate boolean;
BEGIN
  IF NEW.installments_count <= 0 THEN
    NEW.installments_count := 1;
  END IF;

  -- Manual monthly override: when monthly_installment is explicitly changed
  IF NEW.monthly_installment IS DISTINCT FROM OLD.monthly_installment
     AND COALESCE(NEW.monthly_installment, 0) > 0 THEN
    NEW.monthly_installment := ROUND(NEW.monthly_installment, 2);
    NEW.installments_count := GREATEST(1, CEIL(NEW.amount / NEW.monthly_installment)::integer);
  ELSE
    NEW.monthly_installment := ROUND(NEW.amount / GREATEST(NEW.installments_count, 1), 2);
  END IF;

  NEW.remaining := GREATEST(0, NEW.amount - (COALESCE(NEW.paid_count, 0) * NEW.monthly_installment));

  should_regenerate := (
    NEW.amount IS DISTINCT FROM OLD.amount
    OR NEW.installments_count IS DISTINCT FROM OLD.installments_count
    OR NEW.monthly_installment IS DISTINCT FROM OLD.monthly_installment
    OR NEW.start_date IS DISTINCT FROM OLD.start_date
    OR NEW.employee_id IS DISTINCT FROM OLD.employee_id
  );

  IF should_regenerate THEN
    DELETE FROM public.loan_installments WHERE loan_id = NEW.id;

    FOR i IN 1..NEW.installments_count LOOP
      due := NEW.start_date + (i * INTERVAL '1 month')::interval;

      IF i = NEW.installments_count THEN
        installment_amount := GREATEST(0, ROUND(NEW.amount - (NEW.monthly_installment * (NEW.installments_count - 1)), 2));
      ELSE
        installment_amount := NEW.monthly_installment;
      END IF;

      INSERT INTO public.loan_installments (
        loan_id,
        employee_id,
        installment_number,
        amount,
        due_date,
        status
      )
      VALUES (
        NEW.id,
        NEW.employee_id,
        i,
        installment_amount,
        due,
        CASE WHEN i <= COALESCE(NEW.paid_count, 0) THEN 'paid' ELSE 'pending' END
      );
    END LOOP;
  END IF;

  RETURN NEW;
END;
$$;