import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error("No authorization header provided");
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      console.error("Authentication failed:", authError?.message);
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check if user is admin (only admins can generate school reports)
    const { data: userRole } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (!userRole || userRole.role !== 'admin') {
      console.error("User is not authorized to generate school reports:", user.id);
      return new Response(JSON.stringify({ error: "Forbidden: Only admins can generate school reports" }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Authenticated admin user: ${user.id}`);

    const { schoolData, reportMonth } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const systemPrompt = `You are an educational AI analyst generating comprehensive school health reports.

Generate a detailed monthly report with:
1. Executive Summary (2-3 sentences)
2. Attendance Analysis
   - Overall rate
   - Trends (improving/declining)
   - Classes with concerns
3. Academic Performance
   - Subject-wise analysis
   - Top performing areas
   - Areas needing attention
4. Student Engagement
   - Homework completion rates
   - Active participation metrics
5. Key Insights (3-5 bullet points)
6. Actionable Recommendations (3-5 specific suggestions)
7. Risk Alerts (students/classes needing immediate attention)

Return a JSON object with: summary, attendance_analysis, academic_performance, engagement, insights, recommendations, risk_alerts, overall_health_score (0-100)`;

    const userPrompt = `Generate a school health report for ${reportMonth}:

SCHOOL: ${schoolData.name}
TOTAL STUDENTS: ${schoolData.totalStudents}
TOTAL TEACHERS: ${schoolData.totalTeachers}
CLASSES: ${schoolData.classes?.join(', ') || 'N/A'}

ATTENDANCE DATA:
- Overall Rate: ${schoolData.attendance?.overallRate || 0}%
- Total Present Days: ${schoolData.attendance?.totalPresent || 0}
- Total Absent Days: ${schoolData.attendance?.totalAbsent || 0}
${schoolData.attendance?.byClass?.map((c: any) => `- ${c.class}: ${c.rate}%`).join('\n') || ''}

EXAM PERFORMANCE:
${schoolData.exams?.bySubject?.map((s: any) => `- ${s.subject}: Avg ${s.average}%`).join('\n') || 'No exam data'}

HOMEWORK STATS:
- Total Assigned: ${schoolData.homework?.total || 0}
- Completion Rate: ${schoolData.homework?.completionRate || 0}%
- On-Time Submissions: ${schoolData.homework?.onTimeRate || 0}%

AT-RISK STUDENTS: ${schoolData.atRiskCount || 0}

Return ONLY a valid JSON object.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'Payment required' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';
    
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid AI response format');
    }
    
    const report = JSON.parse(jsonMatch[0]);
    
    console.log('School health report generated by admin:', user.id, 'for:', schoolData.name);

    return new Response(JSON.stringify(report), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-school-report:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
