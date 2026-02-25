import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, password, full_name, role, station_code, employee_code } = await req.json();

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Create auth user
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name },
    });

    if (authError) {
      return new Response(JSON.stringify({ error: authError.message }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const userId = authData.user.id;

    // Build role record
    let stationId: string | null = null;
    let employeeId: string | null = null;

    if (role === 'station_manager' && station_code) {
      const { data: station } = await supabaseAdmin
        .from('stations')
        .select('id')
        .eq('code', station_code)
        .single();
      stationId = station?.id || null;
    }

    if (role === 'employee' && employee_code) {
      const { data: emp } = await supabaseAdmin
        .from('employees')
        .select('id')
        .eq('employee_code', employee_code)
        .single();
      employeeId = emp?.id || null;

      // Link user to employee
      if (employeeId) {
        await supabaseAdmin
          .from('employees')
          .update({ user_id: userId })
          .eq('id', employeeId);
      }
    }

    // Insert role
    const { error: roleError } = await supabaseAdmin
      .from('user_roles')
      .insert({
        user_id: userId,
        role,
        station_id: stationId,
        employee_id: employeeId,
      });

    if (roleError) {
      return new Response(JSON.stringify({ error: roleError.message }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ success: true, user_id: userId }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
