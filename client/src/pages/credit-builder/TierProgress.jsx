/**
 * "Tier Progress" sidebar card.
 * Shows the 4-tier journey as connected dots and how many more reporting
 * accounts unlock the next tier. Fills space on the right rail so the
 * column heights stay balanced with the middle column.
 */

const TIERS = [
  { n: 1, label: 'Starter trade', target: 3 },
  { n: 2, label: 'Retail revolving', target: 6 },
  { n: 3, label: 'Fleet & fuel', target: 9 },
  { n: 4, label: 'No-PG cards', target: 12 },
];

export default function TierProgress({ vendors = [] }) {
  const reporting = new Set(
    vendors.filter(v => v.completed).map(v => v.vendor_name)
  ).size;

  // Determine current tier + next tier
  let currentTierNum = 0;
  for (const t of TIERS) {
    if (reporting >= t.target) currentTierNum = t.n;
  }
  const nextTier = TIERS.find(t => t.n === currentTierNum + 1);

  return (
    <div className="cb-tier-card">
      <span className="cb-tier-eyebrow">Tier progress</span>

      <div className="cb-tier-rail">
        {TIERS.map((t, i) => {
          const done = reporting >= t.target;
          const isNext = !done && t.n === currentTierNum + 1;
          return (
            <div key={t.n} className="cb-tier-rail-cell">
              <div
                className={`cb-tier-dot ${done ? 'is-done' : ''} ${isNext ? 'is-next' : ''}`}
                title={`${t.label} (${t.target} reporting)`}
              >
                {done ? '✓' : t.n}
              </div>
              {i < TIERS.length - 1 && (
                <div className={`cb-tier-line ${done ? 'is-done' : ''}`} />
              )}
            </div>
          );
        })}
      </div>

      {nextTier ? (
        <p className="cb-tier-next">
          <strong>{nextTier.target - reporting}</strong> more reporting account
          {nextTier.target - reporting === 1 ? '' : 's'} to unlock{' '}
          <strong>Tier {nextTier.n}</strong>
        </p>
      ) : (
        <p className="cb-tier-next cb-tier-done">All four tiers complete</p>
      )}
    </div>
  );
}
