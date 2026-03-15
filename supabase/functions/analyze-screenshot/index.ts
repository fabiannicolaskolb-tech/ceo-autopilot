import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { base64Image, postText } = await req.json();
    
    if (!base64Image) {
      return new Response(JSON.stringify({ error: "No image provided" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "LOVABLE_API_KEY not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `You extract LinkedIn post analytics from screenshots. Use the extract_metrics tool to return the structured data.`,
          },
          {
            role: "user",
            content: [
              {
                type: "image_url",
                image_url: { url: `data:image/png;base64,${base64Image}` },
              },
              {
                type: "text",
                text: `Extract the LinkedIn analytics metrics from this screenshot.${postText ? ` The post text starts with: "${postText.substring(0, 100)}..."` : ""}`,
              },
            ],
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "extract_metrics",
              description: "Extract LinkedIn post analytics metrics from a screenshot",
              parameters: {
                type: "object",
                properties: {
                  impressions: { type: "number", description: "Number of impressions/views" },
                  likes: { type: "number", description: "Number of likes/reactions" },
                  comments: { type: "number", description: "Number of comments" },
                  shares: { type: "number", description: "Number of reposts/shares" },
                  clicks: { type: "number", description: "Number of clicks" },
                  engagement_rate: { type: "number", description: "Engagement rate as percentage, calculated as (likes+comments+shares)/impressions*100" },
                  extraction_confidence: { type: "number", description: "Confidence score 0.0-1.0" },
                  notes: { type: "string", description: "Any issues or observations about the extraction" },
                },
                required: ["impressions", "likes", "comments", "shares", "clicks", "engagement_rate", "extraction_confidence", "notes"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "extract_metrics" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded, please try again later." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required, please add credits." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI analysis failed" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    
    if (!toolCall) {
      return new Response(JSON.stringify({ error: "No metrics extracted" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const metrics = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify(metrics), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("analyze-screenshot error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
