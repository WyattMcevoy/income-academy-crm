import { useEffect } from 'react';

/**
 * Editorial celebration modal. Used for milestone moments:
 * - vendor flipped to Reporting
 * - tier unlocked
 * - score crossed a threshold (200, 500, 700, 890)
 *
 * Deliberately understated — no confetti, no balloons. Acknowledgment
 * of real progress, not manufactured dopamine (Robinhood lesson).
 *
 * Title is passed as React children so the caller controls emphasis
 * (use <em> for the copper-accent italic word).
 */
export default function CelebrationModal({ open, eyebrow, title, body, stat, onClose, onPrimaryAction, primaryLabel = 'Continue' }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose?.(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="cb-celebrate-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="cb-celebrate-card" onClick={(e) => e.stopPropagation()}>
        {eyebrow && <p className="cb-celebrate-eyebrow">{eyebrow}</p>}
        <h2 className="cb-celebrate-title">{title}</h2>
        {body && <p className="cb-celebrate-body">{body}</p>}

        {stat && (
          <div className="cb-celebrate-stat">
            <span className="cb-celebrate-stat-num">{stat.value}</span>
            <span className="cb-celebrate-stat-label">{stat.label}</span>
          </div>
        )}

        <div className="cb-celebrate-actions">
          <button className="cb-celebrate-btn cb-celebrate-btn-ghost" onClick={onClose}>
            Dismiss
          </button>
          {onPrimaryAction && (
            <button className="cb-celebrate-btn" onClick={() => { onPrimaryAction(); onClose?.(); }}>
              {primaryLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
