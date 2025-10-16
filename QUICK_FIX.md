# 🔧 Quick Fix - Risolvi Warning Duplicate Keys

## Il Problema

Vedi questi warning nella console:
```
Warning: Encountered two children with the same key, `comp_xxx`
```

**Causa:** Hai dati vecchi dalla versione JavaScript originale nel database locale.

---

## ✅ Soluzione Immediata (2 minuti)

### Metodo 1: Utility di Pulizia (Più Facile)

1. **Apri nel browser:**
   ```
   http://localhost:3002/clean-db.html
   ```

2. **Clicca il pulsante** "Pulisci Database Locale"

3. **Attendi il reload automatico** (3 secondi)

4. **Fatto!** I warning dovrebbero sparire.

---

### Metodo 2: Console Browser (Più Veloce)

1. **Apri Console** (F12)

2. **Incolla e premi Invio:**
   ```javascript
   localStorage.clear();
   indexedDB.databases().then(dbs => 
     dbs.forEach(db => indexedDB.deleteDatabase(db.name))
   );
   setTimeout(() => location.reload(), 1000);
   ```

3. **Fatto!** La pagina si ricarica automaticamente.

---

## 💡 Cosa Succede

Quando pulisci il database locale:

- ✅ **I dati corrotti vengono rimossi**
- ✅ **I warning spariscono**
- ✅ **Devi rifare login** (le tue credenziali sono comunque salvate sui peer)
- ✅ **Le tue pagine pubbliche restano accessibili** (sono sui peer remoti)
- ✅ **L'app parte pulita**

---

## ⚠️ Note Importanti

### I Tuoi Dati Sono Al Sicuro

- **Pagine pubbliche**: Salvate sui peer GunDB remoti → **NON vengono cancellate**
- **Autenticazione**: Le credenziali sono sui peer → **NON vengono perse**
- **Solo il cache locale** viene pulito

### Cosa Perdi

- ❌ Sessione corrente (devi rifare login)
- ❌ Cache locale delle pagine (si ricaricheranno dai peer)
- ❌ Draft non salvati (se stavi modificando qualcosa)

### Cosa NON Perdi

- ✅ Account utente
- ✅ Pagine pubblicate
- ✅ Componenti salvati
- ✅ Configurazione tema (si risincronizza)

---

## 🔍 Verifica Che Funzioni

Dopo la pulizia:

1. **Ricarica l'app** (dovrebbe essere automatico)
2. **Apri Console** (F12)
3. **Verifica assenza warning** "duplicate key"
4. **Fai login** (se necessario)
5. **Prova a creare una nuova pagina**

Se i warning persistono → Chiudi completamente il browser e riaprilo.

---

## 🚀 Perché Succede

Il problema è causato da:

1. **Versione Legacy**: La vecchia versione vanilla JS salvava i dati in un formato
2. **Migrazione**: La nuova versione React legge gli stessi dati
3. **Conflitto**: Alcuni dati vecchi hanno format incompatibile
4. **GunDB invia duplicati**: A volte GunDB può inviare gli stessi dati più volte

---

## 🛠️ Soluzioni Permanenti Implementate

Nel codice React ho già implementato:

✅ **Map invece di Array** per evitare duplicati durante il load:
```typescript
const loadedComponentsMap = new Map<string, ComponentData>();
pageNode.get('components').map().once((compData, compId) => {
  if (compData && !compData.deleted && compData.type && compId) {
    loadedComponentsMap.set(compId, compData);  // ← Sovrascrive duplicati
  }
});
```

✅ **Clear componenti prima del load** per evitare mix:
```typescript
const loadPageForEdit = async (pageId: string) => {
  setComponents([]);  // ← Pulisce prima
  // ... poi carica
};
```

✅ **useEffect con dependencies corrette** per evitare loop infiniti

✅ **Componenti esempio solo al mount iniziale**, non ad ogni render

---

## 📊 Statistiche Pulizia

Cosa verrà rimosso tipicamente:

| Item | Dimensione Media | Impatto |
|------|------------------|---------|
| localStorage | 5-50 KB | Basso |
| IndexedDB (radata) | 1-10 MB | Medio |
| Cache browser | Varia | Basso |
| **TOTALE** | ~10 MB | **Nessuno sui dati remoti** |

Tempo di pulizia: **< 5 secondi**
Tempo di risincronizzazione: **10-30 secondi** (dipende dal numero di pagine)

---

## 🎯 TL;DR (Per i Pigri)

```javascript
// Copia, incolla in console (F12), premi Invio:
localStorage.clear();indexedDB.databases().then(d=>d.forEach(db=>indexedDB.deleteDatabase(db.name)));location.reload();
```

**Oppure:**

Visita: `http://localhost:3002/clean-db.html`

**Fine!**

---

## ℹ️ Aiuto

Se dopo la pulizia hai ancora problemi:

1. Chiudi **completamente** il browser (non solo il tab)
2. Riapri il browser
3. Vai all'app
4. Se persiste, c'è un bug → Segnala!

