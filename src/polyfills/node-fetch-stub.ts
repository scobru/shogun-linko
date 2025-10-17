// Stub for node-fetch
// In browser environments, we use the native fetch API
// This stub is only needed to satisfy the import in gun-relays
// which has a fallback chain that prefers window.fetch anyway

const browserFetch = typeof window !== 'undefined' && window.fetch 
  ? window.fetch.bind(window)
  : fetch;

export default browserFetch;
export { browserFetch as fetch };

