import { pool } from './db/pool.js';

const RESOURCE_LINKS = [
  { sub_item: 'business-address', name: 'iPostal1', url: 'https://ipostal1.com/virtual-business-address.php' },
  { sub_item: 'business-address', name: 'Northwest Registered Agent', url: 'https://www.northwestregisteredagent.com/' },
  { sub_item: 'business-entity', name: 'Bizee', url: 'https://bizee.com/' },
  { sub_item: 'ein', name: 'IRS EIN Application', url: 'https://www.irs.gov/businesses/small-businesses-self-employed/get-an-employer-identification-number' },
  { sub_item: 'business-phone', name: 'Phone.com', url: 'https://www.phone.com/' },
  { sub_item: 'business-bank-account', name: 'Relay Financial', url: 'https://relayfi.com/' },
  { sub_item: 'dnb-verification', name: 'Dun & Bradstreet', url: 'https://www.dnb.com/en-us/smb/duns/get-a-duns.html' },
  { sub_item: 'experian-verification', name: 'Experian Business', url: 'https://www.experian.com/small-business/business-information' },
  { sub_item: 'equifax-verification', name: 'Equifax Business', url: 'https://www.equifax.com/business/product/business-credit-reports-small-business/' },
  { sub_item: 'addressing-inaccuracies', name: 'DisputeBee', url: 'https://disputebee.com/' },
  { sub_item: 'lexisnexis', name: 'LexisNexis', url: 'https://consumer.risk.lexisnexis.com/request' },
  { sub_item: 'chex-systems', name: 'ChexSystems', url: 'https://www.chexsystems.com/request-reports/consumer-disclosure' },
  { sub_item: 'paydex-score', name: 'Nav', url: 'https://www.nav.com/business-credit-scores/' },
];

async function checkUrl(link) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  try {
    const res = await fetch(link.url, {
      method: 'HEAD',
      signal: controller.signal,
      headers: { 'User-Agent': 'IncomeAcademy-LinkChecker/1.0' },
      redirect: 'follow',
    });
    clearTimeout(timeout);

    // Some sites block HEAD, retry with GET
    if (res.status === 405 || res.status === 403) {
      const getRes = await fetch(link.url, {
        method: 'GET',
        signal: AbortSignal.timeout(15000),
        headers: { 'User-Agent': 'IncomeAcademy-LinkChecker/1.0' },
        redirect: 'follow',
      });
      return { ...link, status_code: getRes.status, ok: getRes.ok, error_message: null };
    }

    return { ...link, status_code: res.status, ok: res.ok, error_message: null };
  } catch (e) {
    clearTimeout(timeout);
    return { ...link, status_code: null, ok: false, error_message: e.message?.substring(0, 255) };
  }
}

export async function runLinkHealthCheck() {
  const results = [];

  for (const link of RESOURCE_LINKS) {
    const result = await checkUrl(link);
    results.push(result);

    try {
      await pool.query(
        `INSERT INTO link_health_checks (url, resource_name, sub_item, status_code, ok, error_message, checked_at)
         VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
        [result.url, result.name, result.sub_item, result.status_code, result.ok, result.error_message]
      );
    } catch (e) {
      console.error('Failed to save link check result:', e.code || 'unknown');
    }
  }

  const broken = results.filter(r => !r.ok);
  if (broken.length > 0) {
    console.warn(`Link health check: ${broken.length}/${results.length} broken links:`);
    broken.forEach(b => console.warn(`  - ${b.name}: ${b.url} (${b.status_code || b.error_message})`));
  } else {
    console.log(`Link health check: all ${results.length} links OK`);
  }

  return results;
}

// Schedule periodic checks (every 24 hours)
let intervalId = null;

export function startPeriodicChecks(intervalMs = 24 * 60 * 60 * 1000) {
  // Run immediately on startup (after 30s delay to let server settle)
  setTimeout(() => runLinkHealthCheck(), 30000);

  intervalId = setInterval(() => runLinkHealthCheck(), intervalMs);
  console.log(`Link health checker scheduled every ${Math.round(intervalMs / 3600000)}h`);
}

export function stopPeriodicChecks() {
  if (intervalId) clearInterval(intervalId);
}
