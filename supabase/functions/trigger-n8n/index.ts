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
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = claimsData.claims.sub;

    // Get request body
    const { postId, action } = await req.json();

    if (!postId) {
      return new Response(JSON.stringify({ error: "postId is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch the post to send to n8n
    const { data: post, error: postError } = await supabase
      .from("posts")
      .select("*")
      .eq("id", postId)
      .eq("user_id", userId)
      .single();

    if (postError || !post) {
      return new Response(JSON.stringify({ error: "Post not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get n8n webhook URL
    const n8nWebhookUrl = Deno.env.get("N8N_WEBHOOK_URL");
    if (!n8nWebhookUrl) {
      throw new Error("N8N_WEBHOOK_URL is not configured");
    }

    const callbackSecret = Deno.env.get("N8N_CALLBACK_SECRET");
    const callbackUrl = `${Deno.env.get("SUPABASE_URL")}/functions/v1/n8n-callback`;

    // Trigger n8n workflow
    const n8nResponse = await fetch(n8nWebhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: action || "publish",
        post: {
          id: post.id,
          content: post.content,
          hook: post.hook,
          type: post.type,
          angle: post.angle,
          scheduled_at: post.scheduled_at,
          status: post.status,
        },
        userId,
        callbackUrl,
        callbackSecret,
      }),
    });

    if (!n8nResponse.ok) {
      const errorBody = await n8nResponse.text();
      throw new Error(`n8n webhook failed [${n8nResponse.status}]: ${errorBody}`);
    }

    const n8nResult = await n8nResponse.json().catch(() => ({}));

    // Update post status
    await supabase
      .from("posts")
      .update({ status: "scheduled", updated_at: new Date().toISOString() })
      .eq("id", postId);

    return new Response(
      JSON.stringify({ success: true, n8nResponse: n8nResult }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: unknown) {
    console.error("Error triggering n8n:", error);
    const msg = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
