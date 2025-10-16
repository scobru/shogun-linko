# Installazione Shogun LinkThree (React Edition)

## Dipendenze da Installare

Per utilizzare la nuova versione React + TypeScript dell'applicazione, esegui:

```bash
cd shogun-linkthree
yarn install
```

## Dipendenze Richieste

Il progetto richiede le seguenti dipendenze (già specificate in `package.json`):

### Dependencies
- `react` ^18.2.0
- `react-dom` ^18.2.0
- `react-router-dom` ^6.21.0
- `shogun-core` ^3.3.7

### DevDependencies
- `@types/react` ^18.2.43
- `@types/react-dom` ^18.2.17
- `@typescript-eslint/eslint-plugin` ^6.14.0
- `@typescript-eslint/parser` ^6.14.0
- `@vitejs/plugin-react` ^4.2.1
- `autoprefixer` ^10.4.16
- `eslint` ^8.55.0
- `eslint-plugin-react-hooks` ^4.6.0
- `eslint-plugin-react-refresh` ^0.4.5
- `postcss` ^8.4.32
- `tailwindcss` ^3.4.0
- `typescript` ^5.2.2
- `vite` ^5.0.8

## Avvio Sviluppo

Dopo l'installazione, avvia il server di sviluppo:

```bash
yarn dev
```

L'app sarà disponibile su: http://localhost:3000

## Build Production

Per creare una build ottimizzata per la produzione:

```bash
yarn build
```

La build verrà generata nella cartella `dist/`.

## Preview Production

Per visualizzare un'anteprima della build di produzione:

```bash
yarn preview
```

## Struttura File

### File Nuovi (React + TypeScript)
- `index.html` - HTML principale per Vite
- `src/` - Codice sorgente React
- `vite.config.ts` - Configurazione Vite
- `tsconfig.json` - Configurazione TypeScript
- `tailwind.config.js` - Configurazione TailwindCSS
- `package.json` - Dipendenze e script

### File Legacy (Riferimento)
- `linkthree-old.html` - Versione HTML originale
- `linkthree.js` - JavaScript originale (2,840 linee)
- `linkthree.css` - CSS originale

I file legacy sono mantenuti per riferimento ma la nuova app usa la versione React.

## Troubleshooting

### Errore "Cannot find module 'shogun-core'"

Assicurati di aver installato le dipendenze:
```bash
yarn install
```

### Port 3000 già in uso

Modifica la porta in `vite.config.ts`:
```typescript
server: {
  port: 3001, // Cambia a porta libera
}
```

### TypeScript errors

Ricompila i types:
```bash
yarn tsc --noEmit
```

## Next Steps

Dopo l'installazione, consulta `SETUP.md` per informazioni dettagliate sullo sviluppo.

