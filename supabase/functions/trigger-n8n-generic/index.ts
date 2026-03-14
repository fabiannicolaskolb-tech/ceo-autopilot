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
    // Parse optional body overrides
    let bodyOverrides: Record<string, unknown> = {};
    try {
      bodyOverrides = await req.json();
    } catch {
      // no body is fine
    }

    const requestId = bodyOverrides.request_id || crypto.randomUUID();
    const userId = bodyOverrides.user_id || "anonymous";

    const payload = {
      user_id: userId,
      request_id: requestId,
      command: bodyOverrides.command || "orchestrate",
      stage: "started",
      cycle_number: bodyOverrides.cycle_number || 1,
      started_at: new Date().toISOString(),
    };

    const n8nResponse = await fetch("https://n8n.thinc.de/webhook/orchestrate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!n8nResponse.ok) {
      const errorBody = await n8nResponse.text();
      throw new Error(`n8n webhook failed [${n8nResponse.status}]: ${errorBody}`);
    }

    const result = await n8nResponse.json().catch(() => ({}));

    return new Response(JSON.stringify({ success: true, result }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("Error triggering n8n:", error);
    const msg = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
