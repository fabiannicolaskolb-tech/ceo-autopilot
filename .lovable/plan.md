

# Analytics Dashboard -- Supabase-Connected Rebuild

## Overview

Replace the hardcoded analytics page with a data-driven dashboard that reads from the `posts` table's `metrics` JSONB field. Add time range filters, empty state, post comparison, sentiment donut, content type efficiency, best-time heatmap, and AI insights panel.

## Data Model

The `posts` table already has everything needed. The `metrics` JSONB field will store:
```json
{
  "impressions": 1200,
  "interactions": { "likes": 45, "comments": 12, "shares": 8 },
  "ctr": 3.2,
  "sentiment": { "positive": 70, "neutral": 20, "negative": 10 },
  "follower_delta": 15
}
```

No database migrations needed -- the schema already supports this via the JSONB `metrics` column and `posted_at`, `type`, `hook` fields.

## New File: `src/hooks/useAnalytics.ts`

Custom hook that:
- Fetches posts from Supabase filtered by `user_id` and time range (7d, 30d, 90d, YTD)
- Only includes posts with `status = 'posted'` and non-null `metrics`
- Computes derived KPIs: total impressions, weighted engagement rate (comments x3 + shares x2 + likes), posts/week, follower growth
- Computes trend vs previous period (percentage change)
- Aggregates data for each chart (timeline, content type, sentiment, best time)
- Returns `{ posts, kpis, timelineData, contentTypeData, sentimentData, bestTimeData, loading, timeRange, setTimeRange }`

## Rewrite: `src/pages/AnalyticsPage.tsx`

### Sections

1. **Header + Time Range Filter** -- Tabs or segmented control: 7T / 30T / 90T / YTD

2. **KPI Cards (3)** -- Total Reach (with trend %), Engagement Authority (weighted), Network Growth
   - Each card shows trend arrow + percentage vs previous period

3. **Performance Timeline** -- Combined AreaChart (impressions) + Line overlay (engagement events) over time, grouped by day/week depending on range

4. **Content Type Efficiency** -- BarChart comparing performance by `post.type` (Leadership, Industry, Personal, etc.)

5. **Best Time to Post** -- Simple heatmap grid (7 days x 24 hours) showing interaction density, built with div grid + background opacity

6. **Top Performing Posts Table** -- Using `Table` component, columns: Hook (truncated), Date, Impressions, CTR, Comments, Engagement Rate. Sortable by clicking headers.

7. **Post Compare** -- Two dropdown selects to pick posts, side-by-side metric cards

8. **Sentiment Donut** -- PieChart from Recharts showing positive/neutral/negative from aggregated `metrics.sentiment`

9. **KI-Optimierungsvorschlage** -- Static insights card (same as current AI Insights but with data-aware text when posts exist)

10. **Empty State** -- When no posted posts exist: centered card with icon, "Sammle erste Daten..." message

## File Changes

| File | Action |
|---|---|
| `src/hooks/useAnalytics.ts` | Create -- data fetching + aggregation hook |
| `src/pages/AnalyticsPage.tsx` | Rewrite -- full data-driven dashboard |

## Key Design Decisions

- No new dependencies -- Recharts already installed, includes BarChart, PieChart, AreaChart
- Heatmap built with CSS grid (no extra lib)
- Post comparison uses two `Select` dropdowns + side-by-side cards
- All charts use existing color tokens (primary, success, warning, destructive)
- Weighted engagement: `(comments * 3 + shares * 2 + likes) / impressions * 100`
- Empty state check: if no posts with `status === 'posted'` and `metrics` exist

