

## Plan: Post Library, Screenshot Analytics & Self-Improving Loop

This is a large feature set. I recommend implementing it in phases. Here is the full plan:

---

### Feature 1: Post Library Page

**New file: `src/pages/PostLibraryPage.tsx`** (replaces existing `PostQueuePage`)

- Two tabs: "Drafts & Queued" (status IN draft/approved/scheduled) and "Published" (status IN posted/analyzed)
- Badge counts per tab
- Post cards with:
  - Color-coded status badges (draft=slate, approved=blue, scheduled=green, posted=purple, analyzed=amber)
  - Truncated content with expand toggle
  - Hashtag pills, dates
  - Action buttons: Approve, Schedule (date picker via Popover+Calendar), Edit (inline textarea), Delete (AlertDialog), Copy to Clipboard
  - Published cards show mini metrics row + expandable AI insights
- Empty states per tab
- Uses existing `usePosts` hook from `useRealtime.ts`, plus direct Supabase mutations for PATCH/DELETE
- Toast notifications on all mutations

**Navigation update: `src/components/AppSidebar.tsx`**
- Replace "Content Gallery" entry with "Post Library" pointing to `/post-library`

**Router update: `src/App.tsx`**
- Replace `/post-queue` route with `/post-library` using new `PostLibraryPage`

---

### Feature 2: Screenshot Analytics (on Analytics Page)

**New section added to `src/pages/AnalyticsPage.tsx`** as a card below existing content:

- "Import Real LinkedIn Metrics" card with drag-and-drop image upload
- Dropdown to select a posted post (from posts table)
- Uses Lovable AI (edge function) instead of direct OpenAI client-side calls (following project guidelines)

**New edge function: `supabase/functions/analyze-screenshot/index.ts`**
- Receives base64 image + post text
- Calls Lovable AI Gateway with `google/gemini-2.5-flash` (vision-capable) to extract metrics from screenshot
- Returns structured JSON: impressions, likes, comments, shares, clicks, engagement_rate, extraction_confidence, notes
- Uses tool calling for structured output

**UI flow:**
- Upload image → preview → select post → "Analyze" → show editable extracted metrics with confidence indicator → "Save" → PATCH post metrics + set status to "analyzed"

---

### Feature 3: Self-Improving System Visibility

**3a: Learning Progress Card — `src/pages/DashboardPage.tsx`**
- New card after CreatorScoreCard
- Shows: total analyzed posts, engagement rate trend (sparkline), latest performance_summary, top-performing content_pattern
- Queries posts where status = 'analyzed' with metrics

**3b: Improvement Insights Panel — `src/pages/AnalyticsPage.tsx`**
- New section: "Was Ihre KI gelernt hat"
- Aggregates from analyzed posts: best content_pattern, top topic_tags, sentiment distribution, combined recommended_follow_ups
- Conversational coach tone

**3c: Cycle Indicator**
- Add `cycle_number` column to `posts` table (integer, default 1) via migration
- Show "Zyklus N" badge on post cards in Post Library

**3d: Before/After Comparison — `src/pages/AnalyticsPage.tsx`**
- "Zyklen vergleichen" section
- Side-by-side avg metrics for Cycle 1 vs latest cycle
- Delta indicators (e.g., "+47% Engagement")

---

### Database Migration

Add `cycle_number` column to `posts` table:
```sql
ALTER TABLE posts ADD COLUMN IF NOT EXISTS cycle_number integer DEFAULT 1;
```

---

### Technical Notes

- **No direct OpenAI calls** — screenshot analysis goes through a Supabase edge function using Lovable AI Gateway (gemini-2.5-flash supports vision)
- All mutations use existing `supabase` client from `@/integrations/supabase/client`
- Existing pages are only extended, not restructured
- Responsive design matching existing glass-card patterns (`rounded-[24px]`, `bg-card/80 backdrop-blur-xl`)
- Loading skeletons and toast notifications throughout

### Files to create/modify:
1. **Create** `src/pages/PostLibraryPage.tsx`
2. **Create** `supabase/functions/analyze-screenshot/index.ts`
3. **Modify** `src/pages/DashboardPage.tsx` (add Learning Progress card)
4. **Modify** `src/pages/AnalyticsPage.tsx` (add Screenshot Import + Insights + Cycle Compare sections)
5. **Modify** `src/components/AppSidebar.tsx` (navigation)
6. **Modify** `src/App.tsx` (routing)
7. **Migration** for `cycle_number` column

