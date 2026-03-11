
-- Trigger function: reverse leave balance on DELETE of approved leave request
CREATE OR REPLACE FUNCTION public.reverse_leave_balance_on_delete()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  req_year integer;
  col_used text;
BEGIN
  IF OLD.status = 'approved' THEN
    req_year := EXTRACT(YEAR FROM OLD.start_date);
    
    CASE OLD.leave_type
      WHEN 'annual' THEN col_used := 'annual_used';
      WHEN 'sick' THEN col_used := 'sick_used';
      WHEN 'casual' THEN col_used := 'casual_used';
      ELSE col_used := NULL;
    END CASE;
    
    IF col_used IS NOT NULL THEN
      EXECUTE format(
        'UPDATE public.leave_balances SET %I = GREATEST(0, %I - $1) WHERE employee_id = $2 AND year = $3',
        col_used, col_used
      ) USING OLD.days, OLD.employee_id, req_year;
    END IF;
  END IF;
  
  RETURN OLD;
END;
$$;

-- Trigger function: reverse permission hours on DELETE of approved permission request
CREATE OR REPLACE FUNCTION public.reverse_permission_balance_on_delete()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  req_year integer;
BEGIN
  IF OLD.status = 'approved' THEN
    req_year := EXTRACT(YEAR FROM OLD.date);
    
    UPDATE public.leave_balances
    SET permissions_used = GREATEST(0, permissions_used - COALESCE(OLD.hours, 0))
    WHERE employee_id = OLD.employee_id AND year = req_year;
  END IF;
  
  RETURN OLD;
END;
$$;

-- Trigger function: reverse annual balance on DELETE of approved overtime request
CREATE OR REPLACE FUNCTION public.reverse_overtime_balance_on_delete()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  req_year integer;
BEGIN
  IF OLD.status = 'approved' THEN
    req_year := EXTRACT(YEAR FROM OLD.date);
    
    UPDATE public.leave_balances
    SET annual_total = GREATEST(21, annual_total - 1)
    WHERE employee_id = OLD.employee_id AND year = req_year;
  END IF;
  
  RETURN OLD;
END;
$$;

-- Create the triggers
CREATE TRIGGER trg_reverse_leave_on_delete
  BEFORE DELETE ON public.leave_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.reverse_leave_balance_on_delete();

CREATE TRIGGER trg_reverse_permission_on_delete
  BEFORE DELETE ON public.permission_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.reverse_permission_balance_on_delete();

CREATE TRIGGER trg_reverse_overtime_on_delete
  BEFORE DELETE ON public.overtime_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.reverse_overtime_balance_on_delete();
