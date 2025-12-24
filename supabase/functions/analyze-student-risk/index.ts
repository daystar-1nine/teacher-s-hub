import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { studentData } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const systemPrompt = `You are an educational AI assistant that analyzes student performance data to identify at-risk students.
    
Analyze the provided student data and return a JSON object with:
- risk_level: "low", "medium", or "high"
- risk_score: 0-100 (higher = more at risk)
- factors: array of risk factors identified (e.g., "Low attendance rate", "Declining exam scores")
- recommendations: array of actionable recommendations for teachers

Be specific and teacher-friendly in your explanations. Focus on:
1. Attendance patterns (absences, late arrivals)
2. Exam performance trends
3. Homework completion rates
4. Overall engagement indicators`;

    const userPrompt = `Analyze this student's data and identify risk factors:

Student: ${studentData.name}
Class: ${studentData.class_name}

Attendance Data:
- Total Days: ${studentData.attendance?.total || 0}
- Present: ${studentData.attendance?.present || 0}
- Absent: ${studentData.attendance?.absent || 0}
- Attendance Rate: ${studentData.attendance?.rate || 0}%

Exam Results:
${studentData.exams?.map((e: any) => `- ${e.subject}: ${e.percentage}% (${e.grade || 'N/A'})`).join('\n') || 'No exam data'}

Homework:
- Total Assigned: ${studentData.homework?.total || 0}
- Submitted: ${studentData.homework?.submitted || 0}
- Late Submissions: ${studentData.homework?.late || 0}
- Completion Rate: ${studentData.homework?.completion_rate || 0}%

Return ONLY a valid JSON object with risk_level, risk_score, factors, and recommendations.`;

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
    
    // Extract JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid AI response format');
    }
    
    const riskAnalysis = JSON.parse(jsonMatch[0]);
    
    console.log('Risk analysis completed for student:', studentData.name);

    return new Response(JSON.stringify(riskAnalysis), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in analyze-student-risk:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
