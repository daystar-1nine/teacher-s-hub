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

    // Check if user is teacher or admin (only they can generate question papers)
    const { data: userRole } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (!userRole || (userRole.role !== 'teacher' && userRole.role !== 'admin')) {
      console.error("User is not authorized to generate question papers:", user.id);
      return new Response(JSON.stringify({ error: "Forbidden: Only teachers and admins can generate question papers" }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Authenticated user: ${user.id} with role: ${userRole.role}`);

    const { subject, topic, className, difficulty, totalMarks, questionTypes } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const systemPrompt = `You are an expert educational content creator. Generate exam questions based on the given parameters.

For each question, include:
- question: The question text
- type: "mcq", "short", or "long"
- marks: Points for this question
- options: Array of 4 options (for MCQs only)
- correct_answer: The correct answer
- explanation: Brief explanation of the answer

Ensure questions are:
1. Age and grade appropriate
2. Clear and unambiguous
3. Progressively challenging
4. Covering key concepts of the topic

Return a JSON object with a "questions" array.`;

    const mcqCount = questionTypes?.mcq || 10;
    const shortCount = questionTypes?.short || 5;
    const longCount = questionTypes?.long || 2;

    const userPrompt = `Generate a ${difficulty} difficulty question paper for:

Subject: ${subject}
Topic: ${topic || 'General'}
Class: ${className}
Total Marks: ${totalMarks || 100}

Question Distribution:
- MCQs (Multiple Choice): ${mcqCount} questions (1-2 marks each)
- Short Answer: ${shortCount} questions (3-5 marks each)
- Long Answer: ${longCount} questions (8-10 marks each)

Difficulty Level: ${difficulty}
- Easy: Basic recall and understanding
- Medium: Application and analysis
- Hard: Synthesis, evaluation, and complex problem-solving

Return ONLY a valid JSON object with a "questions" array containing all questions with their type, marks, options (for MCQs), correct_answer, and explanation.`;

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
    
    const paper = JSON.parse(jsonMatch[0]);
    
    console.log('Question paper generated by user:', user.id, 'for:', subject, topic, difficulty);

    return new Response(JSON.stringify(paper), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-question-paper:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
