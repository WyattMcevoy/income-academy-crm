import { useState, useEffect } from 'react';
import { useAuth } from '../../auth.jsx';
import { api } from '../../api.js';

/**
 * Compact sparkline + delta caption. Pulls the last N score recordings.
 * Sits next to the gauge in the right rail.
 */
export default function ScoreHistoryChart({ refreshKey, maxScore = 890 }) {
  const { auth } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const rows = await api('/api/credit-builder/score/history', { token: auth.token });
        if (!alive) return;
        setHistory(Array.isArray(rows) ? rows.slice().reverse() : []); // oldest → newest
      } catch (e) {
        console.error('score history load failed', e);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [auth.token, refreshKey]);

  if (loading) return null;
  if (history.length < 2) {
    return (
      <div className="cb-spark-empty">
        <span className="cb-spark-empty-text">Score history begins after your first completed item.</span>
      </div>
    );
  }

  const points = history.map(h => Number(h.score) || 0);
  const W = 220, H = 56, PAD = 4;
  const min = Math.min(...points);
  const max = Math.max(...points, min + 1);
  const range = max - min || 1;
  const xs = points.map((_, i) => PAD + (i / (points.length - 1)) * (W - PAD * 2));
  const ys = points.map(p => H - PAD - ((p - min) / range) * (H - PAD * 2));
  const path = xs.map((x, i) => `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${ys[i].toFixed(1)}`).join(' ');
  const area = `${path} L ${xs[xs.length - 1].toFixed(1)} ${H - PAD} L ${PAD} ${H - PAD} Z`;

  const first = points[0];
  const last = points[points.length - 1];
  const delta = last - first;
  const sign = delta > 0 ? '+' : delta < 0 ? '−' : '';
  const absDelta = Math.abs(delta);
  const lastRecorded = history[history.length - 1]?.recorded_at;
  const days = lastRecorded ? Math.max(1, Math.round((Date.now() - new Date(history[0].recorded_at)) / 86400000)) : null;

  return (
    <div className="cb-spark">
      <svg viewBox={`0 0 ${W} ${H}`} className="cb-spark-svg" preserveAspectRatio="none">
        <defs>
          <linearGradient id="cb-spark-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0.25" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={area} fill="url(#cb-spark-fill)" />
        <path d={path} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx={xs[xs.length - 1]} cy={ys[ys.length - 1]} r="2.5" fill="currentColor" />
      </svg>
      <div className="cb-spark-caption">
        <span className={`cb-spark-delta ${delta > 0 ? 'cb-spark-delta-up' : delta < 0 ? 'cb-spark-delta-down' : ''}`}>
          {sign}{absDelta}
        </span>
        <span className="cb-spark-sub">
          {days ? `over the last ${days} day${days === 1 ? '' : 's'}` : 'this period'}
        </span>
      </div>
    </div>
  );
}
