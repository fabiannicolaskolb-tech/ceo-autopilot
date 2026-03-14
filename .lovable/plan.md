

# Foto-Upload-Funktion fur CEOs

## Ubersicht

Drei Profilfotos pro User: Hauptprofilbild + 2 Alternativen. Upload via Supabase Storage, URLs in `profiles`-Tabelle gespeichert. Avatar 1 erscheint in Sidebar und Dashboard.

## Datenbank-Anderungen

### 1. Storage Bucket erstellen
```sql
INSERT INTO storage.buckets (id, name, public) VALUES ('profile-pictures', 'profile-pictures', true);

-- RLS: User kann eigene Bilder hochladen (Pfad: {user_id}/*)
CREATE POLICY "Users can upload own pictures" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'profile-pictures' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can update own pictures" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'profile-pictures' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can delete own pictures" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'profile-pictures' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Public read access" ON storage.objects
  FOR SELECT TO public
  USING (bucket_id = 'profile-pictures');
```

### 2. Profil-Spalten hinzufugen
```sql
ALTER TABLE profiles
  ADD COLUMN avatar_url_1 text,
  ADD COLUMN avatar_url_2 text,
  ADD COLUMN avatar_url_3 text;
```

## Code-Anderungen

### Neues: `src/components/PhotoUpload.tsx`
Wiederverwendbare Komponente mit:
- Dropzone/Button fur Dateiauswahl (akzeptiert nur Bilder, max 5MB)
- Thumbnail-Vorschau nach Auswahl
- Spinner wahrend Upload
- Upload-Logik: `supabase.storage.from('profile-pictures').upload('{user_id}/{timestamp}_{index}.jpg', file)`
- Nach Upload: Public URL holen und via `updateProfile` in `avatar_url_1/2/3` speichern

### Edit: `src/hooks/useAuth.tsx`
- Profile-Interface um `avatar_url_1`, `avatar_url_2`, `avatar_url_3` erweitern

### Edit: `src/pages/OnboardingPage.tsx`
- `totalSteps` von 5 auf 6 erhohen
- Neuen Step 3 "Profilfotos" einfugen (bisherige Steps 3-5 werden 4-6)
- Drei Upload-Bereiche: "Hauptprofilbild", "Alternativbild 1", "Alternativbild 2"
- Uploads in `handleComplete` verarbeiten

### Edit: `src/pages/ProfilePage.tsx`
- Neue Card "Profilfotos" mit drei PhotoUpload-Komponenten
- Bestehende Bilder als Vorschau anzeigen, austauschbar

### Edit: `src/components/AppSidebar.tsx`
- Avatar-Komponente im Footer (neben E-Mail) zeigt `profile.avatar_url_1`
- Fallback: Initialen des Users

### Edit: `src/pages/DashboardPage.tsx`
- Avatar neben dem Begrussungstext anzeigen

## Dateien

| Datei | Aktion |
|---|---|
| Migration SQL | DB: 3 Spalten + Storage Bucket + RLS |
| `src/components/PhotoUpload.tsx` | Erstellen |
| `src/hooks/useAuth.tsx` | Profile-Interface erweitern |
| `src/pages/OnboardingPage.tsx` | Step 3 hinzufugen (6 Steps total) |
| `src/pages/ProfilePage.tsx` | Foto-Card hinzufugen |
| `src/components/AppSidebar.tsx` | Avatar im Footer |
| `src/pages/DashboardPage.tsx` | Avatar anzeigen |

