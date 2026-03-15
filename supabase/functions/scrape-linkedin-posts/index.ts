const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { linkedin_url, user_id } = await req.json();

    if (!linkedin_url || !user_id) {
      return new Response(
        JSON.stringify({ error: 'linkedin_url and user_id are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const apiKey = Deno.env.get('APIFY_API_KEY');
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'APIFY_API_KEY not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Normalize LinkedIn URL
    let profileUrl = linkedin_url.trim();
    if (!profileUrl.startsWith('http')) {
      profileUrl = `https://${profileUrl}`;
    }

    console.log('Scraping LinkedIn posts for:', profileUrl);

    // Use Apify LinkedIn Posts Scraper
    const runResponse = await fetch(
      `https://api.apify.com/v2/acts/apifly~linkedin-post-scraper/run-sync-get-dataset-items?token=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profileUrls: [profileUrl],
          maxPosts: 50,
        }),
      }
    );

    if (!runResponse.ok) {
      const errorText = await runResponse.text();
      console.error('Apify error:', errorText);
      
      // Fallback: try alternative actor
      console.log('Trying fallback actor...');
      const fallbackResponse = await fetch(
        `https://api.apify.com/v2/acts/curious_coder~linkedin-post-scraper/run-sync-get-dataset-items?token=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            urls: [profileUrl],
            limitPerProfile: 50,
          }),
        }
      );

      if (!fallbackResponse.ok) {
        const fallbackError = await fallbackResponse.text();
        console.error('Fallback Apify error:', fallbackError);
        return new Response(
          JSON.stringify({ error: `Apify request failed: ${fallbackError}` }),
          { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const fallbackResults = await fallbackResponse.json();
      return await processAndUpsertPosts(supabase, fallbackResults, user_id);
    }

    const results = await runResponse.json();
    return await processAndUpsertPosts(supabase, results, user_id);

  } catch (error) {
    console.error('Error scraping LinkedIn posts:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function processAndUpsertPosts(supabase: any, results: any[], userId: string) {
  if (!results || results.length === 0) {
    return new Response(
      JSON.stringify({ imported: 0, message: 'No posts found' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  console.log(`Processing ${results.length} posts from Apify`);

  let imported = 0;
  let skipped = 0;

  for (const post of results) {
    try {
      // Extract a stable post ID from various possible fields
      const linkedinPostId = post.postId || post.id || post.urn || post.postUrl || null;
      
      if (!linkedinPostId) {
        console.log('Skipping post without ID');
        skipped++;
        continue;
      }

      // Check for duplicate
      const { data: existing } = await supabase
        .from('posts')
        .select('id')
        .eq('user_id', userId)
        .eq('linkedin_post_id', String(linkedinPostId))
        .maybeSingle();

      if (existing) {
        // Update metrics for existing post
        const metrics = extractMetrics(post);
        await supabase
          .from('posts')
          .update({ metrics, status: 'posted' })
          .eq('id', existing.id);
        skipped++;
        continue;
      }

      // Extract content and hook
      const content = post.text || post.content || post.commentary || '';
      const hook = content.split('\n')[0]?.slice(0, 200) || null;

      // Extract post date
      const postedAt = post.postedAt || post.publishedAt || post.date || post.createdAt || null;

      // Extract metrics
      const metrics = extractMetrics(post);

      // Determine content type
      const type = post.type || post.postType || (post.images?.length ? 'image' : post.video ? 'video' : 'text');

      const { error } = await supabase.from('posts').insert({
        user_id: userId,
        linkedin_post_id: String(linkedinPostId),
        content,
        hook,
        posted_at: postedAt ? new Date(postedAt).toISOString() : new Date().toISOString(),
        status: 'posted',
        type,
        metrics,
      });

      if (error) {
        console.error('Insert error for post:', linkedinPostId, error.message);
        skipped++;
      } else {
        imported++;
      }
    } catch (e) {
      console.error('Error processing post:', e);
      skipped++;
    }
  }

  console.log(`Import complete: ${imported} imported, ${skipped} skipped/updated`);

  return new Response(
    JSON.stringify({ imported, skipped, total: results.length }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

function extractMetrics(post: any) {
  return {
    likes: post.likes || post.numLikes || post.likeCount || 0,
    comments: post.comments || post.numComments || post.commentCount || 0,
    shares: post.shares || post.numShares || post.shareCount || post.reposts || post.numReposts || 0,
    impressions: post.impressions || post.views || post.numViews || 0,
    engagement_rate: post.engagementRate || post.engagement_rate || null,
  };
}
