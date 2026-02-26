
-- ============================================
-- PHASE 4: Business Logic Functions & Triggers
-- ============================================

-- 1. Calculate work hours on attendance insert/update
CREATE OR REPLACE FUNCTION public.calculate_work_hours()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  diff_minutes integer;
BEGIN
  IF NEW.check_in IS NOT NULL AND NEW.check_out IS NOT NULL THEN
    diff_minutes := EXTRACT(EPOCH FROM (NEW.check_out - NEW.check_in)) / 60;
    -- Handle overnight shifts
    IF diff_minutes < 0 THEN
      diff_minutes := diff_minutes + 1440;
    END IF;
    NEW.work_hours := ROUND(diff_minutes / 60.0, 2);
    NEW.work_minutes := diff_minutes;
  ELSE
    NEW.work_hours := 0;
    NEW.work_minutes := 0;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_calculate_work_hours
  BEFORE INSERT OR UPDATE ON public.attendance_records
  FOR EACH ROW
  EXECUTE FUNCTION public.calculate_work_hours();

-- 2. Generate loan installments on loan creation
CREATE OR REPLACE FUNCTION public.generate_loan_installments()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  inst_amount numeric(12,2);
  i integer;
  due date;
BEGIN
  IF NEW.installments_count <= 0 THEN
    NEW.installments_count := 1;
  END IF;
  
  inst_amount := ROUND(NEW.amount / NEW.installments_count, 2);
  NEW.monthly_installment := inst_amount;
  NEW.remaining := NEW.amount;
  NEW.paid_count := 0;
  
  FOR i IN 1..NEW.installments_count LOOP
    due := NEW.start_date + (i * INTERVAL '1 month')::interval;
    INSERT INTO public.loan_installments (loan_id, employee_id, installment_number, amount, due_date, status)
    VALUES (NEW.id, NEW.employee_id, i, inst_amount, due, 'pending');
  END LOOP;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_generate_installments
  AFTER INSERT ON public.loans
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_loan_installments();

-- 3. Calculate payroll net on insert/update
CREATE OR REPLACE FUNCTION public.calculate_payroll_net()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Calculate bonus amount
  IF NEW.bonus_type = 'percentage' THEN
    NEW.bonus_amount := ROUND(NEW.basic_salary * NEW.bonus_value / 100, 2);
  ELSE
    NEW.bonus_amount := COALESCE(NEW.bonus_value, 0);
  END IF;
  
  -- Calculate gross
  NEW.gross := COALESCE(NEW.basic_salary, 0) + COALESCE(NEW.transport_allowance, 0) 
    + COALESCE(NEW.incentives, 0) + COALESCE(NEW.station_allowance, 0) 
    + COALESCE(NEW.mobile_allowance, 0) + COALESCE(NEW.living_allowance, 0) 
    + COALESCE(NEW.overtime_pay, 0) + COALESCE(NEW.bonus_amount, 0);
  
  -- Calculate penalty
  IF NEW.penalty_type = 'days' THEN
    NEW.penalty_amount := ROUND(NEW.basic_salary / 30.0 * NEW.penalty_value, 2);
  ELSIF NEW.penalty_type = 'percentage' THEN
    NEW.penalty_amount := ROUND(NEW.basic_salary * NEW.penalty_value / 100, 2);
  ELSE
    NEW.penalty_amount := COALESCE(NEW.penalty_value, 0);
  END IF;
  
  -- Calculate leave deduction
  NEW.leave_deduction := ROUND(COALESCE(NEW.basic_salary, 0) / 30.0 * COALESCE(NEW.leave_days, 0), 2);
  
  -- Total deductions
  NEW.total_deductions := COALESCE(NEW.employee_insurance, 0) + COALESCE(NEW.loan_payment, 0)
    + COALESCE(NEW.advance_amount, 0) + COALESCE(NEW.mobile_bill, 0)
    + COALESCE(NEW.leave_deduction, 0) + COALESCE(NEW.penalty_amount, 0);
  
  -- Net salary
  NEW.net_salary := NEW.gross - NEW.total_deductions;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_calculate_payroll
  BEFORE INSERT OR UPDATE ON public.payroll_entries
  FOR EACH ROW
  EXECUTE FUNCTION public.calculate_payroll_net();

-- 4. Auto-create attendance on mission approval
CREATE OR REPLACE FUNCTION public.auto_attendance_on_mission()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  ci time;
  co time;
  hrs numeric;
BEGIN
  IF NEW.status = 'approved' AND (OLD.status IS NULL OR OLD.status <> 'approved') THEN
    -- Set times based on mission type
    CASE NEW.mission_type
      WHEN 'morning' THEN ci := '09:00'; co := '14:00'; hrs := 5;
      WHEN 'evening' THEN ci := '14:00'; co := '17:00'; hrs := 3;
      ELSE ci := '09:00'; co := '17:00'; hrs := 8;
    END CASE;
    
    -- Use provided times if available
    IF NEW.check_in IS NOT NULL THEN ci := NEW.check_in; END IF;
    IF NEW.check_out IS NOT NULL THEN co := NEW.check_out; END IF;
    
    INSERT INTO public.attendance_records (employee_id, date, check_in, check_out, status, notes)
    VALUES (
      NEW.employee_id,
      NEW.date,
      (NEW.date::text || ' ' || ci::text)::timestamptz,
      (NEW.date::text || ' ' || co::text)::timestamptz,
      'mission',
      'مأمورية / Mission'
    )
    ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_mission_attendance
  AFTER UPDATE ON public.missions
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_attendance_on_mission();

-- 5. Upsert mobile bill function
CREATE OR REPLACE FUNCTION public.upsert_mobile_bill(
  p_employee_id uuid,
  p_amount numeric,
  p_deduction_month text,
  p_uploaded_by uuid
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result_id uuid;
BEGIN
  INSERT INTO public.mobile_bills (employee_id, amount, deduction_month, uploaded_by)
  VALUES (p_employee_id, p_amount, p_deduction_month, p_uploaded_by)
  ON CONFLICT (employee_id, deduction_month) 
  DO UPDATE SET amount = EXCLUDED.amount, uploaded_by = EXCLUDED.uploaded_by
  RETURNING id INTO result_id;
  
  RETURN result_id;
END;
$$;

-- 6. Uniform total price calculation
CREATE OR REPLACE FUNCTION public.calculate_uniform_total()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.total_price := COALESCE(NEW.quantity, 0) * COALESCE(NEW.unit_price, 0);
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_uniform_total
  BEFORE INSERT OR UPDATE ON public.uniforms
  FOR EACH ROW
  EXECUTE FUNCTION public.calculate_uniform_total();
