import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../auth.jsx';
import { api } from '../../api.js';
import { STEPS, SUB_PAGE_CONTENT, VENDOR_CATALOG } from './creditBuilderData.js';
import { computeFundabilityScore, SCORE_MAX, getItemWeight } from './scoreWeights.js';
import './fundability-report.css';

/**
 * Printable Fundability Report. Branded, exportable via the browser's
 * Save-as-PDF print flow. No new dependencies — uses @media print.
 *
 * Route: /credit-builder/report
 * Press Cmd/Ctrl+P or click "Save as PDF" to export.
 */
export default function FundabilityReport() {
  const { auth } = useAuth();
  const [data, setData] = useState(null);

  const load = useCallback(async () => {
    try {
      const [progress, vendors, funding] = await Promise.all([
        api('/api/credit-builder/progress', { token: auth.token }),
        api('/api/credit-builder/vendors', { token: auth.token }),
        api('/api/credit-builder/funding-events', { token: auth.token }),
      ]);
      const progressMap = {};
      progress.forEach(p => { progressMap[`${p.step}:${p.sub_item}`] = p; });
      const score = computeFundabilityScore(progressMap);
      setData({ progressMap, vendors, funding, score });
    } catch (e) {
      console.error('report load failed', e);
    }
  }, [auth.token]);

  useEffect(() => { load(); }, [load]);

  if (!data) return <div className="cb-report-loading">Preparing your Fundability Report…</div>;

  const { progressMap, vendors, funding, score } = data;
  const reportingByBureau = { 'D&B': 0, 'Experian': 0, 'Equifax': 0 };
  const reportingNames = new Set();
  vendors.forEach(v => {
    if (v.completed && reportingByBureau[v.bureau] !== undefined) {
      reportingByBureau[v.bureau]++;
      reportingNames.add(v.vendor_name);
    }
  });

  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const tierMap = { 1: 0, 2: 0, 3: 0, 4: 0 };
  reportingNames.forEach(n => {
    for (const [tier, list] of Object.entries(VENDOR_CATALOG)) {
      if (list.find(v => v.name === n)) tierMap[tier]++;
    }
  });

  return (
    <div className="cb-report-page">
      <div className="cb-report-actions no-print">
        <button onClick={() => window.print()} className="cb-report-print-btn">Save as PDF / Print</button>
        <a href="/credit-builder" className="cb-report-back">← Back to Credit Builder</a>
      </div>

      <article className="cb-report-doc">
        <header className="cb-report-header">
          <div className="cb-report-brand">
            <span className="cb-report-brand-mark">IA</span>
            <span className="cb-report-brand-name">Income Academy</span>
          </div>
          <div className="cb-report-meta">
            <span className="cb-report-meta-label">Prepared</span>
            <span className="cb-report-meta-value">{today}</span>
          </div>
        </header>

        <h1 className="cb-report-title">
          Fundability <em>Report</em>
        </h1>
        <p className="cb-report-subtitle">
          A complete picture of your business credit profile and the path to your next funding tier.
        </p>

        <section className="cb-report-score-block">
          <div className="cb-report-score-num">{score}</div>
          <div className="cb-report-score-details">
            <span className="cb-report-score-max">/ {SCORE_MAX}</span>
            <span className="cb-report-score-label">Credit Readiness Score</span>
            <div className="cb-report-score-bar">
              <div className="cb-report-score-bar-fill" style={{ width: `${(score / SCORE_MAX) * 100}%` }} />
            </div>
          </div>
        </section>

        <section className="cb-report-section">
          <h2 className="cb-report-h2">Bureau Coverage</h2>
          <div className="cb-report-bureau-grid">
            {Object.entries(reportingByBureau).map(([bureau, n]) => (
              <div key={bureau} className="cb-report-bureau-card">
                <span className="cb-report-bureau-name">{bureau}</span>
                <span className="cb-report-bureau-count">{n}</span>
                <span className="cb-report-bureau-sub">{n === 1 ? 'account reporting' : 'accounts reporting'}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="cb-report-section">
          <h2 className="cb-report-h2">Tier Progression</h2>
          <ol className="cb-report-tier-list">
            {[
              { n: 1, label: 'Starter trade (Tier 1)', target: 3, current: tierMap[1] },
              { n: 2, label: 'Retail revolving (Tier 2)', target: 6, current: tierMap[2] + tierMap[1] },
              { n: 3, label: 'Fleet & fuel (Tier 3)', target: 9, current: tierMap[3] + tierMap[2] + tierMap[1] },
              { n: 4, label: 'Cash / no-PG cards (Tier 4)', target: 12, current: tierMap[4] + tierMap[3] + tierMap[2] + tierMap[1] },
            ].map(t => (
              <li key={t.n} className="cb-report-tier-item">
                <span className="cb-report-tier-num">{String(t.n).padStart(2, '0')}</span>
                <div className="cb-report-tier-body">
                  <span className="cb-report-tier-label">{t.label}</span>
                  <span className="cb-report-tier-count">{Math.min(t.current, t.target)} of {t.target} reporting</span>
                </div>
                <span className={`cb-report-tier-status ${t.current >= t.target ? 'is-complete' : ''}`}>
                  {t.current >= t.target ? 'Complete' : `${t.target - t.current} to go`}
                </span>
              </li>
            ))}
          </ol>
        </section>

        <section className="cb-report-section">
          <h2 className="cb-report-h2">Foundation Checklist</h2>
          <div className="cb-report-foundation-grid">
            {STEPS.filter(s => s.step === 1 || s.step === 2).map(step =>
              step.subItems.map(si => {
                const entry = progressMap[`${step.step}:${si.slug}`];
                const done = entry?.completed;
                const weight = getItemWeight(si.slug);
                return (
                  <div key={si.slug} className={`cb-report-foundation-item ${done ? 'is-done' : ''}`}>
                    <span className="cb-report-foundation-check">{done ? '●' : '○'}</span>
                    <span className="cb-report-foundation-label">{si.name}</span>
                    {weight > 0 && <span className="cb-report-foundation-pts">{weight} pts</span>}
                  </div>
                );
              })
            )}
          </div>
        </section>

        {reportingNames.size > 0 && (
          <section className="cb-report-section">
            <h2 className="cb-report-h2">Reporting Accounts</h2>
            <ul className="cb-report-vendor-list">
              {Array.from(reportingNames).map(name => (
                <li key={name} className="cb-report-vendor">{name}</li>
              ))}
            </ul>
          </section>
        )}

        {funding?.events?.length > 0 && (
          <section className="cb-report-section">
            <h2 className="cb-report-h2">Approved Funding</h2>
            <div className="cb-report-funding-total">
              ${Number(funding.total).toLocaleString()}
              <span className="cb-report-funding-total-label">Total approved</span>
            </div>
            <ul className="cb-report-funding-list">
              {funding.events.map(ev => (
                <li key={ev.id} className="cb-report-funding-row">
                  <span className="cb-report-funding-label">{ev.label}</span>
                  {ev.source && <span className="cb-report-funding-source">{ev.source}</span>}
                  <span className="cb-report-funding-amt">${Number(ev.amount).toLocaleString()}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        <footer className="cb-report-footer">
          <p className="cb-report-disclaimer">
            This report is generated from data you have provided and tracked in the Income Academy
            Credit Builder. It is not a credit decision, a guarantee of funding, or a substitute for
            a credit report pulled directly from D&B, Experian, or Equifax. Use this report alongside
            your business credit reports when meeting with bankers, lenders, and CPAs.
          </p>
          <p className="cb-report-footer-mark">
            Income Academy · Fundability Report · {today}
          </p>
        </footer>
      </article>
    </div>
  );
}
