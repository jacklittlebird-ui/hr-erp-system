
-- Recalculate ALL leave balances from actual approved requests for all years

-- 1. Reset all used columns to 0
UPDATE leave_balances SET annual_used = 0, sick_used = 0, casual_used = 0, permissions_used = 0;

-- 2. Recalculate annual_used from approved leave_requests
UPDATE leave_balances lb
SET annual_used = sub.total
FROM (
  SELECT employee_id, EXTRACT(YEAR FROM start_date)::int as yr, SUM(days) as total
  FROM leave_requests WHERE status = 'approved' AND leave_type = 'annual'
  GROUP BY employee_id, EXTRACT(YEAR FROM start_date)::int
) sub
WHERE lb.employee_id = sub.employee_id AND lb.year = sub.yr;

-- 3. Recalculate sick_used
UPDATE leave_balances lb
SET sick_used = sub.total
FROM (
  SELECT employee_id, EXTRACT(YEAR FROM start_date)::int as yr, SUM(days) as total
  FROM leave_requests WHERE status = 'approved' AND leave_type = 'sick'
  GROUP BY employee_id, EXTRACT(YEAR FROM start_date)::int
) sub
WHERE lb.employee_id = sub.employee_id AND lb.year = sub.yr;

-- 4. Recalculate casual_used
UPDATE leave_balances lb
SET casual_used = sub.total
FROM (
  SELECT employee_id, EXTRACT(YEAR FROM start_date)::int as yr, SUM(days) as total
  FROM leave_requests WHERE status = 'approved' AND leave_type = 'casual'
  GROUP BY employee_id, EXTRACT(YEAR FROM start_date)::int
) sub
WHERE lb.employee_id = sub.employee_id AND lb.year = sub.yr;

-- 5. Recalculate permissions_used from approved permission_requests
UPDATE leave_balances lb
SET permissions_used = sub.total
FROM (
  SELECT employee_id, EXTRACT(YEAR FROM date)::int as yr, SUM(hours) as total
  FROM permission_requests WHERE status = 'approved'
  GROUP BY employee_id, EXTRACT(YEAR FROM date)::int
) sub
WHERE lb.employee_id = sub.employee_id AND lb.year = sub.yr;

-- 6. Recalculate annual_total = 21 + approved overtime days
UPDATE leave_balances lb
SET annual_total = 21 + COALESCE(sub.cnt, 0)
FROM (
  SELECT employee_id, EXTRACT(YEAR FROM date)::int as yr, COUNT(*) as cnt
  FROM overtime_requests WHERE status = 'approved'
  GROUP BY employee_id, EXTRACT(YEAR FROM date)::int
) sub
WHERE lb.employee_id = sub.employee_id AND lb.year = sub.yr;

-- Fix rows with annual_total = 0 (should be at least 21)
UPDATE leave_balances SET annual_total = 21 WHERE annual_total < 21;
