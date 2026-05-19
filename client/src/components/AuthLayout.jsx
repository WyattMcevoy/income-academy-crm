import { useEffect } from 'react';
import '../auth.css';

const FEATURES = [
  { num: '01', label: 'Business credit, methodically.', body: 'Track your credit readiness score, vendor tiers, and bureau reporting in one operating system.' },
  { num: '02', label: 'Pipeline that earns its keep.', body: 'Leads, clients, expenses, and revenue — all the surface area, none of the clutter.' },
  { num: '03', label: 'Built for serious operators.', body: 'Designed for people building real income, not chasing dashboards.' },
];

export default function AuthLayout({ children }) {
  // Inject Google Fonts on mount so they aren't bundled into every page.
  useEffect(() => {
    const id = 'auth-fonts';
    if (document.getElementById(id)) return;
    const link = document.createElement('link');
    link.id = id;
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;1,9..144,500&family=Geist:wght@400;500;600&family=Geist+Mono:wght@500&display=swap';
    document.head.appendChild(link);
  }, []);

  return (
    <div className="auth-page">
      <div className="auth-grain" aria-hidden="true" />
      <div className="auth-shell">
        <aside className="auth-marketing">
          <div className="auth-brand">
            <span className="auth-brand-mark">IA</span>
            <span className="auth-brand-divider" aria-hidden="true" />
            <span className="auth-brand-name">Income Academy</span>
          </div>

          <div className="auth-headline-block">
            <p className="auth-headline-eyebrow">The operating system for</p>
            <h1 className="auth-headline">
              people building <em>real income</em>.
            </h1>
            <p className="auth-headline-sub">
              Funding, credit readiness, and the pipeline that gets you there — one elegant workspace.
            </p>
          </div>

          <ol className="auth-features" aria-label="Features">
            {FEATURES.map(f => (
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
            &nbsp;Issue 0001 — Quietly excellent software for ambitious operators.
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
