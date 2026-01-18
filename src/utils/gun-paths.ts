/**
 * GunDB Path Helpers for Linko
 * 
 * Centralizes path management for GunDB nodes under the shogun/linko namespace.
 * Provides backwards compatibility with legacy root-level paths.
 */

import type { IGunInstance } from 'gun';

// New namespace paths
export const LINKO_NAMESPACE = {
    root: ['shogun', 'linko'] as const,
    pages: ['shogun', 'linko', 'pages'] as const,
    slugs: ['shogun', 'linko', 'slugs'] as const,
};

// Legacy paths for backwards compatibility
export const LEGACY_PATHS = {
    pages: 'pages',
    slugs: 'slugs',
} as const;

/**
 * Get the new linko pages node
 */
export const getLinkoPages = (gun: IGunInstance<any>) => {
    return gun.get('shogun').get('linko').get('pages');
};

/**
 * Get the new linko slugs node
 */
export const getLinkoSlugs = (gun: IGunInstance<any>) => {
    return gun.get('shogun').get('linko').get('slugs');
};

/**
 * Get legacy pages node (for fallback reads)
 */
export const getLegacyPages = (gun: IGunInstance<any>) => {
    return gun.get('pages');
};

/**
 * Get legacy slugs node (for fallback reads)
 */
export const getLegacySlugs = (gun: IGunInstance<any>) => {
    return gun.get('slugs');
};

/**
 * Resolve a slug to pageId, checking new path first then legacy
 */
export const resolveSlugWithFallback = (
    gun: IGunInstance<any>,
    slug: string
): Promise<string | null> => {
    return new Promise((resolve) => {
        // Try new path first
        getLinkoSlugs(gun).get(slug).once((newPathId: string) => {
            if (newPathId) {
                resolve(newPathId);
                return;
            }

            // Fallback to legacy path
            getLegacySlugs(gun).get(slug).once((legacyId: string) => {
                resolve(legacyId || null);
            });
        });

        // Timeout after 2 seconds
        setTimeout(() => resolve(null), 2000);
    });
};

/**
 * Get a page by ID, checking new path first then legacy
 */
export const getPageWithFallback = (
    gun: IGunInstance<any>,
    pageId: string
): Promise<{ node: any; isLegacy: boolean } | null> => {
    return new Promise((resolve) => {
        // Try new path first
        getLinkoPages(gun).get(pageId).once((newData: any) => {
            if (newData && !newData.deleted && newData.title) {
                resolve({ node: getLinkoPages(gun).get(pageId), isLegacy: false });
                return;
            }

            // Fallback to legacy path
            getLegacyPages(gun).get(pageId).once((legacyData: any) => {
                if (legacyData && !legacyData.deleted && legacyData.title) {
                    resolve({ node: getLegacyPages(gun).get(pageId), isLegacy: true });
                } else {
                    resolve(null);
                }
            });
        });

        // Timeout after 2 seconds
        setTimeout(() => resolve(null), 2000);
    });
};

/**
 * Load all pages from both new and legacy paths (for listing)
 */
export const loadAllPagesFromBothPaths = (
    gun: IGunInstance<any>,
    callback: (pageData: any, pageId: string, isLegacy: boolean) => void
): void => {
    // Load from new path
    getLinkoPages(gun).map().once((pageData: any, pageId: string) => {
        if (pageData && pageData.title && !pageData.deleted) {
            callback(pageData, pageId, false);
        }
    });

    // Load from legacy path
    getLegacyPages(gun).map().once((pageData: any, pageId: string) => {
        if (pageData && pageData.title && !pageData.deleted) {
            callback(pageData, pageId, true);
        }
    });
};

/**
 * Check if slug is available in both paths
 */
export const checkSlugAvailability = (
    gun: IGunInstance<any>,
    slug: string,
    currentPageId?: string | null
): Promise<boolean> => {
    return new Promise((resolve) => {
        let checked = 0;
        let isAvailable = true;

        const checkDone = () => {
            checked++;
            if (checked >= 2) {
                resolve(isAvailable);
            }
        };

        // Check new path
        getLinkoSlugs(gun).get(slug).once((existingPageId: string) => {
            if (existingPageId && existingPageId !== currentPageId) {
                isAvailable = false;
            }
            checkDone();
        });

        // Check legacy path
        getLegacySlugs(gun).get(slug).once((existingPageId: string) => {
            if (existingPageId && existingPageId !== currentPageId) {
                isAvailable = false;
            }
            checkDone();
        });

        // Timeout after 1 second
        setTimeout(() => resolve(isAvailable), 1000);
    });
};
