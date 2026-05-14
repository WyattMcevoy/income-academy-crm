// Impact-weighted fundability scoring.
// Each sub-item carries the points it adds to the 0–890 Fundability Score
// when marked complete. Weights are based on what actually moves underwriting
// decisions (entity, EIN, bank account, bureau verification, vendor tiers
// reporting) rather than peripheral items (website, merchant account).
//
// Sum of all weights = 890.

export const SCORE_WEIGHTS = {
  // Step 1 — Fundability Foundation (350 pts)
  'business-entity': 60,
  'ein': 60,
  'business-bank-account': 50,
  'business-address': 40,
  'ownership': 30,
  'business-phone': 30,
  'foreign-filing': 30,
  'time-in-business': 15,
  'business-industry': 15,
  'business-licenses': 10,
  'website-email': 10,
  'merchant-account': 0, // peripheral, no fundability weight

  // Step 2 — Bureau Profile Verification (200 pts)
  'dnb-verification': 70,
  'experian-verification': 60,
  'equifax-verification': 40,
  'addressing-inaccuracies': 30,

  // Step 3 — Tier 1 vendor milestone (120 pts)
  'vendor-accounts-3': 120,

  // Step 4 — Monitor Reports (60 pts)
  'bureau-insights': 15,
  'lexisnexis': 15,
  'chex-systems': 15,
  'paydex-score': 15,

  // Step 5 — Tier 2 milestone (70 pts)
  'vendor-accounts-6': 70,

  // Step 6 — Tier 3 milestone (60 pts)
  'vendor-accounts-9': 60,

  // Step 7 — Tier 4 milestone (30 pts)
  'vendor-accounts-12': 30,
};

export const SCORE_MAX = 890;

/**
 * Compute the fundability score from a progress map.
 * progress is keyed by `${step}:${slug}` (matching the existing structure).
 */
export function computeFundabilityScore(progress = {}) {
  let total = 0;
  Object.values(progress).forEach((entry) => {
    if (!entry?.completed || !entry?.sub_item) return;
    const w = SCORE_WEIGHTS[entry.sub_item];
    if (typeof w === 'number') total += w;
  });
  return Math.min(SCORE_MAX, Math.round(total));
}

/**
 * Return the sub-item's weight (for displaying "+50 points" labels).
 */
export function getItemWeight(slug) {
  return SCORE_WEIGHTS[slug] ?? 0;
}
