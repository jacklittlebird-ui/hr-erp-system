import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { records } = await req.json() as {
      records: {
        emp_code: string;
        course_name: string;
        provider: string;
        location: string;
        start_date: string;
        end_date: string;
        planned_date: string;
        result: string;
        cert: boolean;
        cr: boolean;
        ss: boolean;
        cb: boolean;
      }[];
    };

    if (!records?.length) {
      return new Response(JSON.stringify({ error: "No records" }), { status: 400, headers: corsHeaders });
    }

    // 1. Get all unique employee codes and resolve to UUIDs
    const empCodes = [...new Set(records.map(r => r.emp_code))];
    const empMap = new Map<string, string>();
    
    // Batch fetch employees
    for (let i = 0; i < empCodes.length; i += 100) {
      const batch = empCodes.slice(i, i + 100);
      const { data } = await supabase
        .from("employees")
        .select("id, employee_code")
        .in("employee_code", batch);
      if (data) {
        for (const e of data) {
          empMap.set(e.employee_code.toLowerCase(), e.id);
        }
      }
    }

    // 2. Get all courses and resolve names to IDs
    const { data: courses } = await supabase
      .from("training_courses")
      .select("id, name_en");
    
    const courseMap = new Map<string, string>();
    if (courses) {
      for (const c of courses) {
        courseMap.set(c.name_en.toLowerCase().trim(), c.id);
      }
    }

    // 3. Parse dates - M/D/YY or M/D/YYYY format
    function parseDate(d: string): string | null {
      if (!d || d.trim() === '') return null;
      const parts = d.trim().split('/');
      if (parts.length !== 3) return null;
      let [m, day, y] = parts.map(Number);
      if (y < 100) {
        y = y >= 50 ? 1900 + y : 2000 + y;
      }
      const mm = String(m).padStart(2, '0');
      const dd = String(day).padStart(2, '0');
      return `${y}-${mm}-${dd}`;
    }

    // 4. Map result to status
    function mapStatus(result: string): string {
      const r = (result || '').toLowerCase().replace(/\s/g, '');
      if (r.includes('passed') || r.includes('paased')) return 'completed';
      if (r.includes('attendance')) return 'completed';
      if (r.includes('failed')) return 'failed';
      return 'enrolled';
    }

    // 5. Build insert rows
    const rows: any[] = [];
    let skipped = 0;

    for (const rec of records) {
      // Normalize emp code: emp0019 -> Emp0019
      const normalizedCode = rec.emp_code.toLowerCase();
      // Try multiple formats
      const empId = empMap.get(normalizedCode) 
        || empMap.get('emp' + normalizedCode.replace('emp', ''))
        || empMap.get(normalizedCode.replace('emp', 'emp'));
      
      if (!empId) {
        skipped++;
        continue;
      }

      const courseId = courseMap.get(rec.course_name.toLowerCase().trim()) || null;

      rows.push({
        employee_id: empId,
        course_id: courseId,
        start_date: parseDate(rec.start_date),
        end_date: parseDate(rec.end_date),
        planned_date: parseDate(rec.planned_date),
        status: mapStatus(rec.result),
        provider: rec.provider || null,
        location: rec.location || null,
        has_cert: rec.cert,
        has_cr: rec.cr,
        has_ss: rec.ss,
        has_cb: rec.cb,
        cost: 0,
        total_cost: 0,
      });
    }

    // 6. Batch insert
    let inserted = 0;
    let errors = 0;
    for (let i = 0; i < rows.length; i += 200) {
      const batch = rows.slice(i, i + 200);
      const { error } = await supabase.from("training_records").insert(batch);
      if (error) {
        console.error(`Batch ${i}-${i + batch.length} error:`, error.message);
        errors += batch.length;
      } else {
        inserted += batch.length;
      }
    }

    return new Response(
      JSON.stringify({ 
        total: records.length, 
        inserted, 
        skipped, 
        errors,
        employees_found: empMap.size,
        courses_found: courseMap.size,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: corsHeaders,
    });
  }
});
