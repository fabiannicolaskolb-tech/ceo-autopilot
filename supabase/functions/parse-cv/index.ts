import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) {
      return new Response(JSON.stringify({ error: "No file provided" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Read file content
    const arrayBuffer = await file.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);

    // For PDF files, send as base64 to vision model; for text files, decode directly
    const fileName = file.name.toLowerCase();
    let textContent = "";
    const isTextFile = fileName.endsWith(".txt") || fileName.endsWith(".md");

    if (isTextFile) {
      textContent = new TextDecoder().decode(bytes);
    } else {
      // For PDF/DOCX, encode as base64 and use as context
      const base64 = btoa(String.fromCharCode(...bytes));
      // We'll pass raw text extraction attempt + base64 hint
      try {
        textContent = new TextDecoder().decode(bytes);
        // Filter out non-printable characters for a rough text extraction
        textContent = textContent.replace(/[^\x20-\x7E\xC0-\xFF\n\r\t äöüÄÖÜß]/g, " ").replace(/\s{3,}/g, " ");
      } catch {
        textContent = "";
      }
    }

    if (!textContent || textContent.trim().length < 20) {
      return new Response(
        JSON.stringify({ error: "Could not extract text from this file. Please use a .txt or text-based PDF." }),
        { status: 422, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Use Lovable AI Gateway with tool calling for structured extraction
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
              "You are a CV/resume parser. Extract structured information from the provided CV text. Always call the extract_cv_data tool with the extracted information. If a field is not found, use an empty string.",
          },
          {
            role: "user",
            content: `Extract the person's name, company, job title/role, and industry from this CV:\n\n${textContent.slice(0, 8000)}`,
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "extract_cv_data",
              description: "Extract structured data from a CV/resume",
              parameters: {
                type: "object",
                properties: {
                  name: { type: "string", description: "Full name of the person" },
                  company: { type: "string", description: "Current or most recent company/employer" },
                  role: { type: "string", description: "Current or most recent job title/position" },
                  industry: { type: "string", description: "Industry or field of work" },
                },
                required: ["name", "company", "role", "industry"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "extract_cv_data" } },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("AI gateway error:", response.status, errText);
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded, please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required, please add credits." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error("AI gateway error: " + response.status);
    }

    const result = await response.json();
    const toolCall = result.choices?.[0]?.message?.tool_calls?.[0];

    if (!toolCall?.function?.arguments) {
      throw new Error("No structured data returned from AI");
    }

    const extracted = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify(extracted), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("parse-cv error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
