# Troubleshooting - Shogun LinkThree

## Problemi Comuni e Soluzioni

### 1. Duplicate Key Warnings (RISOLTO)

**Errore:**
```
Warning: Encountered two children with the same key, `comp_xxx`. 
Keys should be unique...
```

**Causa:** GunDB può inviare i dati più volte, creando componenti duplicati.

**Soluzione Implementata:**
- ✅ Uso di `Map<string, ComponentData>` invece di Array per evitare duplicati
- ✅ Componenti di esempio aggiunti solo al primo mount, non ad ogni render
- ✅ Clear dei componenti prima di ricaricare una pagina

**Cosa Fare Se Persiste:**
1. Cancella i dati locali:
   ```javascript
   // In console del browser
   localStorage.clear();
   indexedDB.deleteDatabase('radata');
   ```
2. Ricarica la pagina (F5)

---

### 2. Errori GunDB "Cannot create property on number"

**Errore:**
```
TypeError: Cannot create property '' on number '1752309972419.001'
```

**Causa:** Dati corrotti nel database GunDB locale (probabilmente da versioni precedenti).

**Soluzione:**

#### Opzione A: Pulisci Database Locale (Raccomandato)
```javascript
// In console del browser (F12)
localStorage.clear();
indexedDB.deleteDatabase('radata');
location.reload();
```

#### Opzione B: Ignora (i peer remoti hanno dati corretti)
- L'errore è solo nel browser locale
- I dati sui peer remoti sono corretti
- Puoi continuare a usare l'app normalmente

#### Opzione C: Usa Solo Peer Remoti
Modifica `src/hooks/useShogun.ts`:
```typescript
gunOptions: {
  localStorage: false,  // ← Disabilita storage locale
  radisk: false,        // ← Disabilita RadixDB
  // ... resto config
}
```

---

### 3. MetaMask Error (IGNORA)

**Errore:**
```
MetaMask encountered an error setting the global Ethereum provider
```

**Causa:** Conflitto tra estensioni wallet nel browser (MetaMask, Coinbase Wallet, ecc.).

**Soluzione:** **Nessuna azione richiesta** - questo errore non impatta l'app LinkThree. È un problema tra le estensioni del browser.

---

### 4. WebSocket Connection Failed

**Errore:**
```
WebSocket connection to 'wss://peer.wallie.io/gun' failed
```

**Causa:** Uno o più peer GunDB non sono raggiungibili.

**Impatto:** 
- ✅ L'app funziona comunque con gli altri peer attivi
- ✅ I dati vengono sincronizzati su peer disponibili
- ⚠️ Se TUTTI i peer falliscono, i dati restano solo in locale

**Soluzione:**
- Verifica che almeno 1 peer sia attivo
- Aggiungi peer backup in `src/hooks/useShogun.ts`:
  ```typescript
  peers: [
    'https://peer.wallie.io/gun',
    'https://relay.shogun-eco.xyz/gun',
    'https://gun-manhattan.herokuapp.com/gun',  // ← Aggiungi backup
  ],
  ```

---

### 5. React Router Future Flags Warnings (IGNORA)

**Errore:**
```
⚠️ React Router Future Flag Warning: v7_startTransition
```

**Soluzione:** Questi sono solo warning per React Router v7 (futuro). Puoi:

#### Opzione A: Ignora (nessun impatto funzionale)

#### Opzione B: Abilita i future flags

In `src/main.tsx`:
```typescript
<BrowserRouter future={{
  v7_startTransition: true,
  v7_relativeSplatPath: true,
}}>
  <App />
</BrowserRouter>
```

---

### 6. Componenti Non Vengono Salvati

**Sintomi:**
- Salvi la pagina ma i componenti non appaiono al reload

**Possibili Cause:**
1. **Non autenticato**: Controlla che l'utente sia loggato
2. **Peer non sincronizzati**: Aspetta 2-3 secondi dopo il salvataggio
3. **Componenti senza contenuto**: I componenti vuoti potrebbero non essere salvati

**Soluzione:**
1. Verifica autenticazione
2. Aggiungi contenuto ai componenti prima di salvare
3. Controlla la console per errori di salvataggio

---

### 7. Slug "Già in Uso" Ma È il Mio

**Sintomi:**
- Modifichi la tua pagina
- Lo slug che hai usato risulta "già in uso"

**Causa:** Il sistema controlla se lo slug è già mappato, ma dovrebbe permettere lo stesso slug se è la tua pagina corrente.

**Soluzione Implementata:**
```typescript
const available = !existingPageId || existingPageId === currentPageId;
```

Se persiste, ricarica la pagina per modifica:
1. Vai alla home
2. Rivisita la tua pagina
3. Clicca "Modifica"

---

### 8. Pagina 404 con Slug Valido

**Sintomi:**
- Crei pagina con slug "miapagina"
- Visiti `/miapagina`
- Ottieni 404

**Possibili Cause:**
1. **Sincronizzazione in corso**: Aspetta 2-3 secondi
2. **Mapping non creato**: Lo slug non è stato salvato correttamente
3. **Slug scritto male**: Controlla typo nell'URL

**Soluzione:**
1. Visita `/view/{pageId}` (usa l'ID completo)
2. Se funziona, modifica la pagina e risalva lo slug
3. Verifica in console:
   ```javascript
   // In console browser
   shogun.db.get('slugs').get('miapagina').once(console.log)
   ```

---

### 9. App Non Si Avvia

**Errore:**
```
Cannot find module 'shogun-core'
```

**Soluzione:**
```bash
cd shogun-linkthree
rm -rf node_modules
yarn install
```

---

### 10. Vite Port Already in Use

**Errore:**
```
Port 3000 is already in use
```

**Soluzione:**

#### Opzione A: Cambia porta
Modifica `vite.config.ts`:
```typescript
server: {
  port: 3001,  // ← Cambia porta
}
```

#### Opzione B: Kill processo
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:3000 | xargs kill -9
```

---

## Pulizia Completa (Reset Totale)

Se hai problemi persistenti, esegui un reset completo:

### Step 1: Pulisci Node Modules
```bash
cd shogun-linkthree
rm -rf node_modules
rm yarn.lock
```

### Step 2: Pulisci Build
```bash
rm -rf dist
rm -rf .vite
```

### Step 3: Pulisci Database Locale

**Browser Console (F12):**
```javascript
// Cancella tutto
localStorage.clear();
sessionStorage.clear();

// Lista tutti i database IndexedDB
indexedDB.databases().then(dbs => {
  dbs.forEach(db => {
    console.log('Deleting:', db.name);
    indexedDB.deleteDatabase(db.name);
  });
});

// Ricarica
location.reload();
```

### Step 4: Reinstalla
```bash
yarn install
yarn dev
```

---

## Debug Utilities

### Ispeziona Database GunDB

```javascript
// In console del browser
const shogun = window.shogunInstance; // Se esposto globalmente

// Lista tutte le pagine
shogun.db.get('pages').map().once((page, id) => {
  console.log('Page:', id, page);
});

// Lista tutti gli slug
shogun.db.get('slugs').map().once((pageId, slug) => {
  console.log('Slug:', slug, '→', pageId);
});

// Controlla una pagina specifica
shogun.db.get('pages').get('page_xxx').once(console.log);

// Controlla componenti di una pagina
shogun.db.get('pages').get('page_xxx').get('components').map().once((comp, id) => {
  console.log('Component:', id, comp);
});
```

### Esporta Database

```javascript
// Esporta tutte le pagine
const exportData = {};
shogun.db.get('pages').map().once((page, id) => {
  exportData[id] = page;
});

setTimeout(() => {
  console.log('Export:', JSON.stringify(exportData, null, 2));
  // Copia e salva in un file .json
}, 2000);
```

---

## Performance Issues

### App Lenta al Caricamento

**Possibili Cause:**
1. Troppi dati in localStorage
2. Peer remoti lenti
3. Troppi componenti Code con preview

**Soluzioni:**
1. Pulisci vecchi dati (vedi sopra)
2. Riduci numero di peer
3. Disabilita preview Code temporaneamente

### Preview Code Non Funziona

**Sintomi:**
- Il componente Code non mostra anteprima
- Console mostra errori iframe

**Soluzione:**
- Controlla la console per errori JavaScript nel codice inserito
- Verifica che HTML/CSS/JS siano validi
- Prova un template predefinito per verificare che il sistema funzioni

---

## Logging Avanzato

Per debug approfondito, aggiungi in `src/pages/EditorPage.tsx`:

```typescript
useEffect(() => {
  console.log('Current components:', components);
  console.log('Duplicate IDs:', 
    components.map(c => c.id).filter((id, i, arr) => arr.indexOf(id) !== i)
  );
}, [components]);
```

---

## Segnalazione Bug

Se trovi un bug non documentato qui:

1. Apri la console (F12)
2. Copia tutti gli errori
3. Esporta lo stato:
   ```javascript
   console.log({
     components: components.length,
     pageId: currentPageId,
     user: currentUser?.alias,
     slug: pageSlug,
   });
   ```
4. Segnala con screenshot e info

---

## Risoluzione Rapida (Quick Fixes)

| Problema | Soluzione Rapida |
|----------|------------------|
| Duplicate keys | F5 (reload) |
| GunDB errors | `localStorage.clear()` + reload |
| Slug già in uso | Prova altro slug |
| Peer offline | Controlla internet, app funziona comunque |
| MetaMask error | Ignora, non impatta l'app |
| React warnings | Ignora o aggiungi future flags |
| Port in use | Cambia porta in vite.config.ts |
| Module not found | `rm -rf node_modules && yarn install` |

---

## Note Tecniche

### GunDB Radix Errors

Gli errori `Cannot create property '' on number` sono causati da:
- Dati legacy dalla versione vanilla JS
- Timestamp salvati come valori invece che come metadata
- RadixDB che tenta di indicizzare dati non validi

**Non sono critici** - l'app funziona comunque. Per eliminarli completamente, usa storage locale pulito.

### React Strict Mode

L'app usa React Strict Mode che causa doppio render in sviluppo. Questo è **normale** e non un bug. In produzione non succede.

Per disabilitare (solo per debug):
```typescript
// src/main.tsx
ReactDOM.createRoot(document.getElementById('root')!).render(
  // <React.StrictMode>  ← Commenta
    <BrowserRouter>
      <App />
    </BrowserRouter>
  // </React.StrictMode>
)
```

