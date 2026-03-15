const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content:
              "Du bist ein LinkedIn-Content-Stratege. Generiere 3 kreative, abwechslungsreiche Inspirationsvorlagen für LinkedIn-Posts. Jede Vorlage soll ein passendes Emoji, einen kurzen Titel (max 4 Wörter) und einen Prompt-Satz enthalten, der als Ausgangspunkt für einen Post dient. Variiere zwischen verschiedenen Content-Typen wie Storytelling, Meinungsbeitrag, Lessons Learned, Behind-the-Scenes, Kontroverse These, Karriere-Tipp etc.",
          },
          {
            role: "user",
            content: "Generiere 3 neue, kreative LinkedIn-Inspirationsvorlagen.",
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "return_templates",
              description: "Gibt 3 Inspirationsvorlagen zurück.",
              parameters: {
                type: "object",
                properties: {
                  templates: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        emoji: { type: "string", description: "Ein einzelnes passendes Emoji" },
                        label: { type: "string", description: "Kurzer Titel, max 4 Wörter" },
                        prompt: { type: "string", description: "Ein Satz als Post-Ausgangspunkt" },
                      },
                      required: ["emoji", "label", "prompt"],
                      additionalProperties: false,
                    },
                  },
                },
                required: ["templates"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "return_templates" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit erreicht. Bitte versuche es gleich nochmal." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI-Credits aufgebraucht." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall?.function?.arguments) {
      throw new Error("No tool call in AI response");
    }

    const parsed = JSON.parse(toolCall.function.arguments);
    return new Response(JSON.stringify({ templates: parsed.templates }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("Error generating templates:", error);
    const msg = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
