import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js";

// ============================================
// 1. usePipelineStatus — Live pipeline stage
// ============================================

interface PipelineState {
  id: string;
  user_id: string;
  request_id: string;
  command: string;
  stage: string;
  cycle_number: number;
  started_at: string;
  completed_at: string | null;
  result_summary: string | null;
  error_message: string | null;
}

export function usePipelineStatus(userId: string | undefined) {
  const [pipeline, setPipeline] = useState<PipelineState | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    const fetchLatest = async () => {
      const { data } = await supabase
        .from("pipeline_state")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (data) setPipeline(data as PipelineState);
      setLoading(false);
    };
    fetchLatest();

    const channel = supabase
      .channel("pipeline-status")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "pipeline_state",
          filter: `user_id=eq.${userId}`,
        },
        (payload: RealtimePostgresChangesPayload<PipelineState>) => {
          if (payload.new && "id" in payload.new) {
            setPipeline(payload.new as PipelineState);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  return { pipeline, loading };
}

// ============================================
// 2. useGeneratedIdeas — Live ideation results
// ============================================

interface GeneratedIdea {
  id: string;
  user_id: string;
  request_id: string | null;
  ideas: Array<{
    rank: number;
    hook: string;
    angle: string;
    content_type: string;
    target_audience: string;
    topic: string;
    predicted_engagement: string;
    reasoning: string;
  }>;
  raw_experience: string;
  cycle_number: number;
  strategy_note: string | null;
  status: string;
  created_at: string;
}

export function useGeneratedIdeas(userId: string | undefined) {
  const [ideas, setIdeas] = useState<GeneratedIdea[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    const fetchIdeas = async () => {
      const { data } = await supabase
        .from("generated_ideas")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(10);

      if (data) setIdeas(data as GeneratedIdea[]);
      setLoading(false);
    };
    fetchIdeas();

    const channel = supabase
      .channel("generated-ideas")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "generated_ideas",
          filter: `user_id=eq.${userId}`,
        },
        (payload: RealtimePostgresChangesPayload<GeneratedIdea>) => {
          if (payload.new && "id" in payload.new) {
            setIdeas((prev) => [payload.new as GeneratedIdea, ...prev]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  return { ideas, loading };
}

// ============================================
// 3. usePosts — Live post updates
// ============================================

interface Post {
  id: string;
  user_id: string;
  content: string | null;
  hook: string | null;
  angle: string | null;
  type: string | null;
  status: string;
  scheduled_at: string | null;
  posted_at: string | null;
  linkedin_post_id: string | null;
  metrics: Record<string, unknown>;
  image_url: string | null;
  hashtags: string[];
  confidence_score: number | null;
  content_category: string | null;
  created_at: string;
  updated_at: string;
}

export function usePosts(userId: string | undefined) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    const fetchPosts = async () => {
      const { data } = await supabase
        .from("posts")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (data) setPosts(data as Post[]);
      setLoading(false);
    };
    fetchPosts();

    const channel = supabase
      .channel("posts-live")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "posts",
          filter: `user_id=eq.${userId}`,
        },
        (payload: RealtimePostgresChangesPayload<Post>) => {
          if (payload.eventType === "INSERT" && payload.new && "id" in payload.new) {
            setPosts((prev) => [payload.new as Post, ...prev]);
          } else if (payload.eventType === "UPDATE" && payload.new && "id" in payload.new) {
            setPosts((prev) =>
              prev.map((p) =>
                p.id === (payload.new as Post).id ? (payload.new as Post) : p
              )
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  return { posts, loading };
}

// ============================================
// 4. useDashboardStats — Aggregated stats
// ============================================

export function useDashboardStats(userId: string | undefined) {
  const { pipeline, loading: pipeLoading } = usePipelineStatus(userId);
  const { posts, loading: postsLoading } = usePosts(userId);

  const stats = useMemo(() => ({
    currentStage: pipeline?.stage || "idle",
    currentCommand: pipeline?.command || null,
    isRunning: pipeline?.stage !== "completed" && pipeline?.stage !== "error" && !!pipeline?.stage,

    totalPosts: posts.length,
    drafts: posts.filter((p) => p.status === "draft").length,
    posted: posts.filter((p) => p.status === "posted" || p.status === "analyzed").length,
    scheduled: posts.filter((p) => p.status === "scheduled").length,

    avgEngagement: (() => {
      const analyzed = posts.filter(
        (p) => p.metrics && typeof p.metrics === "object" && "engagement_rate" in p.metrics
      );
      if (analyzed.length === 0) return 0;
      const total = analyzed.reduce(
        (sum, p) => sum + (Number((p.metrics as Record<string, number>).engagement_rate) || 0),
        0
      );
      return (total / analyzed.length).toFixed(2);
    })(),

    latestPost: posts[0] || null,
  }), [pipeline, posts]);

  return { stats, pipeline, posts, loading: pipeLoading || postsLoading };
}
