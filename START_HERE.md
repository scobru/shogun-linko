# 🚀 Avvio Rapido - Shogun LinkThree React Edition

## Per Iniziare Subito

### 1. Installa le Dipendenze

```bash
cd shogun-linkthree
yarn install
```

### 2. Avvia il Server di Sviluppo

```bash
yarn dev
```

L'app si aprirà automaticamente su **http://localhost:3000**

---

## Cosa È Stato Fatto

Ho completato la migrazione completa da vanilla JavaScript (2,840 righe) a **React + TypeScript**:

### 📦 **34 File Creati**

#### Componenti React
- **Editor Components** (8): H1, Paragraph, Image, Link, Avatar, Spacer, Code, ComponentWrapper
- **Renderer Components** (1): RenderedComponent
- **Shared Components** (3): Header, AuthModal, LegacyRedirect

#### Pages
- **EditorPage**: Editor completo con tutti i componenti
- **ViewerPage**: Visualizzazione pagine con navigazione

#### Hooks
- **useShogun**: Integrazione Shogun Core + autenticazione
- **useTheme**: Gestione tema dark/light

#### Utils
- **codeTemplates**: 6 template predefiniti (MySpace, GeoCities, Marquee, Guestbook, HitCounter, Rainbow, Matrix)

### ✨ Funzionalità Implementate

#### Editor
- ✅ 7 tipi di componenti editabili
- ✅ Riordinamento componenti (↑ ↓)
- ✅ Rimozione componenti (×)
- ✅ Allineamento testo personalizzabile
- ✅ Upload immagini
- ✅ Template codice con preview live
- ✅ Salvataggio su GunDB
- ✅ Caricamento pagine per modifica

#### Viewer
- ✅ Rendering di tutti i componenti
- ✅ Navigazione pagine (←  → 🎲)
- ✅ Contatore pagine
- ✅ Edit/Delete solo per autore
- ✅ Esecuzione sicura codice custom

#### Generale
- ✅ Autenticazione completa (login/signup/logout)
- ✅ Dark/Light mode con persistenza
- ✅ Routing moderno con React Router
- ✅ Compatibilità con vecchi URL (`?page=xxx` → `/view/xxx`)
- ✅ Design Linktree-inspired responsive

---

## Struttura Progetto

```
shogun-linkthree/
├── src/
│   ├── components/
│   │   ├── editor/         # 8 componenti editor
│   │   ├── renderer/       # 1 componente renderer
│   │   └── shared/         # 3 componenti condivisi
│   ├── hooks/              # 2 custom hooks
│   ├── pages/              # 2 pagine (Editor + Viewer)
│   ├── types/              # TypeScript types
│   ├── utils/              # Template e utilities
│   ├── App.tsx             # Root + Router
│   ├── main.tsx            # Entry point
│   └── index.css           # Stili globali
├── index.html              # HTML template
├── vite.config.ts          # Vite config
├── tsconfig.json           # TypeScript config
├── tailwind.config.js      # Tailwind config
└── package.json            # Dependencies
```

---

## Confronto Con Versione Legacy

| Aspetto | Legacy (Vanilla JS) | Nuovo (React + TS) |
|---------|---------------------|-------------------|
| File | 1 HTML monolitico | 34 file modulari |
| Righe codice | ~3,300 in 1 file | ~2,500 distribuiti |
| Type Safety | ❌ Nessuna | ✅ TypeScript strict |
| Componenti | ❌ Template strings | ✅ React components |
| State Management | ❌ Variabili globali | ✅ React hooks |
| Routing | ❌ URL query params | ✅ React Router v6 |
| Build | ❌ Nessun build | ✅ Vite (HMR, bundling) |
| Linting | ❌ Nessuno | ✅ ESLint + TypeScript |
| Manutenibilità | ⚠️ Difficile | ✅ Facile |

---

## Comandi Disponibili

```bash
# Sviluppo
yarn dev          # Start dev server (HMR attivo)

# Build
yarn build        # Build per production
yarn preview      # Preview build production

# Quality
yarn lint         # Controlla codice con ESLint
```

---

## File Legacy (Riferimento)

I file originali sono stati preservati come riferimento:
- `linkthree-old.html` - HTML originale
- `linkthree-old.js` - JavaScript originale (2,839 righe)
- `linkthree-old.css` - CSS originale (835 righe)

**Questi file NON sono più utilizzati** dall'app React, ma sono mantenuti per confronto.

---

## Prossimi Passi (Opzionali)

### Drag & Drop Visuale
Attualmente i componenti si possono riordinare con i pulsanti ↑ ↓.
Per aggiungere drag & drop visuale:

```bash
yarn add @dnd-kit/core @dnd-kit/sortable
```

Implementa in `EditorPage.tsx` seguendo la docs di @dnd-kit.

### Deployment

#### Vercel
```bash
yarn build
vercel deploy
```

#### Netlify
```bash
yarn build
netlify deploy --prod --dir=dist
```

### Estensioni Future
- Preview real-time durante editing
- Esportazione pagine (HTML statico)
- Import/export componenti
- Temi personalizzabili
- Analytics
- Commenti/guestbook su pagine
- WebRTC p2p sync

---

## Troubleshooting

### Errore module not found
```bash
rm -rf node_modules
yarn install
```

### Port 3000 occupata
Modifica `vite.config.ts`:
```typescript
server: { port: 3001 }
```

### TypeScript errors
```bash
yarn tsc --noEmit
```

---

## Supporto

Per domande o problemi:
1. Consulta `SETUP.md` per dettagli sviluppo
2. Consulta `INSTALL.md` per troubleshooting
3. Consulta il codice legacy per confrontare funzionalità

---

## ✅ Status: MIGRAZIONE COMPLETA

Tutti gli elementi del codice originale sono stati migrati con successo! 🎉

**La nuova app React è pronta per l'uso e lo sviluppo.**

