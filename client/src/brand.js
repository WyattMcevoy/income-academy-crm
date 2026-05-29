/**
 * Hostname-aware brand identity.
 *
 * One React app, two product surfaces:
 *  - thecreditworkshop.biz / .com → Credit Workshop brand (v4 Stripe-style)
 *  - dashboard.incomeacademy.biz  → Income Academy CRM brand (editorial)
 *
 * Everything that shows branding (logo, name, page title, post-login redirect,
 * sidebar, login form) asks this hook so it stays consistent.
 */

const CREDIT_WORKSHOP_HOSTS = /^(www\.)?thecreditworkshop\.(biz|com)$/i;

export const BRANDS = {
  CREDIT_WORKSHOP: {
    id: 'credit-workshop',
    name: 'Credit Workshop',
    short: 'Credit Workshop',
    mark: 'CW',
    tagline: 'Business credit, methodically built.',
    titleSuffix: 'Credit Workshop',
    // where to send users after they sign in / register
    postAuthRedirect: '/credit-builder',
    // which menu items they should see in the sidebar
    sidebarItems: ['credit-builder', 'expenses'],
    // signal which CSS theme to load
    theme: 'cw',
  },
  INCOME_ACADEMY: {
    id: 'income-academy',
    name: 'Income Academy',
    short: 'Income Academy',
    mark: 'IA',
    tagline: 'The operating system for people building real income.',
    titleSuffix: 'Income Academy',
    postAuthRedirect: '/',
    sidebarItems: null, // null = show all
    theme: 'ia',
  },
};

export function detectBrand(hostname = typeof window !== 'undefined' ? window.location.hostname : '') {
  if (CREDIT_WORKSHOP_HOSTS.test(hostname)) return BRANDS.CREDIT_WORKSHOP;
  return BRANDS.INCOME_ACADEMY;
}

/**
 * React hook. Returns the active brand object for the current hostname.
 * Memoized at module level since hostname doesn't change after page load.
 */
let cached = null;
export function useBrand() {
  if (typeof window === 'undefined') return BRANDS.INCOME_ACADEMY;
  if (!cached) cached = detectBrand();
  return cached;
}
