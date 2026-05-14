/**
 * Editorial score block — replaces the generic Credit-Karma-style half-circle
 * gauge. Mercury/Linear language: oversized variable serif numeral, thin
 * progress bar, mono eyebrow + caption. Reads "advisor-grade" not "free tool."
 */

const TIER_BANDS = [
  { min: 0,   max: 199, label: 'Establishing Foundation', tier: '0 of 4' },
  { min: 200, max: 399, label: 'Foundation Complete',     tier: '1 of 4' },
  { min: 400, max: 549, label: 'Building Credit',         tier: '2 of 4' },
  { min: 550, max: 699, label: 'Advanced Building',       tier: '3 of 4' },
  { min: 700, max: 890, label: 'Revolving / Fundable',    tier: '4 of 4' },
];

function getBand(score) {
  return TIER_BANDS.find(b => score >= b.min && score <= b.max) || TIER_BANDS[0];
}

export default function ScoreGauge({ score = 0, maxScore = 890 }) {
  const pct = Math.max(0, Math.min(100, (score / maxScore) * 100));
  const band = getBand(score);

  return (
    <div className="cb-score-block">
      <div className="cb-score-eyebrow">
        <span>Credit Readiness Score</span>
        <span className="cb-score-max">/ {maxScore}</span>
      </div>

      <div className="cb-score-number" aria-live="polite">
        {score}
      </div>

      <div
        className="cb-score-bar"
        role="progressbar"
        aria-valuenow={score}
        aria-valuemin={0}
        aria-valuemax={maxScore}
      >
        <div className="cb-score-bar-fill" style={{ width: `${pct}%` }} />
      </div>

      <div className="cb-score-caption">
        <span className="cb-score-tier">{band.tier}</span>
        <span className="cb-score-caption-dot">·</span>
        <span className="cb-score-tier-label">{band.label}</span>
      </div>
    </div>
  );
}
