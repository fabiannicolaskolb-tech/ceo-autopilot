const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { linkedin_url } = await req.json();

    if (!linkedin_url) {
      return new Response(
        JSON.stringify({ error: 'linkedin_url is required' }),
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

    // Normalize LinkedIn URL
    let profileUrl = linkedin_url.trim();
    if (!profileUrl.startsWith('http')) {
      profileUrl = `https://${profileUrl}`;
    }

    console.log('Scraping LinkedIn profile:', profileUrl);

    // Start Apify actor run (LinkedIn Profile Scraper)
    const runResponse = await fetch(
      `https://api.apify.com/v2/acts/curious_coder~linkedin-profile-scraper/run-sync-get-dataset-items?token=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          urls: [profileUrl],
        }),
      }
    );

    if (!runResponse.ok) {
      const errorText = await runResponse.text();
      console.error('Apify error:', errorText);
      return new Response(
        JSON.stringify({ error: `Apify request failed (${runResponse.status}): ${errorText}` }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const results = await runResponse.json();
    const profileData = results?.[0] || null;

    if (!profileData) {
      return new Response(
        JSON.stringify({ error: 'No profile data returned from Apify' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Extract relevant fields
    const extracted = {
      name: profileData.fullName || (profileData.firstName && profileData.lastName
        ? `${profileData.firstName || ''} ${profileData.lastName || ''}`.trim()
        : null),
      company: profileData.company?.name || profileData.positions?.[0]?.companyName || profileData.companyName || null,
      role: profileData.headline || profileData.positions?.[0]?.title || profileData.title || null,
      industry: profileData.industry || profileData.industryName || null,
      bio: profileData.summary || profileData.about || profileData.description || null,
      profile_image_url: profileData.profilePicture || profileData.photo || profileData.profilePicUrl || profileData.avatar || null,
      recent_posts: (profileData.posts || profileData.activities || []).slice(0, 10),
    };

    console.log('Extracted profile data:', JSON.stringify(extracted, null, 2));

    // If user_id provided, save profile data to profiles table
    const body = await req.clone().json().catch(() => ({}));
    const userId = body.user_id;
    if (userId && (extracted.bio || extracted.profile_image_url || extracted.name)) {
      try {
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
        const supabase = createClient(supabaseUrl, serviceRoleKey);

        const updates: Record<string, string> = {};
        if (extracted.bio) updates.bio = extracted.bio;
        if (extracted.profile_image_url) updates.avatar_url_1 = extracted.profile_image_url;
        if (extracted.name) updates.name = extracted.name;
        if (extracted.company) updates.company = extracted.company;
        if (extracted.role) updates.role = extracted.role;
        if (extracted.industry) updates.industry = extracted.industry;

        if (Object.keys(updates).length > 0) {
          const { error: updateError } = await supabase
            .from('profiles')
            .update(updates)
            .eq('id', userId);
          if (updateError) {
            console.error('Failed to update profile:', updateError.message);
          } else {
            console.log('Profile updated with scraped data');
          }
        }
      } catch (e) {
        console.error('Error updating profile:', e);
      }
    }

    return new Response(
      JSON.stringify(extracted),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error scraping LinkedIn:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
