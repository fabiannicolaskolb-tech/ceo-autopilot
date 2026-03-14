import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate callback secret
    const callbackSecret = Deno.env.get("N8N_CALLBACK_SECRET");
    if (!callbackSecret) {
      throw new Error("N8N_CALLBACK_SECRET is not configured");
    }

    const body = await req.json();
    const { secret, postId, status, linkedin_post_id, metrics } = body;

    if (secret !== callbackSecret) {
      return new Response(JSON.stringify({ error: "Invalid callback secret" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!postId) {
      return new Response(JSON.stringify({ error: "postId is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Use service role to update post (n8n callback has no user session)
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (status) updateData.status = status;
    if (linkedin_post_id) updateData.linkedin_post_id = linkedin_post_id;
    if (metrics) updateData.metrics = metrics;

    const { error } = await supabase
      .from("posts")
      .update(updateData)
      .eq("id", postId);

    if (error) {
      throw new Error(`Failed to update post: ${error.message}`);
    }

    console.log(`n8n callback: Post ${postId} updated`, updateData);

    return new Response(
      JSON.stringify({ success: true, postId }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: unknown) {
    console.error("n8n callback error:", error);
    const msg = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
