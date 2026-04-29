// Income Academy — Member dashboard URL config
// Single source of truth for all GHL course / portal URLs.
//
// To populate automatically:
//   GHL_API_KEY=pit-xxx node server/src/tools/fetch-ghl-config.js
//
// To populate by hand:
//   1. Open each course in GHL → Memberships → click "Share" / "View as Member"
//   2. Paste the URL into the matching slot below
//   3. Save the file, deploy
//
// Until URLs are populated (still starting "GHL_..."), the dashboard CTAs
// fall back to a graceful "lessons portal is being set up" message so
// members never see a broken link.

window.IA_GHL_CONFIG = {
  portalBase: 'GHL_PORTAL_BASE_URL',
  courses: {
    ai:           'GHL_COURSE_URL_AI',
    affiliate:    'GHL_COURSE_URL_AFFILIATE',
    estate:       'GHL_COURSE_URL_ESTATE',
    bookkeeping:  'GHL_COURSE_URL_BOOKKEEPING',
  },
  // Filled in by fetch-ghl-config.js — informational only
  generatedAt: null,
};
