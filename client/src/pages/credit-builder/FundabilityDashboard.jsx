import { useState } from 'react';
import { SUB_PAGE_CONTENT } from './creditBuilderData.js';

// Kick Start palette — original donut colors
const CATEGORIES = [
  {
    name: 'Foundation',
    color: '#0fa888',
    items: [
      { slug: 'business-address', name: 'Business Address', step: 1 },
      { slug: 'business-entity', name: 'Business Entity', step: 1 },
      { slug: 'foreign-filing', name: 'Foreign Filing', step: 1 },
      { slug: 'ownership', name: 'Ownership', step: 1 },
      { slug: 'ein', name: 'EIN', step: 1 },
      { slug: 'business-phone', name: 'Business Phone', step: 1 },
      { slug: 'website-email', name: 'Website and Email', step: 1 },
      { slug: 'business-licenses', name: 'Business Licenses', step: 1 },
      { slug: 'merchant-account', name: 'Merchant Account', step: 1 },
      { slug: 'business-industry', name: 'Industry', step: 1 },
      { slug: 'time-in-business', name: 'Time in Business', step: 1 },
    ],
  },
  {
    name: 'Financials',
    color: '#196499',
    items: [
      { slug: 'business-bank-account', name: 'Business Bank Account', step: 1 },
    ],
  },
  {
    name: 'Business Credit',
    color: '#f5a623',
    items: [
      { slug: 'dnb-verification', name: 'D&B Verification', step: 2 },
      { slug: 'experian-verification', name: 'Experian Verification', step: 2 },
      { slug: 'equifax-verification', name: 'Equifax Verification', step: 2 },
      { slug: 'addressing-inaccuracies', name: 'Addressing Inaccuracies', step: 2 },
    ],
  },
  {
    name: 'Personal',
    color: '#fbbf24',
    items: [
      { slug: 'lexisnexis', name: 'LexisNexis', step: 4 },
      { slug: 'chex-systems', name: 'ChexSystems', step: 4 },
    ],
  },
  {
    name: 'Application Process',
    color: '#f5d76e',
    items: [
      { slug: 'paydex-score', name: 'Paydex Score', step: 4 },
    ],
  },
];

// SVG donut geometry
const CX = 200;
const CY = 200;
const OUTER_R = 160;
const INNER_R = 100;
const ACTIVE_OUTER_R = 170;
const SEGMENT_COUNT = 5;
const SEGMENT_ANGLE = 360 / SEGMENT_COUNT; // 72 degrees
const START_OFFSET = -90; // start from top

function polarToCartesian(cx, cy, r, angleDeg) {
  const rad = (angleDeg * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function describeArc(cx, cy, outerR, innerR, startAngle, endAngle) {
  const outerStart = polarToCartesian(cx, cy, outerR, startAngle);
  const outerEnd = polarToCartesian(cx, cy, outerR, endAngle);
  const innerStart = polarToCartesian(cx, cy, innerR, endAngle);
  const innerEnd = polarToCartesian(cx, cy, innerR, startAngle);
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;

  return [
    `M ${outerStart.x} ${outerStart.y}`,
    `A ${outerR} ${outerR} 0 ${largeArc} 1 ${outerEnd.x} ${outerEnd.y}`,
    `L ${innerStart.x} ${innerStart.y}`,
    `A ${innerR} ${innerR} 0 ${largeArc} 0 ${innerEnd.x} ${innerEnd.y}`,
    'Z',
  ].join(' ');
}

function getItemStatus(item, progress) {
  const key = `${item.step}:${item.slug}`;
  const entry = progress?.[key];
  if (!entry) return 'not-started';
  if (entry.completed) return 'completed';
  if (entry.selected_option) {
    const subContent = SUB_PAGE_CONTENT[item.slug];
    if (subContent?.followUp?.[entry.selected_option]?.status === 'negative') {
      return 'negative';
    }
  }
  return 'not-started';
}

function StatusIcon({ status }) {
  if (status === 'completed') return <span className="cb-fd-item-status cb-fd-status-completed">✅</span>;
  if (status === 'negative') return <span className="cb-fd-item-status cb-fd-status-negative">❌</span>;
  return <span className="cb-fd-item-status cb-fd-status-pending">⭕</span>;
}

export default function FundabilityDashboard({ score, progress, onNavigateToItem }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeCategory = CATEGORIES[activeIndex];

  // Find the first non-completed item for "Start Here"
  const firstIncompleteIndex = activeCategory.items.findIndex(
    (item) => getItemStatus(item, progress) !== 'completed'
  );

  return (
    <div className="cb-fd-container">
      {/* Donut Chart */}
      <div className="cb-fd-chart">
        <svg viewBox="-60 -20 520 440" width="460" height="400">
          {/* Segment arcs */}
          {CATEGORIES.map((cat, i) => {
            const isActive = i === activeIndex;
            const startAngle = START_OFFSET + i * SEGMENT_ANGLE;
            const endAngle = startAngle + SEGMENT_ANGLE;
            const outerR = isActive ? ACTIVE_OUTER_R : OUTER_R;
            const gap = 1.5; // small gap between segments
            const d = describeArc(CX, CY, outerR, INNER_R, startAngle + gap, endAngle - gap);

            return (
              <path
                key={cat.name}
                className={`cb-fd-segment ${isActive ? 'cb-fd-segment-active' : ''}`}
                d={d}
                fill={cat.color}
                stroke={isActive ? '#fff' : 'none'}
                strokeWidth={isActive ? 2 : 0}
                style={{ cursor: 'pointer', opacity: isActive ? 1 : 0.85 }}
                onClick={() => setActiveIndex(i)}
              />
            );
          })}

          {/* External labels — Mercury-style legend, leader line from outer edge */}
          {CATEGORIES.map((cat, i) => {
            const isActive = i === activeIndex;
            const midAngle = START_OFFSET + i * SEGMENT_ANGLE + SEGMENT_ANGLE / 2;
            const outerR = isActive ? ACTIVE_OUTER_R : OUTER_R;
            const innerEnd = polarToCartesian(CX, CY, outerR + 6, midAngle);
            const labelAnchor = polarToCartesian(CX, CY, outerR + 28, midAngle);
            const normalizedMid = ((midAngle % 360) + 360) % 360;
            const onRight = normalizedMid < 90 || normalizedMid > 270;
            const textX = labelAnchor.x + (onRight ? 4 : -4);
            const textAnchor = onRight ? 'start' : 'end';
            return (
              <g key={`label-${cat.name}`} style={{ pointerEvents: 'none' }}>
                <line
                  x1={innerEnd.x} y1={innerEnd.y}
                  x2={labelAnchor.x} y2={labelAnchor.y}
                  stroke={cat.color}
                  strokeWidth="1"
                  opacity={isActive ? 1 : 0.6}
                />
                <text
                  x={textX}
                  y={labelAnchor.y}
                  textAnchor={textAnchor}
                  dominantBaseline="middle"
                  fontSize="11"
                  fontWeight={isActive ? 700 : 600}
                  fill={isActive ? cat.color : '#374151'}
                  style={{ fontFamily: "'Montserrat', sans-serif", letterSpacing: '0.04em' }}
                >
                  {cat.name}
                </text>
              </g>
            );
          })}

          {/* Center score */}
          <text
            className="cb-fd-score-center"
            x={CX}
            y={CY - 8}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize="42"
            fontWeight="700"
            fill="#0b3954"
            style={{ fontFamily: "'Montserrat', sans-serif" }}
          >
            {score ?? 0}
          </text>
          <text
            x={CX}
            y={CY + 24}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize="10"
            fill="#0fa888"
            fontWeight="500"
            style={{ fontFamily: "'Montserrat', sans-serif" }}
          >
            Credit Readiness Score
          </text>
        </svg>
      </div>

      {/* Connector — gear icon with line */}
      <div className="cb-fd-connector">
        <svg width="48" height="200" viewBox="0 0 48 200">
          <line x1="24" y1="0" x2="24" y2="200" stroke="#d1d5db" strokeWidth="1.5" />
          <circle cx="24" cy="100" r="14" fill="#f3f4f6" stroke="#d1d5db" strokeWidth="1.5" />
          {/* Simple gear icon */}
          <path
            d="M24 90 L25.5 93 L28.5 93 L26.5 95.5 L27.5 98.5 L24 97 L20.5 98.5 L21.5 95.5 L19.5 93 L22.5 93 Z"
            fill="#9ca3af"
          />
          <circle cx="24" cy="95" r="2" fill="#f3f4f6" />
        </svg>
      </div>

      {/* Item List */}
      <div className="cb-fd-items">
        <h3
          className="cb-fd-category-title"
          style={{ color: activeCategory.color }}
        >
          {activeCategory.name}
        </h3>

        <div className="cb-fd-item-list">
          {activeCategory.items.map((item, i) => {
            const status = getItemStatus(item, progress);
            const isFirstIncomplete = i === firstIncompleteIndex;

            return (
              <div
                key={item.slug}
                className="cb-fd-item"
                onClick={() => onNavigateToItem?.(item.step, item.slug)}
                style={{ cursor: 'pointer' }}
              >
                <StatusIcon status={status} />
                <span className="cb-fd-item-name">{item.name}</span>
                {isFirstIncomplete && (
                  <button
                    className="cb-fd-start-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      onNavigateToItem?.(item.step, item.slug);
                    }}
                  >
                    Start Here
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
