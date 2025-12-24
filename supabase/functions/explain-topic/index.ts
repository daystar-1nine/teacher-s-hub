import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { topic, mode } = await req.json();
    
    if (!topic) {
      return new Response(JSON.stringify({ error: "Topic is required" }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      return new Response(JSON.stringify({ error: "AI service not configured" }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Generating explanation for topic: "${topic}" in mode: "${mode}"`);

    const modeInstructions = {
      beginner: "Explain in very simple terms suitable for a young student. Use everyday analogies, avoid jargon, and make it fun and engaging.",
      intermediate: "Provide a detailed explanation with historical context, real-world applications, and connections to related concepts. Suitable for high school students.",
      "exam-focused": "Focus on key definitions, important formulas, exam tips, common question patterns, and memory techniques. Format with clear headings and bullet points."
    };

    const systemPrompt = `You are an expert educational AI tutor helping students understand various topics. You provide clear, accurate, and engaging explanations.

Your response MUST be a valid JSON object with this exact structure:
{
  "explanation": "A comprehensive explanation of the topic (2-3 paragraphs)",
  "examples": ["Example 1 with practical application", "Example 2 with real-world context", "Example 3 showing the concept in action"],
  "steps": ["Step 1: First learning action", "Step 2: Second learning action", "Step 3: Third learning action", "Step 4: Fourth learning action", "Step 5: Final mastery step"]
}

Mode instructions: ${modeInstructions[mode as keyof typeof modeInstructions] || modeInstructions.beginner}

Important:
- The explanation should be educational and accurate
- Provide exactly 3 diverse examples
- Provide exactly 5 actionable learning steps
- Make content appropriate for the selected difficulty level
- Return ONLY valid JSON, no markdown or other formatting`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Please explain this topic: ${topic}` }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        console.error("Rate limit exceeded");
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        console.error("Payment required");
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds to continue." }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "Failed to generate explanation" }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    if (!content) {
      console.error("No content in AI response");
      return new Response(JSON.stringify({ error: "No response from AI" }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log("Raw AI response:", content);

    // Parse the JSON response
    let parsedContent;
    try {
      // Clean up the response - remove markdown code blocks if present
      let cleanContent = content.trim();
      if (cleanContent.startsWith("```json")) {
        cleanContent = cleanContent.slice(7);
      } else if (cleanContent.startsWith("```")) {
        cleanContent = cleanContent.slice(3);
      }
      if (cleanContent.endsWith("```")) {
        cleanContent = cleanContent.slice(0, -3);
      }
      cleanContent = cleanContent.trim();
      
      parsedContent = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error("Failed to parse AI response as JSON:", parseError);
      // Fallback: use the raw content as explanation
      parsedContent = {
        explanation: content,
        examples: ["See the explanation above for examples."],
        steps: ["Read the explanation carefully.", "Take notes on key concepts.", "Practice with related problems."]
      };
    }

    console.log("Successfully generated explanation for:", topic);

    return new Response(JSON.stringify({
      topic,
      mode,
      explanation: parsedContent.explanation,
      examples: parsedContent.examples,
      steps: parsedContent.steps,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error("Error in explain-topic function:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
