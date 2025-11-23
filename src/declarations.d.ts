declare module 'gun-relays';

interface ShogunRelaysAPI {
  forceListUpdate: () => Promise<string[]>;
}

declare global {
  interface Window {
    ShogunRelays: ShogunRelaysAPI;
  }
}