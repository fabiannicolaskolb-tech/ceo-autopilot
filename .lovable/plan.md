

## Plan: CV-Upload im Onboarding verpflichtend machen

### Änderungen in `src/pages/OnboardingPage.tsx`

1. **Neuen State hinzufügen**: `const [cvUploaded, setCvUploaded] = useState(false);` (nach Zeile 50)

2. **Nach erfolgreichem CV-Parse `setCvUploaded(true)` setzen** (nach Zeile 73, im try-Block von `handleCvUpload`)

3. **Step-2-Validierung erweitern** (Zeile 122): `cvUploaded` als zusätzliche Bedingung hinzufügen:
   ```
   case 2: return cvUploaded && name.trim() !== '' && company.trim() !== '' && role.trim() !== '' && industry.trim() !== '';
   ```

4. **Button-UI aktualisieren** (Zeile 282-291):
   - `Check` Icon importieren (aus lucide-react)
   - Nach Upload: grüner Erfolgs-Stil (`bg-green-600 text-white`) und Text "CV erfolgreich hochgeladen ✓"
   - Hinweistext unter dem Button: "Bitte laden Sie Ihren CV hoch, um fortzufahren" (nur wenn `!cvUploaded`)

