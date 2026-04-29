// Income Academy — Member dashboard URL config
// Populated April 29, 2026 from GHL UI (course IDs harvested via Chrome,
// portal base from Memberships → Client Portal dashboard).
//
// To re-fetch via API later (when GHL exposes a Memberships v2 endpoint):
//   GHL_API_KEY=pit-xxx node server/src/tools/fetch-ghl-config.js
//
// Until portal.incomeacademy.biz custom domain is live, the default GHL
// client-portal subdomain serves all course content.

window.IA_GHL_CONFIG = {
  portalBase: 'https://c3hss74iljgye3pvgshg.app.clientclub.net/',
  courses: {
    ai:           'https://c3hss74iljgye3pvgshg.app.clientclub.net/products/d4c2b0c2-dee8-4ccf-8d5b-cd37e1eef075',
    affiliate:    'https://c3hss74iljgye3pvgshg.app.clientclub.net/products/4883bfbe-c2d7-4d08-b8b9-4fe130942e07',
    estate:       'https://c3hss74iljgye3pvgshg.app.clientclub.net/products/bdaf7829-7472-443c-af7e-6b60b131c406',
    bookkeeping:  'https://c3hss74iljgye3pvgshg.app.clientclub.net/products/f328cbc0-e1db-4c24-90d4-83469a5252a8',
  },
  generatedAt: '2026-04-29T17:30:00.000Z',
};
