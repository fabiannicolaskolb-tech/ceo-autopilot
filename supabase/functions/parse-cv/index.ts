import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { getDocument } from "npm:pdfjs-dist@4.10.38/legacy/build/pdf.mjs";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const sanitizeText = (value: string) =>
  value.replace(/[^\x20-\x7E\xC0-\xFF\n\r\t äöüÄÖÜß]/g, " ").replace(/\s{2,}/g, " ").trim();

async function extractPdfText(bytes: Uint8Array): Promise<string> {
  const loadingTask = getDocument({ data: bytes, isEvalSupported: false, useWorkerFetch: false });
  const pdf = await loadingTask.promise;
  const maxPages = Math.min(pdf.numPages, 10);
  const chunks: string[] = [];

  for (let pageNumber = 1; pageNumber <= maxPages; pageNumber++) {
    const page = await pdf.getPage(pageNumber);
    const textContent = await page.getTextContent();
    const pageText = textContent.items
      .map((item: { str?: string }) => item.str ?? "")
      .join(" ");
    if (pageText) chunks.push(pageText);
  }

  return sanitizeText(chunks.join("\n"));
}

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

    const arrayBuffer = await file.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);
    const fileName = file.name.toLowerCase();
    const mimeType = (file.type || "").toLowerCase();

    const isTextFile = fileName.endsWith(".txt") || fileName.endsWith(".md");
    const isPdfFile = fileName.endsWith(".pdf") || mimeType.includes("pdf");

    let textContent = "";

    if (isTextFile) {
      textContent = sanitizeText(new TextDecoder().decode(bytes));
    } else if (isPdfFile) {
      try {
        textContent = await extractPdfText(bytes);
      } catch (pdfError) {
        console.error("PDF extraction failed:", pdfError);
      }
    }

    if (!textContent) {
      try {
        textContent = sanitizeText(new TextDecoder().decode(bytes));
      } catch {
        textContent = "";
      }
    }

    if (!textContent || textContent.length < 40) {
      return new Response(
        JSON.stringify({ error: "Could not extract enough text from this file. Please use a text-based PDF or TXT file." }),
        { status: 422, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
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
              "You are a CV/resume parser. Extract structured information from the provided CV text. Always call the extract_cv_data tool with the extracted information. If a field is not found, use an empty string. For professional_context, write a comprehensive German-language summary (300-500 words) covering: Kernkompetenzen, relevante Berufserfahrung, bemerkenswerte Erfolge, and Fachgebiete. This context will be used for LinkedIn content generation.",
          },
          {
            role: "user",
            content: `Extract the person's name, company, job title/role, industry, and a comprehensive professional context summary from this CV:\n\n${textContent.slice(0, 12000)}`,
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
                  professional_context: { type: "string", description: "Comprehensive professional summary in German (300-500 words) covering: Kernkompetenzen, relevante Berufserfahrung, bemerkenswerte Erfolge, Fachgebiete. This will be used as context for LinkedIn content generation." },
                },
                required: ["name", "company", "role", "industry", "professional_context"],
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
