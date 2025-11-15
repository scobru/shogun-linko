declare module 'gun-relays';
declare module 'shogun-onion';

interface ShogunRelaysAPI {
  forceListUpdate: () => Promise<string[]>;
}

declare global {
  interface Window {
    ShogunRelays: ShogunRelaysAPI;
    sitesData?: Array<{ url: string; [key: string]: any }>;
    sites?: string[];
    ringName?: string;
    ringID?: string;
    useIndex?: boolean;
    indexPage?: string;
    useRandom?: boolean;
  }
}