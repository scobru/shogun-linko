# Sistema di Slug Personalizzati

## Funzionalità

Il sistema di slug personalizzati permette agli utenti di creare URL brevi e memorabili per le loro pagine, invece di usare ID lunghi e difficili da ricordare.

## Come Funziona

### Creazione Link Personalizzato

1. **Durante la creazione/modifica della pagina**, l'utente può inserire uno slug personalizzato nel campo "Link Personalizzato"
2. **Lo slug viene validato** in tempo reale:
   - Solo lettere minuscole, numeri e trattini
   - Non può essere una parola riservata (view, edit, admin, ecc.)
   - Deve essere unico (non già utilizzato)
3. **Feedback visivo** immediato:
   - ✅ Verde se disponibile
   - ❌ Rosso se non valido o già in uso
   - 🔄 Spinner durante il controllo

### Esempi

| Input Utente | Slug Generato | URL Risultante |
|--------------|---------------|----------------|
| "miapagina" | miapagina | `yoursite.com/miapagina` |
| "Il Mio Blog" | il-mio-blog | `yoursite.com/il-mio-blog` |
| "Contatti_2024" | contatti-2024 | `yoursite.com/contatti-2024` |

### Regole di Validazione

#### Caratteri Permessi
- ✅ Lettere minuscole (a-z)
- ✅ Numeri (0-9)
- ✅ Trattini (-)
- ❌ Spazi (convertiti automaticamente in trattini)
- ❌ Caratteri speciali (@, #, $, ecc.)
- ❌ Lettere maiuscole (convertite in minuscole)

#### Slug Riservati
I seguenti slug non possono essere utilizzati perché sono riservati dal sistema:
- `view`, `edit`, `admin`, `api`
- `login`, `logout`, `register`, `signup`
- `dashboard`, `settings`, `profile`
- `home`, `index`

## Struttura Database

### Tabella `pages`
```javascript
{
  id: "page_abc123...",
  title: "La mia pagina",
  slug: "miapagina",        // ← Campo slug opzionale
  author: "user_pub_key",
  createdAt: 1234567890,
  updatedAt: 1234567890
}
```

### Tabella `slugs` (Mapping)
```javascript
{
  "miapagina": "page_abc123...",  // slug → pageId
  "contatti": "page_xyz789...",
  "blog": "page_def456..."
}
```

## Routing

### Route Definitions
```typescript
<Routes>
  <Route path="/" element={<EditorPage />} />
  <Route path="/view/:pageId" element={<ViewerPage />} />  {/* ID-based route */}
  <Route path="/:slug" element={<ViewerPage />} />         {/* Slug-based route */}
</Routes>
```

### URL Patterns

1. **Root**: `/` → EditorPage (crea nuova pagina)
2. **ID-based**: `/view/page_abc123...` → ViewerPage
3. **Slug-based**: `/miapagina` → ViewerPage (risolve slug → pageId)

### Risoluzione Slug

Quando un utente visita `yoursite.com/miapagina`:

1. Il router cattura lo slug tramite `/:slug`
2. `ViewerPage` legge `slug` dai params
3. Query al database: `shogun.db.get('slugs').get('miapagina')`
4. Ottiene il pageId: `"page_abc123..."`
5. Carica la pagina usando il pageId

### Gestione Errori

Se lo slug non esiste nel database:
- Mostra pagina "404 - Pagina Non Trovata"
- Suggerisce di tornare alla home
- Non crashe l'applicazione

## Vantaggi

### Per gli Utenti
- ✅ **URL Memorabili**: `yoursite.com/miapagina` vs `yoursite.com/view/page_p9d9deomqvrx90n5183wfd`
- ✅ **Branding**: URL personalizzati per il proprio brand
- ✅ **Condivisione Facile**: Link corti da condividere sui social
- ✅ **SEO Friendly**: URL descrittivi sono migliori per i motori di ricerca

### Per il Sistema
- ✅ **Doppio Accesso**: Pagina accessibile sia via slug che via ID
- ✅ **Backward Compatibility**: I vecchi link con ID continuano a funzionare
- ✅ **Flessibilità**: Slug è opzionale, non obbligatorio
- ✅ **Sicurezza**: Validazione rigorosa previene abusi

## Implementazione Tecnica

### File Coinvolti

1. **`src/types/index.ts`**
   - Aggiunto campo `slug?: string` a `PageData`

2. **`src/utils/slugify.ts`** (NUOVO)
   - `slugify()`: Converte testo in slug valido
   - `isValidSlug()`: Valida formato slug
   - `isSlugAvailable()`: Controlla slug riservati
   - `RESERVED_SLUGS`: Lista slug riservati

3. **`src/pages/EditorPage.tsx`**
   - Campo input per lo slug
   - Validazione real-time
   - Controllo disponibilità
   - Salvataggio slug nel database
   - Creazione mapping slug→pageId

4. **`src/pages/ViewerPage.tsx`**
   - Risoluzione slug→pageId
   - Gestione 404
   - Navigazione usa slug preferenzialmente

5. **`src/App.tsx`**
   - Route catch-all `/:slug` per slug personalizzati

### Funzioni Chiave

#### `checkSlugAvailability(slug: string)`
Verifica se uno slug è disponibile controllando il database.

```typescript
const checkSlugAvailability = async (slug: string) => {
  return new Promise<boolean>((resolve) => {
    shogun.db.get('slugs').get(slug).once((existingPageId: string) => {
      const available = !existingPageId || existingPageId === currentPageId;
      resolve(available);
    });
  });
};
```

#### `handleSlugChange(value: string)`
Gestisce il cambio del campo slug con validazione in tempo reale.

#### `savePage()`
Salva sia la pagina che il mapping slug→pageId:

```typescript
if (pageSlug) {
  pageData.slug = pageSlug;
  shogun.db.get('slugs').get(pageSlug).put(pageId);
}
```

## UX Features

### Feedback Visivo

- **✅ Verde con checkmark**: Slug disponibile
- **❌ Rosso con error**: Slug non valido o già in uso
- **🔄 Spinner**: Controllo in corso
- **ℹ️ Preview**: Mostra come sarà l'URL finale

### Modal di Condivisione

Quando salvi una pagina con slug personalizzato, il modal mostra:

1. **Link Principale** (evidenziato): Il link con slug personalizzato
2. **Link Alternativo**: Il link con ID lungo (sempre funzionante)

Questo permette all'utente di scegliere quale link condividere.

## Best Practices

### Per gli Utenti

**✅ DO:**
- Usa slug corti e descrittivi: `contatti`, `chi-sono`, `portfolio`
- Usa trattini per separare le parole: `il-mio-blog`
- Scegli slug che descrivono il contenuto

**❌ DON'T:**
- Non usare caratteri speciali: `@miapagina`, `#test`
- Non usare spazi: `la mia pagina` (convertito automaticamente in `la-mia-pagina`)
- Non usare slug troppo lunghi

### Per gli Sviluppatori

**Estensioni Future Possibili:**

1. **Slug auto-generati dal titolo**:
   ```typescript
   const autoSlug = slugify(pageTitle);
   ```

2. **Suggerimenti slug**:
   - Se "miapagina" è occupato, suggerisci "miapagina-2"

3. **Storia slug**:
   - Mantieni vecchi slug come redirect per SEO

4. **Analytics slug**:
   - Track visite per slug vs ID

## Testing

### Test da Fare

1. ✅ Creare pagina con slug valido
2. ✅ Tentare slug già in uso (deve fallire)
3. ✅ Tentare slug riservato (deve fallire)
4. ✅ Tentare slug con caratteri speciali (deve sanitizzare)
5. ✅ Navigare a pagina via slug
6. ✅ Navigare a pagina via ID
7. ✅ Tentare slug inesistente (deve mostrare 404)
8. ✅ Modificare pagina esistente (mantenere slug)
9. ✅ Eliminare pagina (rimuove anche slug)
10. ✅ Navigazione prev/next usa slug quando disponibile

## Troubleshooting

### "Slug già in uso" ma sono sicuro che non esiste

**Soluzione**: Potrebbe esserci un ritardo di sincronizzazione GunDB. Attendi 2-3 secondi e riprova.

### Lo slug non funziona

**Verifica**:
1. Lo slug è stato salvato correttamente? (controlla in GunDB)
2. Il mapping slug→pageId esiste? (`shogun.db.get('slugs').get('tuoslug')`)
3. Il router catch-all è configurato correttamente?

### Navigazione random non usa gli slug

**Comportamento Atteso**: La navigazione ora usa `getPageUrl()` che preferisce gli slug quando disponibili.

## Conclusione

Il sistema di slug personalizzati è **completamente implementato e funzionale**. Gli utenti possono:

- Creare link brevi e memorabili
- Validare in tempo reale
- Accedere alle pagine sia via slug che via ID
- Navigare tra pagine usando gli slug

Il sistema è robusto, scalabile e compatibile con l'infrastruttura GunDB esistente.

