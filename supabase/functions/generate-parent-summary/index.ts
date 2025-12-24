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
    const { studentData, periodStart, periodEnd } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const systemPrompt = `You are an educational AI assistant that creates comprehensive, parent-friendly academic summaries.
    
Generate a detailed summary that includes:
1. Overall Performance Overview
2. Attendance Summary with percentage
3. Subject-wise Exam Performance
4. Homework Completion Analysis
5. Key Strengths (3-5 bullet points)
6. Areas for Improvement (3-5 bullet points)
7. Teacher Recommendations

Return a JSON object with these sections. Be encouraging but honest. Use simple language parents can understand.`;

    const userPrompt = `Create an academic summary for this student:

Student: ${studentData.name}
Class: ${studentData.class_name}
Period: ${periodStart} to ${periodEnd}

ATTENDANCE:
- Total School Days: ${studentData.attendance?.total || 0}
- Days Present: ${studentData.attendance?.present || 0}
- Days Absent: ${studentData.attendance?.absent || 0}
- Attendance Percentage: ${studentData.attendance?.rate || 0}%

EXAM RESULTS:
${studentData.exams?.map((e: any) => 
  `- ${e.exam_name} (${e.subject}): ${e.marks_obtained}/${e.total_marks} = ${e.percentage}% [${e.grade || 'N/A'}]`
).join('\n') || 'No exam data available'}

HOMEWORK:
- Total Assignments: ${studentData.homework?.total || 0}
- Submitted On Time: ${studentData.homework?.on_time || 0}
- Late Submissions: ${studentData.homework?.late || 0}
- Not Submitted: ${studentData.homework?.missing || 0}

TEACHER FEEDBACK:
${studentData.feedback?.map((f: any) => `- ${f.content}`).join('\n') || 'No specific feedback'}

Return ONLY a valid JSON object with: overview, attendance_summary, exam_performance, homework_analysis, strengths, improvements, recommendations`;

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
    
    const summary = JSON.parse(jsonMatch[0]);
    
    console.log('Parent summary generated for student:', studentData.name);

    return new Response(JSON.stringify(summary), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-parent-summary:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
