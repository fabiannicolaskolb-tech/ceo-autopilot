

## Plan: Apify LinkedIn-Scraper Integration

### Ziel
Zwei Apify-Scraper integrieren:
1. **LinkedIn Posts Scraper** — Eigene Posts mit Metriken abrufen und in die `posts`-Tabelle importieren
2. **LinkedIn Profil-Scraper verbessern** — Bestehende `scrape-linkedin` Edge Function erweitern (besserer Actor, Bio-Daten speichern)

### 1. Neue Edge Function: `scrape-linkedin-posts`

Erstellt eine neue Edge Function die über Apify den LinkedIn Post Scraper aufruft (`curious_coder~linkedin-posts-scraper` oder `apifly~linkedin-post-scraper`). 

- Input: `linkedin_url` (Profil-URL) + `user_id`
- Apify scrapt die letzten Posts des Profils mit Metriken (likes, comments, shares, impressions)
- Gescrapte Posts werden direkt in die `posts`-Tabelle eingefügt (via Supabase Service Role Key):
  - `status: 'posted'`, `posted_at`, `hook` (erste Zeile), `content`, `metrics` (JSONB), `linkedin_post_id`
  - Duplikate werden über `linkedin_post_id` vermieden
- CORS-Headers + `verify_jwt = false` in config.toml

### 2. Bestehende `scrape-linkedin` verbessern

- Profilbild-URL und Bio in `profiles`-Tabelle speichern (`bio`, `avatar_url_1`) wenn Onboarding-Import genutzt wird
- Robustere Feldextraktion mit Fallbacks

### 3. Frontend: Import-Button auf Analytics-Seite

- Neuer "LinkedIn-Posts importieren" Button im Analytics-Header
- Ruft `scrape-linkedin-posts` Edge Function auf mit der `linkedin_url` aus dem Profil
- Loading-State + Toast-Feedback
- Posts erscheinen automatisch in den Analytics-Charts nach Import

### 4. DB-Anpassung

- Kein Schema-Change nötig — `posts`-Tabelle hat bereits alle Felder (`linkedin_post_id`, `metrics` JSONB, `content`, `hook`, `status`, `posted_at`)

### Technische Details

**Edge Function `scrape-linkedin-posts/index.ts`:**
```text
1. linkedin_url + user_id aus Request Body
2. APIFY_API_KEY + SUPABASE_SERVICE_ROLE_KEY aus env
3. Apify Actor aufrufen (run-sync-get-dataset-items)
4. Für jeden Post: Metriken extrahieren → posts-Tabelle upsert
5. Duplikat-Check via linkedin_post_id
```

**Analytics-Seite:**
```text
[Header]
  "Analytics"                    [LinkedIn-Posts importieren ↻]
                                      ↓ onClick
                          supabase.functions.invoke('scrape-linkedin-posts')
                                      ↓ success
                                  toast + refetch posts
```

**Secrets:** `APIFY_API_KEY` ist bereits konfiguriert. `SUPABASE_SERVICE_ROLE_KEY` ebenfalls vorhanden.

