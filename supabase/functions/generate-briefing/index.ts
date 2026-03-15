import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const VOICE_ID = "onwK4e9ZLuTAKqWW03F9"; // Daniel - professional German voice

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
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

    // Try recent posts first (last 48h), then fallback to newest 5
    const cutoff = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();
    let { data: posts } = await supabase
      .from("posts")
      .select("hook, content, metrics, content_category, type")
      .eq("user_id", userId)
      .eq("status", "analyzed")
      .gte("updated_at", cutoff)
      .order("updated_at", { ascending: false })
      .limit(5);

    let isRecent = true;

    if (!posts || posts.length === 0) {
      // Fallback: newest 5 analyzed posts without time filter
      const { data: fallbackPosts } = await supabase
        .from("posts")
        .select("hook, content, metrics, content_category, type")
        .eq("user_id", userId)
        .eq("status", "analyzed")
        .order("updated_at", { ascending: false })
        .limit(5);

      posts = fallbackPosts;
      isRecent = false;
    }

    if (!posts || posts.length === 0) {
      return new Response(JSON.stringify({ error: "Keine analysierten Posts vorhanden. Bitte zuerst Posts analysieren lassen." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Build briefing text from metrics
    let totalImpressions = 0, totalLikes = 0, totalComments = 0;
    let bestPost: any = null;
    let bestScore = 0;
    const whatWorked: string[] = [];
    const followUps: string[] = [];
    let engTotal = 0, engCount = 0;

    for (const p of posts) {
      const m = p.metrics as any;
      if (!m) continue;
      totalImpressions += Number(m.impressions || 0);
      totalLikes += Number(m.likes || 0);
      totalComments += Number(m.comments || 0);
      if (m.engagement_rate != null) {
        engTotal += Number(m.engagement_rate);
        engCount++;
      }
      const score = Number(m.score || 0);
      if (score > bestScore) {
        bestScore = score;
        bestPost = p;
      }
      if (m.what_worked) whatWorked.push(...m.what_worked);
      if (m.recommended_follow_ups) followUps.push(...m.recommended_follow_ups);
    }

    const avgEngagement = engCount > 0 ? Math.round((engTotal / engCount) * 10) / 10 : 0;
    const bestMetrics = bestPost?.metrics as any;

    const timeframeText = isRecent
      ? "In den letzten 24 Stunden"
      : "Basierend auf Ihren letzten analysierten Posts";

    const briefingText = `
Guten Morgen! Hier ist Ihr LinkedIn Performance Briefing.

${timeframeText} haben Ihre ${posts.length} analysierten Posts insgesamt ${totalImpressions} Impressions, ${totalLikes} Likes und ${totalComments} Kommentare generiert.

${bestPost ? `Ihr stärkster Post war "${bestPost.hook || bestPost.content?.substring(0, 60)}" mit einem Score von ${bestScore} von 100 und einer Engagement Rate von ${bestMetrics?.engagement_rate || 0} Prozent.` : ""}

${bestMetrics?.performance_summary ? `Die KI-Analyse sagt: ${bestMetrics.performance_summary}` : ""}

${whatWorked.length > 0 ? `Was besonders gut funktioniert hat: ${[...new Set(whatWorked)].slice(0, 3).join(", ")}.` : ""}

${followUps.length > 0 ? `Empfohlene nächste Themen: ${[...new Set(followUps)].slice(0, 2).join(" und ")}.` : ""}

Viel Erfolg mit Ihrem Content heute!
    `.trim().replace(/\n{3,}/g, "\n\n");

    // Generate TTS via ElevenLabs
    const ELEVENLABS_API_KEY = Deno.env.get("ELEVENLABS_API_KEY_1") || Deno.env.get("ELEVENLABS_API_KEY");
    if (!ELEVENLABS_API_KEY) {
      throw new Error("ELEVENLABS_API_KEY is not configured");
    }

    console.log("Generating TTS for briefing, text length:", briefingText.length);

    const ttsResponse = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}?output_format=mp3_44100_128`,
      {
        method: "POST",
        headers: {
          "xi-api-key": ELEVENLABS_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: briefingText,
          model_id: "eleven_multilingual_v2",
          voice_settings: {
            stability: 0.6,
            similarity_boost: 0.75,
            style: 0.3,
            speed: 1.0,
          },
        }),
      }
    );

    if (!ttsResponse.ok) {
      const errorBody = await ttsResponse.text();
      throw new Error(`ElevenLabs TTS failed [${ttsResponse.status}]: ${errorBody}`);
    }

    const audioBuffer = await ttsResponse.arrayBuffer();
    console.log("TTS audio generated, size:", audioBuffer.byteLength);

    // Upload to Supabase Storage using service role for storage access
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const fileName = `${userId}/briefing-${new Date().toISOString().split("T")[0]}.mp3`;

    const { error: uploadError } = await supabaseAdmin.storage
      .from("briefings")
      .upload(fileName, audioBuffer, {
        contentType: "audio/mpeg",
        upsert: true,
      });

    if (uploadError) {
      throw new Error(`Storage upload failed: ${uploadError.message}`);
    }

    const { data: urlData } = supabaseAdmin.storage
      .from("briefings")
      .getPublicUrl(fileName);

    console.log("Briefing uploaded:", urlData?.publicUrl);

    return new Response(
      JSON.stringify({
        success: true,
        audioUrl: urlData?.publicUrl,
        textSummary: briefingText,
        metrics: {
          impressions: totalImpressions,
          likes: totalLikes,
          comments: totalComments,
          engagementRate: avgEngagement,
          bestPostHook: bestPost?.hook || bestPost?.content?.substring(0, 60) || null,
          bestPostScore: bestScore,
          whatWorked: [...new Set(whatWorked)].slice(0, 3),
          recommendedFollowUps: [...new Set(followUps)].slice(0, 2),
          performanceSummary: bestMetrics?.performance_summary || null,
        },
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: unknown) {
    console.error("Error generating briefing:", error);
    const msg = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
