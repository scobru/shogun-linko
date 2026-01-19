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
 * Uses retry logic to handle slow relay connections on page refresh
 */
export const resolveSlugWithFallback = (
    gun: IGunInstance<any>,
    slug: string
): Promise<string | null> => {
    return new Promise((resolve) => {
        let resolved = false;
        let newPathChecked = false;
        let legacyPathChecked = false;
        let retryCount = 0;
        const maxRetries = 3;

        const checkComplete = () => {
            if (resolved) return;

            // Both paths checked and no result, try retry if available
            if (newPathChecked && legacyPathChecked && retryCount < maxRetries) {
                retryCount++;
                newPathChecked = false;
                legacyPathChecked = false;
                console.log(`[Linko] Slug "${slug}" not found, retry ${retryCount}/${maxRetries}...`);

                // Wait a bit before retrying to allow relay connections
                setTimeout(() => {
                    tryResolve();
                }, 1000);
            } else if (newPathChecked && legacyPathChecked) {
                // All retries exhausted
                resolve(null);
            }
        };

        const tryResolve = () => {
            // Try new path first
            getLinkoSlugs(gun).get(slug).once((newPathId: string) => {
                if (resolved) return;

                if (newPathId) {
                    resolved = true;
                    console.log(`[Linko] Slug "${slug}" resolved to ${newPathId} (new path)`);
                    resolve(newPathId);
                    return;
                }

                newPathChecked = true;

                // Fallback to legacy path
                getLegacySlugs(gun).get(slug).once((legacyId: string) => {
                    if (resolved) return;

                    if (legacyId) {
                        resolved = true;
                        console.log(`[Linko] Slug "${slug}" resolved to ${legacyId} (legacy path)`);
                        resolve(legacyId);
                        return;
                    }

                    legacyPathChecked = true;
                    checkComplete();
                });
            });
        };

        // Start resolution
        tryResolve();

        // Final timeout after 8 seconds (gives time for retries)
        setTimeout(() => {
            if (!resolved) {
                console.warn(`[Linko] Slug "${slug}" resolution timed out after 8s`);
                resolve(null);
            }
        }, 8000);
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

        // Timeout after 5 seconds (increased for slow relay connections)
        setTimeout(() => resolve(null), 5000);
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
