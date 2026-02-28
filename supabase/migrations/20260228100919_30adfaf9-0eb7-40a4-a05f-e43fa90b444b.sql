
-- Function to update leave_balances when a leave request is approved
CREATE OR REPLACE FUNCTION public.update_leave_balance_on_approval()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  req_year integer;
  col_used text;
BEGIN
  -- Only act when status changes to 'approved'
  IF NEW.status = 'approved' AND (OLD.status IS NULL OR OLD.status <> 'approved') THEN
    req_year := EXTRACT(YEAR FROM NEW.start_date);
    
    -- Map leave_type to the correct column
    CASE NEW.leave_type
      WHEN 'annual' THEN col_used := 'annual_used';
      WHEN 'sick' THEN col_used := 'sick_used';
      WHEN 'casual' THEN col_used := 'casual_used';
      ELSE col_used := NULL;
    END CASE;
    
    IF col_used IS NOT NULL THEN
      -- Upsert: create balance row for the year if missing, then increment used
      INSERT INTO public.leave_balances (employee_id, year, annual_used, sick_used, casual_used)
      VALUES (NEW.employee_id, req_year, 0, 0, 0)
      ON CONFLICT (employee_id, year) DO NOTHING;
      
      EXECUTE format(
        'UPDATE public.leave_balances SET %I = %I + $1 WHERE employee_id = $2 AND year = $3',
        col_used, col_used
      ) USING NEW.days, NEW.employee_id, req_year;
    END IF;
  END IF;
  
  -- If status changes FROM approved to something else, reverse the deduction
  IF OLD.status = 'approved' AND NEW.status <> 'approved' THEN
    req_year := EXTRACT(YEAR FROM NEW.start_date);
    
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
  
  RETURN NEW;
END;
$$;

-- Create the trigger
DROP TRIGGER IF EXISTS trg_update_leave_balance ON public.leave_requests;
CREATE TRIGGER trg_update_leave_balance
  AFTER UPDATE ON public.leave_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_leave_balance_on_approval();

-- Also handle INSERT with status = 'approved' directly
DROP TRIGGER IF EXISTS trg_update_leave_balance_insert ON public.leave_requests;
CREATE TRIGGER trg_update_leave_balance_insert
  AFTER INSERT ON public.leave_requests
  FOR EACH ROW
  WHEN (NEW.status = 'approved')
  EXECUTE FUNCTION public.update_leave_balance_on_approval();
