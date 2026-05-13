export default function ScoreGauge({ score, maxScore = 890 }) {
  const pct = Math.min(score / maxScore, 1);
  const angle = -90 + pct * 180;

  return (
    <div className="cb-gauge">
      <svg viewBox="0 0 200 120" className="cb-gauge-svg">
        {/* Background arc */}
        <path
          d="M 20 100 A 80 80 0 0 1 180 100"
          fill="none"
          stroke="#e5e7eb"
          strokeWidth="12"
          strokeLinecap="round"
        />
        {/* Colored arc */}
        <path
          d="M 20 100 A 80 80 0 0 1 180 100"
          fill="none"
          stroke="#196499"
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={`${pct * 251.3} 251.3`}
        />
        {/* Needle */}
        <line
          x1="100"
          y1="100"
          x2={100 + 60 * Math.cos((angle * Math.PI) / 180)}
          y2={100 + 60 * Math.sin((angle * Math.PI) / 180)}
          stroke="#1a1a1a"
          strokeWidth="2"
        />
        <circle cx="100" cy="100" r="4" fill="#1a1a1a" />
        {/* Score text */}
        <text x="100" y="85" textAnchor="middle" fontSize="32" fontWeight="600" fill="#1a1a1a">
          {score}
        </text>
        {/* Labels */}
        <text x="20" y="115" textAnchor="middle" fontSize="10" fill="#6b7280">0</text>
        <text x="100" y="60" textAnchor="middle" fontSize="9" fill="#6b7280">Fundability Score™</text>
        <text x="180" y="115" textAnchor="middle" fontSize="10" fill="#6b7280">{maxScore}</text>
      </svg>
    </div>
  );
}
