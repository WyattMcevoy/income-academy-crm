import { useEffect } from 'react';
import { useBrand } from '../brand.js';
import '../auth.css';

/**
 * Hostname-aware auth shell.
 *
 * - thecreditworkshop.biz → clean Stripe-style: white bg, Inter sans,
 *   aurora glow, CW logo, sage/navy accents.
 * - dashboard.incomeacademy.biz → editorial: cream paper, Fraunces serif,
 *   IA brand block, side marketing rail.
 *
 * The wrapper sets `data-brand` and the auth.css selector tree handles
 * both themes from a single stylesheet.
 */

const IA_FEATURES = [
  { num: '01', label: 'Business credit, methodically.', body: 'Track your credit readiness score, vendor tiers, and bureau reporting in one operating system.' },
  { num: '02', label: 'Pipeline that earns its keep.', body: 'Leads, clients, expenses, and revenue — all the surface area, none of the clutter.' },
  { num: '03', label: 'Built for serious operators.', body: 'Designed for people building real income, not chasing dashboards.' },
];

const CW_FEATURES = [
  { num: '01', label: 'A measurable finish line.', body: 'Paydex 80, Tier-I file, funding-ready — in nine months, not nine years.' },
  { num: '02', label: 'The whole method.', body: 'Vendor sequence, bureau cadence, dashboard — all in one operating surface.' },
  { num: '03', label: "You own it when you're done.", body: 'No perpetual subscription. Buy the program, finish it, leave with the file.' },
];

export default function AuthLayout({ children }) {
  const brand = useBrand();

  // Auth uses the v4 Stripe-style skin universally now — load Inter once.
  useEffect(() => {
    const id = 'auth-fonts-v4';
    if (document.getElementById(id)) return;
    const link = document.createElement('link');
    link.id = id;
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Inter+Tight:wght@500;600;700;800&family=Geist+Mono:wght@400;500&display=swap';
    document.head.appendChild(link);
  }, []);

  const features = brand.id === 'credit-workshop' ? CW_FEATURES : IA_FEATURES;

  return (
    <div className="auth-page" data-brand={brand.id}>
      <div className="auth-grain" aria-hidden="true" />
      <div className="auth-shell">
        <aside className="auth-marketing">
          <div className="auth-brand">
            <span className="auth-brand-mark">{brand.mark}</span>
            <span className="auth-brand-divider" aria-hidden="true" />
            <span className="auth-brand-name">{brand.name}</span>
          </div>

          <div className="auth-headline-block">
            {brand.id === 'credit-workshop' ? (
              <>
                <p className="auth-headline-eyebrow">The operating system for</p>
                <h1 className="auth-headline">
                  business credit, <em>methodically built</em>.
                </h1>
                <p className="auth-headline-sub">
                  Paydex 80, a Tier-I vendor file, and funding-ready in nine months. No subscription that never ends.
                </p>
              </>
            ) : (
              <>
                <p className="auth-headline-eyebrow">The operating system for</p>
                <h1 className="auth-headline">
                  people building <em>real income</em>.
                </h1>
                <p className="auth-headline-sub">
                  Funding, credit readiness, and the pipeline that gets you there — one elegant workspace.
                </p>
              </>
            )}
          </div>

          <ol className="auth-features" aria-label="Features">
            {features.map(f => (
              <li key={f.num} className="auth-feature">
                <span className="auth-feature-num">{f.num}</span>
                <div className="auth-feature-body">
                  <p className="auth-feature-label">{f.label}</p>
                  <p className="auth-feature-text">{f.body}</p>
                </div>
              </li>
            ))}
          </ol>

          <p className="auth-footer-note">
            <span className="auth-pill">Vol. I</span>
            {brand.id === 'credit-workshop'
              ? <>&nbsp;Issue 0001 — Quietly excellent software for operators.</>
              : <>&nbsp;Issue 0001 — Quietly excellent software for ambitious operators.</>}
          </p>
        </aside>

        <main className="auth-form-panel">
          <div className="auth-form-frame">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
