import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
    // Authenticate user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    if (userError || !userData?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = userData.user.id;

    // Get request body
    const { input, profile } = await req.json();

    if (!input?.trim()) {
      return new Response(JSON.stringify({ error: "input is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get n8n webhook URL
    const n8nWebhookUrl = Deno.env.get("N8N_WEBHOOK_URL");
    if (!n8nWebhookUrl) {
      throw new Error("N8N_WEBHOOK_URL is not configured");
    }

    // Send to n8n
    const n8nResponse = await fetch(n8nWebhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "ideate",
        input,
        userId,
        profile: profile || {},
      }),
    });

    if (!n8nResponse.ok) {
      const errorBody = await n8nResponse.text();
      throw new Error(`n8n webhook failed [${n8nResponse.status}]: ${errorBody}`);
    }

    const responseText = await n8nResponse.text();
    
    if (!responseText || responseText.trim().length === 0) {
      throw new Error("n8n returned an empty response");
    }

    let concepts: unknown;
    try {
      concepts = JSON.parse(responseText);
    } catch {
      // Attempt to recover truncated JSON arrays
      const lastBrace = responseText.lastIndexOf("}");
      if (lastBrace > 0) {
        try {
          concepts = JSON.parse(responseText.substring(0, lastBrace + 1) + "]");
          console.warn("Recovered truncated JSON from n8n response");
        } catch {
          console.error("Raw n8n response (first 500 chars):", responseText.substring(0, 500));
          throw new Error("n8n returned invalid JSON");
        }
      } else {
        console.error("Raw n8n response (first 500 chars):", responseText.substring(0, 500));
        throw new Error("n8n returned invalid JSON");
      }
    }

    return new Response(JSON.stringify({ concepts }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("Error generating ideas:", error);
    const msg = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
