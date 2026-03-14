

# Supabase Integration Plan

## Phase 1: Datenbank-Schema (Migration)

Eine einzige SQL-Migration erstellt alle 4 Tabellen mit RLS:

**profiles** — `id uuid PK (= auth.users.id)`, `name`, `company`, `role`, `industry`, `target_audience`, `tone` (default 'visionary'), `bio`, `linkedin_connected` (default false), `onboarding_completed` (default false), `created_at`, `updated_at`

**posts** — `id uuid PK`, `user_id uuid FK → profiles.id`, `content`, `hook`, `angle`, `type`, `status` (check: draft/approved/scheduled/posted), `scheduled_at`, `posted_at`, `linkedin_post_id`, `metrics jsonb`, `created_at`, `updated_at`

**voice_samples** — `id uuid PK`, `user_id uuid FK → profiles.id`, `content text`, `created_at`

**topics** — `id uuid PK`, `user_id uuid FK → profiles.id`, `name text`, `type` (check: focus/no-go), `created_at`

**Triggers:**
- Auto-create profile on signup (`handle_new_user` trigger on `auth.users`)
- Auto-update `updated_at` on profiles and posts

**RLS Policies:** Jede Tabelle bekommt SELECT/INSERT/UPDATE/DELETE Policies mit `auth.uid() = user_id` (bzw. `= id` bei profiles).

## Phase 2: Auth umschreiben

**`src/hooks/useAuth.tsx`** — komplett neu:
- `onAuthStateChange` Listener (BEFORE `getSession`)
- `signInWithPassword`, `signUp`, `signOut`, `resetPasswordForEmail`, `updateUser`
- Profil aus `profiles`-Tabelle laden statt localStorage
- Alle localStorage-Referenzen entfernen

**`src/pages/AuthPage.tsx`** — Supabase Auth aufrufen statt Mock-Funktionen. Redirect-URL fuer Password-Reset setzen.

**`src/pages/ResetPasswordPage.tsx`** — `supabase.auth.updateUser({ password })` nutzen, Recovery-Hash pruefen.

**`src/components/ProtectedLayout.tsx`** — funktioniert bereits korrekt mit dem neuen useAuth.

## Phase 3: Data Fetching umstellen

Jede Seite wird von localStorage/Mock auf Supabase-Queries umgestellt:

| Seite | Aenderung |
|---|---|
| **OnboardingPage** | `useMutation` fuer profile update + batch insert in `voice_samples` und `topics`, setze `onboarding_completed = true` |
| **DashboardPage** | `useQuery` fuer Posts (draft count, naechster geplanter Post) statt hardcoded Werte |
| **IdeationPage** | `useMutation` zum Erstellen von Posts in `posts`-Tabelle statt localStorage |
| **PlannerPage** | `useQuery` fuer Posts + `useMutation` fuer Updates statt localStorage + MOCK_POSTS |
| **ProfilePage** | `useQuery` fuer voice_samples + topics aus DB, `useMutation` zum Speichern |
| **SettingsPage** | Gleich wie ProfilePage + Supabase Auth fuer Passwort-Reset |
| **AnalyticsPage** | `useQuery` fuer posted Posts mit metrics statt hardcoded Daten |

## Phase 4: API-Layer

**`src/services/api.ts`** — Webhook-Stubs senden echte `user_id` aus `supabase.auth.getUser()`.

## Betroffene Dateien (14)

- `src/integrations/supabase/types.ts` (auto-generiert nach Migration)
- `src/hooks/useAuth.tsx` (komplett neu)
- `src/pages/AuthPage.tsx`
- `src/pages/ResetPasswordPage.tsx`
- `src/pages/OnboardingPage.tsx`
- `src/pages/DashboardPage.tsx`
- `src/pages/IdeationPage.tsx`
- `src/pages/PlannerPage.tsx`
- `src/pages/ProfilePage.tsx`
- `src/pages/SettingsPage.tsx`
- `src/pages/AnalyticsPage.tsx`
- `src/components/ProtectedLayout.tsx`
- `src/services/api.ts`
- 1 neue SQL-Migration

