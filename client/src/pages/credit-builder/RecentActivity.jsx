import { STEPS } from './creditBuilderData.js';

/**
 * "Recent activity" sidebar card.
 * Shows the last few completed credit builder items, derived from the
 * existing progress map (no extra API call). Status dot is green for
 * completed items, gray for the implicit "joined" event.
 */
function timeAgo(ts) {
  if (!ts) return '';
  const d = new Date(ts);
  const diffMin = Math.floor((Date.now() - d.getTime()) / 60000);
  if (diffMin < 1) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffMin < 1440) return `${Math.floor(diffMin / 60)}h ago`;
  return `${Math.floor(diffMin / 1440)}d ago`;
}

function getItemName(slug) {
  for (const step of STEPS) {
    const si = step.subItems.find(s => s.slug === slug);
    if (si) return si.name;
  }
  return slug;
}

export default function RecentActivity({ progress }) {
  const completed = Object.values(progress)
    .filter(p => p.completed && p.updated_at)
    .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
    .slice(0, 3);

  return (
    <div className="cb-recent-card">
      <span className="cb-recent-eyebrow">Recent activity</span>
      <ul className="cb-recent-list">
        {completed.length === 0 && (
          <li className="cb-recent-empty">
            <span className="cb-recent-dot cb-recent-dot-system" />
            <span className="cb-recent-name">Joined Credit Workshop</span>
          </li>
        )}
        {completed.map(p => (
          <li key={`${p.step}:${p.sub_item}`} className="cb-recent-item">
            <span className="cb-recent-dot" />
            <span className="cb-recent-name">Completed {getItemName(p.sub_item)}</span>
            <span className="cb-recent-time">{timeAgo(p.updated_at)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
