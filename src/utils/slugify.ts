/**
 * Converts a string to a URL-friendly slug
 */
export const slugify = (text: string): string => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
};

/**
 * Validates a slug - only lowercase letters, numbers, and hyphens
 */
export const isValidSlug = (slug: string): boolean => {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
};

/**
 * Reserved slugs that cannot be used
 */
export const RESERVED_SLUGS = [
  'view',
  'edit',
  'admin',
  'api',
  'login',
  'logout',
  'register',
  'signup',
  'dashboard',
  'settings',
  'profile',
  'home',
  'index',
  'my-pages',
  'mypages',
  'pages',
];

/**
 * Checks if a slug is available (not reserved)
 */
export const isSlugAvailable = (slug: string): boolean => {
  return !RESERVED_SLUGS.includes(slug.toLowerCase());
};

