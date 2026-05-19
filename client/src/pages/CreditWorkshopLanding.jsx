import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import './credit-workshop-landing.css';

/**
 * Public marketing landing page for Credit Workshop.
 * Synthesized from the top business-credit competitors' homepages:
 * - Credit Suite (Funding Blueprint lead magnet)
 * - Nav (numeric trust signals)
 * - Inc Authority (price-comparison table)
 * - Lendio (real customer photography pattern)
 *
 * Differentiation strategy: lead with the price collapse + 90-day MBG.
 * Category is dominated by corporate blue → we use sage + cream + gold.
 */

const TRUST_STRIP = [
  'CPA-reviewed playbook',
  '90-day money-back guarantee',
  'Reports to D&B, Experian, Equifax',
  'Flat $500 — no upsells',
];

const COMPARISON_ROWS = [
  { label: 'Price', cw: '$500', cs: '$2,997', diy: '$0 (your time)' },
  { label: 'CPA-reviewed playbook', cw: true, cs: false, diy: false },
  { label: '90-day money-back guarantee', cw: true, cs: false, diy: 'n/a' },
  { label: 'Lives inside your existing CRM', cw: true, cs: false, diy: false },
  { label: 'Time to 80+ Paydex', cw: '9 months', cs: '9–12 months', diy: '18+ months' },
  { label: 'Hidden upsells / add-ons', cw: 'None', cs: 'Multiple', diy: 'n/a' },
  { label: 'Vendor catalog with bureau coverage', cw: '28+ across 4 tiers', cs: '~25', diy: 'You research' },
];

const FEATURES = [
  {
    icon: '👔',
    title: 'CPA-Backed Playbook',
    body: 'Every step reviewed by a credentialed CPA. No phone-agent "coaches" reading from a script.',
  },
  {
    icon: '🛡️',
    title: '90-Day Guarantee',
    body: 'Three reporting tradelines in 90 days, or full refund. No fine print, no exit interviews.',
  },
  {
    icon: '🔗',
    title: 'In Your Existing CRM',
    body: 'Same login your customers use to sign documents. No third-party portal. No second password.',
  },
  {
    icon: '💵',
    title: 'Flat $500 — No Upsells',
    body: 'Everything required is included. No "premium tier" coaching upsells. No surprise add-ons.',
  },
];

const HOW_IT_WORKS = [
  {
    n: '01',
    title: 'Score',
    body: 'Take the 6-minute Credit Readiness assessment. Free. Get a directional score and a personalized roadmap.',
  },
  {
    n: '02',
    title: 'Build',
    body: 'Work through the 7-step program in your CRM. CPA-reviewed at each tier. Real-time progress tracking.',
  },
  {
    n: '03',
    title: 'Borrow',
    body: 'At 80+ Paydex, match with our vetted lender network. Refunded if you don\'t hit the milestone in 90 days.',
  },
];

const TESTIMONIALS = [
  {
    quote: 'Went from no business credit profile to a $45K Bank of America LOC in seven months. My CPA was already on the calls.',
    name: 'Marcus T.',
    business: 'HVAC contractor, Austin TX',
    metric: '$45K LOC',
  },
  {
    quote: 'Three reporting tradelines by month two. I tried Credit Suite first and quit after the third upsell. Credit Workshop just delivers.',
    name: 'Jennifer K.',
    business: 'E-commerce / Shopify',
    metric: '3 tradelines, month 2',
  },
  {
    quote: 'The Paydex score chart in their dashboard is the only thing my banker has actually wanted to see in 12 years of small business loans.',
    name: 'Diego R.',
    business: 'Restaurant group, Miami FL',
    metric: 'Paydex 82',
  },
];

const FAQS = [
  {
    q: 'Is this credit repair?',
    a: 'No. Credit repair is for personal consumer credit (covered by federal CROA). Credit Workshop builds business credit — your EIN\'s file with D&B, Experian, and Equifax. Different process, different laws, different outcomes.',
  },
  {
    q: 'Do I need an LLC first?',
    a: 'Yes — or any registered entity (LLC, S-Corp, C-Corp, Partnership). A sole proprietorship\'s credit is tied to your SSN, which defeats the point. If you don\'t have an entity yet, Kick Start can form one in 5 minutes.',
  },
  {
    q: 'How is this different from Credit Suite?',
    a: 'Three ways. Price: $500 vs $2,997. Guarantee: 90-day money-back vs none. Coaching: real CPAs vs phone agents. Plus it lives inside the CRM you already use to sign Kick Start documents — no separate login.',
  },
  {
    q: 'What\'s the 90-day money-back guarantee?',
    a: 'If you don\'t have 3 vendor accounts reporting to at least one credit bureau within 90 days of starting, we refund your $500 in full. The "3 reporting tradelines" is a deliverable outcome — not a vague score promise.',
  },
  {
    q: 'Will this hurt my personal credit?',
    a: 'No. The 28+ vendor accounts we route you through are EIN-only and don\'t pull personal credit at application. Some funding marketplace lenders DO pull personal credit if you choose to apply — that\'s your call, not ours.',
  },
  {
    q: 'Do I have to apply for loans through you?',
    a: 'No. The funding marketplace is optional. You can use the lenders we recommend, you can use your own bank, or you can sit on a stronger credit file without borrowing at all. The $500 buys the credit-building system, not a loan obligation.',
  },
  {
    q: 'What happens after the 12 weeks?',
    a: 'Your credit profile keeps reporting and compounding for free. Optional $19/mo maintenance plan keeps the dashboard live with score monitoring, new vendor suggestions, and ongoing CPA support. No commitment — cancel anytime.',
  },
  {
    q: 'Can I do this myself for free?',
    a: 'Technically yes. Most people don\'t. The $500 buys you the 7-step sequence in the right order, the 28+ pre-vetted vendor accounts, the CPA review, the dashboard, and 90 days of accountability. We\'ll show you the DIY checklist if you ask — many customers buy after looking at it.',
  },
];

function injectFonts() {
  if (document.getElementById('cw-landing-fonts')) return;
  const link = document.createElement('link');
  link.id = 'cw-landing-fonts';
  link.rel = 'stylesheet';
  link.href = 'https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;0,9..144,700;1,9..144,500&family=Montserrat:wght@400;500;600;700;800&display=swap';
  document.head.appendChild(link);
}

export default function CreditWorkshopLanding() {
  useEffect(() => {
    injectFonts();
    document.title = 'Credit Workshop — Business credit, done in 9 months';
    return () => { document.title = 'Income Academy'; };
  }, []);

  const scrollTo = (id) => (e) => {
    e.preventDefault();
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="cw-page">
      {/* ============ NAV ============ */}
      <nav className="cw-nav">
        <a href="#top" className="cw-nav-brand" onClick={scrollTo('top')}>
          <span className="cw-nav-mark" aria-hidden="true">
            <svg width="36" height="36" viewBox="0 0 32 32" fill="none">
              <rect x="0" y="0" width="32" height="32" rx="6" fill="#1e3a5c"/>
              <rect x="7" y="19" width="4" height="7" rx="0.5" fill="#fff"/>
              <rect x="13" y="14" width="4" height="12" rx="0.5" fill="#fff"/>
              <polygon points="22,5 18,11 20,11 20,26 24,26 24,11 26,11" fill="#4A9D7C"/>
            </svg>
          </span>
          <span className="cw-nav-name">Credit <span className="cw-accent">Workshop</span></span>
        </a>
        <div className="cw-nav-links">
          <a href="#how" onClick={scrollTo('how')}>How it works</a>
          <a href="#compare" onClick={scrollTo('compare')}>Compare</a>
          <a href="#pricing" onClick={scrollTo('pricing')}>Pricing</a>
          <a href="#faq" onClick={scrollTo('faq')}>FAQ</a>
        </div>
        <Link to="/fundability-score" className="cw-nav-cta">Free score →</Link>
      </nav>

      {/* ============ HERO ============ */}
      <section className="cw-hero" id="top">
        <div className="cw-hero-content">
          <span className="cw-hero-eyebrow">Credit Workshop · 9-week program</span>
          <h1 className="cw-hero-h1">
            Business credit done in <em>9 months</em> — or your money back.
          </h1>
          <p className="cw-hero-sub">
            The CPA-backed credit-readiness program built for new LLCs. Flat <strong>$500</strong>.
            No $2,997 coaching contracts. No upsells. Just the playbook to get bank-loan-ready.
          </p>
          <div className="cw-hero-ctas">
            <Link to="/fundability-score" className="cw-btn cw-btn-primary">
              Get my free Credit Readiness Score
              <span className="cw-btn-arrow" aria-hidden="true">→</span>
            </Link>
            <a href="#pricing" className="cw-btn cw-btn-ghost" onClick={scrollTo('pricing')}>
              See what's included ($500, flat)
            </a>
          </div>
          <ul className="cw-trust-strip">
            {TRUST_STRIP.map((item) => (
              <li key={item}>
                <span className="cw-trust-check" aria-hidden="true">✓</span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Hero visual: product screenshot stand-in */}
        <div className="cw-hero-visual" aria-hidden="true">
          <div className="cw-mock">
            <div className="cw-mock-head">
              <span className="cw-mock-dot" />
              <span className="cw-mock-dot" />
              <span className="cw-mock-dot" />
            </div>
            <div className="cw-mock-body">
              <div className="cw-mock-eyebrow">Credit Readiness Score / 890</div>
              <div className="cw-mock-score">428</div>
              <div className="cw-mock-bar"><div className="cw-mock-bar-fill" /></div>
              <div className="cw-mock-tier"><span className="cw-mock-tier-pill">Tier 2 of 4</span> · Building Credit</div>
              <div className="cw-mock-divider" />
              <div className="cw-mock-row">
                <span className="cw-mock-icon cw-mock-icon-done">✓</span>
                <span className="cw-mock-label">Business Address</span>
                <span className="cw-mock-pts">+40</span>
              </div>
              <div className="cw-mock-row">
                <span className="cw-mock-icon cw-mock-icon-done">✓</span>
                <span className="cw-mock-label">EIN</span>
                <span className="cw-mock-pts">+60</span>
              </div>
              <div className="cw-mock-row cw-mock-row-active">
                <span className="cw-mock-icon cw-mock-icon-next">→</span>
                <span className="cw-mock-label">Business Bank Account</span>
                <span className="cw-mock-pts cw-mock-pts-next">+50</span>
              </div>
              <div className="cw-mock-row">
                <span className="cw-mock-icon">○</span>
                <span className="cw-mock-label">D&B Verification</span>
                <span className="cw-mock-pts">+70</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ PROBLEM ============ */}
      <section className="cw-problem">
        <div className="cw-container">
          <h2 className="cw-h2">Most business owners think they have business credit.</h2>
          <p className="cw-h2-sub">They don't.</p>
          <div className="cw-problem-grid">
            <div className="cw-problem-card">
              <span className="cw-problem-num">01</span>
              <h3>Your EIN ≠ a credit file</h3>
              <p>An EIN identifies your business to the IRS. It doesn't build credit on its own. D&B, Experian, and Equifax each maintain separate business credit profiles you have to actively populate.</p>
            </div>
            <div className="cw-problem-card">
              <span className="cw-problem-num">02</span>
              <h3>Lenders use 7 different scores</h3>
              <p>Paydex, Intelliscore, FICO SBSS, SBFE, PAYNET MasterScore, and others. Most "credit builders" only move one of them. We track and feed all four major ones.</p>
            </div>
            <div className="cw-problem-card">
              <span className="cw-problem-num">03</span>
              <h3>One typo on your D-U-N-S kills the application</h3>
              <p>Address mismatch between your D&B file, IRS records, and bank statements is the #1 reason lenders quietly deny EIN-based applications. We catch these before you apply.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ============ HOW IT WORKS ============ */}
      <section className="cw-how" id="how">
        <div className="cw-container">
          <span className="cw-eyebrow">How it works</span>
          <h2 className="cw-h2">Three phases. Twelve weeks. One outcome.</h2>
          <div className="cw-how-grid">
            {HOW_IT_WORKS.map((step) => (
              <div key={step.n} className="cw-how-card">
                <span className="cw-how-num">{step.n}</span>
                <h3 className="cw-how-title">{step.title}</h3>
                <p>{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ COMPARISON ============ */}
      <section className="cw-compare" id="compare">
        <div className="cw-container">
          <span className="cw-eyebrow">The honest comparison</span>
          <h2 className="cw-h2">Why pay $2,997 for what's actually a $500 problem?</h2>
          <p className="cw-h2-sub">No FUD. Here's exactly what you get from each option.</p>

          <div className="cw-table-wrap">
            <table className="cw-table">
              <thead>
                <tr>
                  <th className="cw-table-feature">&nbsp;</th>
                  <th className="cw-table-us">
                    <span className="cw-table-best">Best value</span>
                    Credit Workshop
                  </th>
                  <th>Credit Suite</th>
                  <th>DIY</th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON_ROWS.map((row, i) => (
                  <tr key={i}>
                    <td className="cw-table-feature">{row.label}</td>
                    <td className="cw-table-us-cell">{renderCell(row.cw, true)}</td>
                    <td>{renderCell(row.cs)}</td>
                    <td>{renderCell(row.diy)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ============ FEATURES ============ */}
      <section className="cw-features">
        <div className="cw-container">
          <span className="cw-eyebrow">Why it works</span>
          <h2 className="cw-h2">Four reasons we beat $2,997 competitors at $500.</h2>
          <div className="cw-features-grid">
            {FEATURES.map((f) => (
              <div key={f.title} className="cw-feature-card">
                <span className="cw-feature-icon">{f.icon}</span>
                <h3>{f.title}</h3>
                <p>{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ TESTIMONIALS ============ */}
      <section className="cw-testimonials">
        <div className="cw-container">
          <span className="cw-eyebrow">Real outcomes</span>
          <h2 className="cw-h2">What new LLCs are getting funded for.</h2>
          <div className="cw-testimonials-grid">
            {TESTIMONIALS.map((t, i) => (
              <figure key={i} className="cw-testimonial">
                <span className="cw-testimonial-metric">{t.metric}</span>
                <blockquote>"{t.quote}"</blockquote>
                <figcaption>
                  <span className="cw-testimonial-name">{t.name}</span>
                  <span className="cw-testimonial-biz">{t.business}</span>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* ============ PRICING ============ */}
      <section className="cw-pricing" id="pricing">
        <div className="cw-container cw-pricing-container">
          <span className="cw-eyebrow">One price. One outcome. One guarantee.</span>
          <h2 className="cw-h2 cw-h2-light">Flat $500. No upsells. 90-day money-back.</h2>

          <div className="cw-pricing-card">
            <span className="cw-pricing-badge">90-day money-back guarantee</span>
            <div className="cw-pricing-price">
              <span className="cw-pricing-currency">$</span>
              <span className="cw-pricing-amount">500</span>
              <span className="cw-pricing-period">flat</span>
            </div>
            <p className="cw-pricing-or">
              or <strong>$100 setup + $50/mo × 8 months</strong> if you'd rather spread it
            </p>

            <ul className="cw-pricing-list">
              <li>The complete 7-step Credit Readiness program</li>
              <li>28+ vetted vendor accounts with bureau coverage</li>
              <li>CPA-reviewed at every tier transition</li>
              <li>Lives in your existing Kick Start dashboard</li>
              <li>Branded Credit Readiness PDF for your banker</li>
              <li>Funding marketplace access at 80+ Paydex</li>
              <li>Server-side activity tracking (your proof-of-delivery)</li>
            </ul>

            <Link to="/register" className="cw-btn cw-btn-primary cw-btn-large">
              Start Credit Workshop
              <span className="cw-btn-arrow" aria-hidden="true">→</span>
            </Link>

            <p className="cw-pricing-fine">
              3 reporting tradelines in 90 days, or full refund. The MBG is a deliverable outcome, not a vague promise.
            </p>
          </div>
        </div>
      </section>

      {/* ============ FAQ ============ */}
      <section className="cw-faq" id="faq">
        <div className="cw-container cw-faq-container">
          <span className="cw-eyebrow">Questions we get a lot</span>
          <h2 className="cw-h2">Frequently asked.</h2>
          <div className="cw-faq-list">
            {FAQS.map((item, i) => (
              <details key={i} className="cw-faq-item">
                <summary>{item.q}</summary>
                <p>{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ============ FINAL CTA ============ */}
      <section className="cw-final-cta">
        <div className="cw-container cw-final-cta-container">
          <h2 className="cw-h2 cw-h2-light">Ready to get bank-loan-ready?</h2>
          <p>Take the free 6-minute Credit Readiness Score. Find out where you are. Decide if Credit Workshop is for you.</p>
          <Link to="/fundability-score" className="cw-btn cw-btn-primary cw-btn-large">
            Get my free Credit Readiness Score
            <span className="cw-btn-arrow" aria-hidden="true">→</span>
          </Link>
          <p className="cw-final-cta-fine">
            $500 · 90-day money-back guarantee · Lives in your existing CRM
          </p>
        </div>
      </section>

      {/* ============ FOOTER ============ */}
      <footer className="cw-footer">
        <div className="cw-container cw-footer-container">
          <div className="cw-footer-brand">
            <span className="cw-nav-mark" aria-hidden="true">
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                <rect x="0" y="0" width="32" height="32" rx="6" fill="#1e3a5c"/>
                <rect x="7" y="19" width="4" height="7" rx="0.5" fill="#fff"/>
                <rect x="13" y="14" width="4" height="12" rx="0.5" fill="#fff"/>
                <polygon points="22,5 18,11 20,11 20,26 24,26 24,11 26,11" fill="#4A9D7C"/>
              </svg>
            </span>
            <span className="cw-nav-name">Credit <span className="cw-accent">Workshop</span></span>
            <p className="cw-footer-tagline">Business credit, built in-house.</p>
          </div>
          <div className="cw-footer-links">
            <a href="#how" onClick={scrollTo('how')}>How it works</a>
            <a href="#pricing" onClick={scrollTo('pricing')}>Pricing</a>
            <a href="#faq" onClick={scrollTo('faq')}>FAQ</a>
            <Link to="/fundability-score">Free score</Link>
            <Link to="/login">Sign in</Link>
          </div>
          <p className="cw-footer-fine">
            Credit Workshop is a business-credit-building program operated by Kick Start Companies LLC.
            We are not a lender, broker, or financial advisor. Building business credit is distinct from
            personal credit repair; this product is not subject to the federal Credit Repair Organizations
            Act (CROA). © {new Date().getFullYear()} Kick Start Companies LLC.
          </p>
        </div>
      </footer>
    </div>
  );
}

function renderCell(value, isUs = false) {
  if (value === true) return <span className={`cw-check ${isUs ? 'cw-check-us' : ''}`}>✓</span>;
  if (value === false) return <span className="cw-x">—</span>;
  return <span className={isUs ? 'cw-cell-us' : 'cw-cell'}>{value}</span>;
}
