import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import './credit-workshop-landing.css';

/**
 * Public marketing landing — v4 "Stripe-flavored".
 * Clean Inter sans, aurora gradient hero, mock dashboard preview,
 * bento features, named operator testimonials, deep-navy CTA per
 * fintech CRO research.
 *
 * CTAs:
 *  - /register             → Get started, Begin program
 *  - /fundability-score    → Free readiness quiz
 *  - /login                → Sign in
 *  - mailto: hello@…       → Schedule a call (no Calendly wired yet)
 */

const ArrowRight = (props) => (
  <svg className="cw4-arr" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" {...props}>
    <path d="M3 7h8M8 4l3 3-3 3" />
  </svg>
);

const Check = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M5 12l5 5L20 7" />
  </svg>
);

export default function CreditWorkshopLanding() {
  // load fonts once
  useEffect(() => {
    const id = 'cw4-fonts';
    if (document.getElementById(id)) return;
    const link = document.createElement('link');
    link.id = id;
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Inter+Tight:wght@500;600;700;800&family=Geist+Mono:wght@400;500&display=swap';
    document.head.appendChild(link);
  }, []);

  // intersection-observer reveal
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('in');
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
    );
    document.querySelectorAll('.reveal, .stagger').forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <div className="cw4">
      {/* ============ NAV ============ */}
      <header className="cw4-nav">
        <div className="cw4-wrap cw4-nav-inner">
          <Link to="/credit-workshop" className="cw4-brand">
            <span className="cw4-brand-mark">CW</span>
            Credit Workshop
          </Link>
          <nav className="cw4-nav-links">
            <a href="#method">Method</a>
            <a href="#features">Features</a>
            <a href="#operators">Operators</a>
            <a href="#pricing">Pricing</a>
            <a href="#faq">FAQ</a>
          </nav>
          <div className="cw4-nav-cta">
            <Link to="/login" className="cw4-btn cw4-btn--ghost">Sign in</Link>
            <Link to="/register" className="cw4-btn cw4-btn--primary">
              Get started <ArrowRight />
            </Link>
          </div>
        </div>
      </header>

      {/* ============ HERO ============ */}
      <section className="cw4-hero">
        <div className="cw4-aurora" aria-hidden="true">
          <svg viewBox="0 0 1200 700" preserveAspectRatio="xMidYMid slice">
            <defs>
              <radialGradient id="cw4g1"><stop offset="0%" stopColor="#635BFF" stopOpacity=".55" /><stop offset="100%" stopColor="#635BFF" stopOpacity="0" /></radialGradient>
              <radialGradient id="cw4g2"><stop offset="0%" stopColor="#00D4FF" stopOpacity=".5" /><stop offset="100%" stopColor="#00D4FF" stopOpacity="0" /></radialGradient>
              <radialGradient id="cw4g3"><stop offset="0%" stopColor="#FF80B5" stopOpacity=".45" /><stop offset="100%" stopColor="#FF80B5" stopOpacity="0" /></radialGradient>
              <radialGradient id="cw4g4"><stop offset="0%" stopColor="#FFD166" stopOpacity=".42" /><stop offset="100%" stopColor="#FFD166" stopOpacity="0" /></radialGradient>
            </defs>
            <circle className="cw4-aurora-blob b1" cx="300" cy="160" r="320" fill="url(#cw4g1)" />
            <circle className="cw4-aurora-blob b2" cx="900" cy="200" r="360" fill="url(#cw4g2)" />
            <circle className="cw4-aurora-blob b3" cx="700" cy="420" r="300" fill="url(#cw4g3)" />
            <circle className="cw4-aurora-blob b4" cx="200" cy="450" r="280" fill="url(#cw4g4)" />
          </svg>
        </div>

        <div className="cw4-wrap cw4-hero-inner">
          <div className="cw4-hero-copy reveal">
            <span className="cw4-eyebrow"><span className="cw4-dot" />9-month program · No subscription</span>
            <h1 className="cw4-hero-h">
              Business credit, <span className="cw4-grad">methodically built.</span>
            </h1>
            <p className="cw4-hero-sub">
              Paydex 80, a Tier-I vendor file, and funding-ready in nine months. Built for operators who'd rather own the system than rent it.
            </p>
            <div className="cw4-hero-cta">
              <Link to="/register" className="cw4-btn cw4-btn--primary">
                Get started — $1,000 <ArrowRight />
              </Link>
              <Link to="/fundability-score" className="cw4-btn cw4-btn--ghost">
                Take the free quiz →
              </Link>
            </div>
            <div className="cw4-hero-stats">
              <div className="cw4-hero-stat"><div className="n">9 mo</div><div className="l">Total program</div></div>
              <div className="cw4-hero-stat"><div className="n">3</div><div className="l">Bureaus tracked</div></div>
              <div className="cw4-hero-stat"><div className="n">40+</div><div className="l">Vendor placements</div></div>
            </div>
          </div>

          <div className="cw4-mock-wrap reveal">
            <div className="cw4-mock">
              <div className="cw4-mock-head">
                <span className="cw4-mock-dot r" /><span className="cw4-mock-dot y" /><span className="cw4-mock-dot g" />
                <span className="cw4-mock-url">app.thecreditworkshop.com</span>
              </div>
              <div className="cw4-mock-body">
                <div className="cw4-mock-score">
                  <div className="cw4-mock-ring"><span className="n">74</span></div>
                  <div className="cw4-mock-score-body">
                    <div className="t">Credit Readiness</div>
                    <div className="h">On track for Paydex 80</div>
                    <div className="d">+12 pts this week · Tier I active</div>
                  </div>
                </div>

                <div className="cw4-mock-bars">
                  <div className="cw4-mock-bar"><span className="lbl">Foundation</span><span className="track"><span className="fill" style={{ width: '100%' }} /></span><span className="v">12/12</span></div>
                  <div className="cw4-mock-bar"><span className="lbl">Tier I vendors</span><span className="track"><span className="fill" style={{ width: '83%' }} /></span><span className="v">5/6</span></div>
                  <div className="cw4-mock-bar"><span className="lbl">Bureau verified</span><span className="track"><span className="fill" style={{ width: '66%' }} /></span><span className="v">2/3</span></div>
                  <div className="cw4-mock-bar"><span className="lbl">Funding ready</span><span className="track"><span className="fill" style={{ width: '32%' }} /></span><span className="v">M. 7</span></div>
                </div>

                <div className="cw4-mock-spark">
                  <svg viewBox="0 0 200 60" preserveAspectRatio="none">
                    <path d="M0,48 L20,42 L40,38 L60,30 L80,28 L100,22 L120,18 L140,14 L160,12 L180,8 L200,6 L200,60 L0,60 Z" fill="rgba(74,157,124,0.18)" />
                    <path d="M0,48 L20,42 L40,38 L60,30 L80,28 L100,22 L120,18 L140,14 L160,12 L180,8 L200,6" fill="none" stroke="#4A9D7C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ LOGO BAR ============ */}
      <div className="cw4-logos">
        <div className="cw4-wrap cw4-logos-inner">
          <span className="cw4-logos-label">Reports to and integrates with</span>
          <div className="cw4-logos-row">
            <span className="cw4-logo-mark">Dun &amp; Bradstreet</span>
            <span className="cw4-logo-mark">Experian</span>
            <span className="cw4-logo-mark">Equifax</span>
            <span className="cw4-logo-mark">Stripe</span>
            <span className="cw4-logo-mark">SBA</span>
          </div>
        </div>
      </div>

      {/* ============ METHOD ============ */}
      <section className="cw4-block" id="method">
        <div className="cw4-wrap">
          <div className="cw4-sec-head reveal">
            <span className="cw4-eyebrow"><span className="cw4-dot" />The method</span>
            <h2>Nine months. Four movements.</h2>
            <p>Each phase has a defined start, a measurable outcome, and a hand-off to the next. No mystery.</p>
          </div>

          <div className="cw4-steps stagger">
            <StepCard months="Month 1" title="Foundation & filing" body="EIN, entity hygiene, D&B file, address compliance, bureau enrollment.">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21h18M5 21V8l7-5 7 5v13M9 9h2M13 9h2M9 13h2M13 13h2M9 17h6" /></svg>
            </StepCard>
            <StepCard months="Months 2–3" title="Tier I vendors" body="Six Net-30 accounts placed in bureau-rewarded sequence. First Paydex.">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="6" width="18" height="13" rx="2" /><path d="M3 10h18M7 15h3" /></svg>
            </StepCard>
            <StepCard months="Months 4–6" title="Tier II & III" body="Revolving accounts, fleet cards, store credit. File depth and Paydex 80.">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9c2.83 0 5.36 1.31 7 3.36" /><path d="M21 3v6h-6" /></svg>
            </StepCard>
            <StepCard months="Months 7–9" title="Funding & hand-off" body="Lender matching, SBA-ready packet. You finish holding the file.">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5C8.12 5 7 6.12 7 7.5S8.12 10 9.5 10h5c1.38 0 2.5 1.12 2.5 2.5S15.88 15 14.5 15H6" /></svg>
            </StepCard>
          </div>
        </div>
      </section>

      {/* ============ BENTO FEATURES ============ */}
      <section className="cw4-block cw4-block--soft" id="features">
        <div className="cw4-wrap">
          <div className="cw4-sec-head reveal">
            <span className="cw4-eyebrow"><span className="cw4-dot" />The product</span>
            <h2>One operating surface for the whole file.</h2>
            <p>The dashboard your CPA can actually read. No tabs. No spreadsheets. No upsells.</p>
          </div>

          <div className="cw4-bento stagger">
            <div className="cw4-b-card wide">
              <span className="cw4-b-eyebrow">Credit readiness</span>
              <h3>One score. Daily. Tracked across all three bureaus.</h3>
              <p>The Credit Readiness Score rolls up every input into a single number you can show your CPA.</p>
              <div className="cw4-b-vis">
                <div className="cw4-mini-bars">
                  <div className="cw4-mini-bar" />
                  <div className="cw4-mini-bar" />
                  <div className="cw4-mini-bar" />
                </div>
              </div>
            </div>

            <div className="cw4-b-card wide dark">
              <span className="cw4-b-eyebrow">Bureau sync</span>
              <h3>D&amp;B, Experian, Equifax — moving together.</h3>
              <p>Catch reporting gaps before they cost you a tier.</p>
              <div className="cw4-b-vis">
                <div className="cw4-bureau-row">
                  <div className="cw4-bureau-chip">D&amp;B <span className="pct">82</span></div>
                  <div className="cw4-bureau-chip">EXP <span className="pct">76</span></div>
                  <div className="cw4-bureau-chip">EFX <span className="pct">71</span></div>
                </div>
              </div>
            </div>

            <div className="cw4-b-card">
              <span className="cw4-b-eyebrow">Vendor library</span>
              <h3>40+ Net-30 vendors, placed in order.</h3>
              <p>Ranked by tier and reporting reliability.</p>
            </div>

            <div className="cw4-b-card">
              <span className="cw4-b-eyebrow">Score history</span>
              <h3>90-day rolling sparkline.</h3>
              <p>Watch progress, not feelings.</p>
            </div>

            <div className="cw4-b-card dark">
              <span className="cw4-b-eyebrow">Funding match</span>
              <h3>Five processors. One pipeline.</h3>
              <p style={{ marginBottom: 12 }}>Matched the moment your file is ready.</p>
              <div className="cw4-fund-list">
                <div className="cw4-fund-row"><span>Tailored Pay</span><span className="check">✓</span></div>
                <div className="cw4-fund-row"><span>NMA Gateway</span><span className="check">✓</span></div>
                <div className="cw4-fund-row"><span>Payarc</span><span className="check">✓</span></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ COMPARISON ============ */}
      <section className="cw4-block">
        <div className="cw4-wrap">
          <div className="cw4-sec-head reveal">
            <span className="cw4-eyebrow"><span className="cw4-dot" />The difference</span>
            <h2>What outsourced shops won't tell you.</h2>
            <p>The industry sells perpetual access. We sell a finish line.</p>
          </div>

          <div className="cw4-compare reveal">
            <div className="cw4-c-row head">
              <div className="cw4-c-cell">Item</div>
              <div className="cw4-c-cell">Typical outsourced shop</div>
              <div className="cw4-c-cell us">Credit Workshop</div>
            </div>
            <CompareRow lbl="Pricing" them="$400–500 / month forever" us="$1,000 once · 9 months · done" />
            <CompareRow lbl="What you learn" them={'"Proprietary" method'} us="The full sequence & cadence" />
            <CompareRow lbl="Dashboard" them="Generic checklist" us="Tier, bureau, score, history" />
            <CompareRow lbl="When you finish" them="Still paying" us="You own the file" />
          </div>
        </div>
      </section>

      {/* ============ OPERATORS ============ */}
      <section className="cw4-block cw4-block--soft" id="operators">
        <div className="cw4-wrap">
          <div className="cw4-sec-head reveal">
            <span className="cw4-eyebrow"><span className="cw4-dot" />Operators</span>
            <h2>Finished with the method.</h2>
            <p>Real numbers from real businesses that walked the program.</p>
          </div>

          <div className="cw4-voices stagger">
            <Voice
              quote={<>&ldquo;Came in with no file. Month four I hit <em>Paydex 80</em>. The vendor sequence is the whole game.&rdquo;</>}
              metric="Paydex 80 · Month 4"
              name="Marcus T."
              meta="Logistics · Dallas, TX"
              initial="M"
            />
            <Voice
              quote={<>&ldquo;My CPA read the dashboard without asking me to translate. <em>System, not a portal.</em>&rdquo;</>}
              metric="Funded · Month 8"
              name="Sarah K."
              meta="E-commerce · Austin, TX"
              initial="S"
            />
            <Voice
              quote={<>&ldquo;Paid two outsourced shops $500/mo and learned <em>nothing</em>. One quarter here and I own the file.&rdquo;</>}
              metric="$30k Net-30 · Month 5"
              name="Devon R."
              meta="Contracting · Phoenix, AZ"
              initial="D"
            />
          </div>
        </div>
      </section>

      {/* ============ PRICING ============ */}
      <section className="cw4-block" id="pricing">
        <div className="cw4-wrap">
          <div className="cw4-sec-head reveal">
            <span className="cw4-eyebrow"><span className="cw4-dot" />Pricing</span>
            <h2>One price. One outcome.</h2>
            <p>No upsells. No "premium tier." No subscription that never ends.</p>
          </div>

          <div className="cw4-pricing reveal">
            <div>
              <span className="cw4-pricing-eye">Full program · One-time</span>
              <h2>Nine months of method, not subscription.</h2>
              <p className="cw4-pricing-sub">You buy the program, you finish the program, you leave with the file. There is no perpetual invoice.</p>
              <ul className="cw4-pricing-list">
                <li><Check />Full 9-month curriculum with vendor sequencing</li>
                <li><Check />Live dashboard · tier, bureau, score tracking</li>
                <li><Check />Funding marketplace — 5 processors</li>
                <li><Check />15-minute onboarding with a specialist</li>
                <li><Check />Compliance-grade evidence log (CPA-ready)</li>
              </ul>
            </div>

            <aside className="cw4-pricing-card">
              <div className="cw4-price-tag">Full Program · One-time</div>
              <div className="cw4-price-n"><span className="cur">$</span>1,000</div>
              <p className="cw4-price-foot">Nine months · vendor placements · bureau coordination · funding match · dashboard.</p>
              <div className="cw4-price-alt">Or <b>$100 setup</b> + <b>$100/mo</b> · 9 months</div>
              <Link to="/register" className="cw4-btn cw4-price-cta">
                Begin program <ArrowRight />
              </Link>
              <div className="cw4-price-trust">
                <span><span className="cw4-ic yes">✓</span>14-day refund</span>
                <span><span className="cw4-ic yes">✓</span>Cancel anytime</span>
                <span><span className="cw4-ic yes">✓</span>Transferable</span>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* ============ FAQ ============ */}
      <section className="cw4-block" id="faq">
        <div className="cw4-wrap">
          <div className="cw4-sec-head reveal">
            <span className="cw4-eyebrow"><span className="cw4-dot" />FAQ</span>
            <h2>Answers, briefly.</h2>
          </div>
          <div className="cw4-faq-grid reveal">
            <Faq open q="How is this different from $400/mo providers?">
              They sell ongoing access. We sell the method itself — vendor sequence, bureau cadence, dashboard, finish line. After nine months you own the file.
            </Faq>
            <Faq q="What score can I expect?">
              Most operators reach Paydex 80 by month 4–5 and a strong Intelliscore by month 7 if the cadence is followed.
            </Faq>
            <Faq q="Does the funding piece really work?">
              Yes. Five integrated processors. Lender matching happens in months 7–9 once your file is fundable.
            </Faq>
            <Faq q="Refund policy?">
              Full refund within 14 days. After day 14, transferable to another entity you control.
            </Faq>
          </div>
        </div>
      </section>

      {/* ============ FINAL CTA ============ */}
      <section className="cw4-block">
        <div className="cw4-wrap">
          <div className="cw4-final reveal">
            <h2>Begin the file. <span className="cw4-grad">Finish the method.</span></h2>
            <p>Nine months. One price. The file is yours when you're done.</p>
            <div className="cw4-final-actions">
              <Link to="/register" className="cw4-btn cw4-btn--primary">Get started — $1,000</Link>
              <Link to="/fundability-score" className="cw4-btn cw4-btn--ghost">Take the free quiz →</Link>
            </div>
          </div>
        </div>
      </section>

      {/* ============ FOOTER ============ */}
      <footer className="cw4-footer">
        <div className="cw4-wrap">
          <div className="cw4-foot">
            <div className="cw4-foot-brand-col">
              <Link to="/credit-workshop" className="cw4-brand"><span className="cw4-brand-mark">CW</span> Credit Workshop</Link>
              <p className="cw4-foot-brand-text">Quietly excellent software for operators building real business credit.</p>
            </div>
            <div>
              <h4>Product</h4>
              <ul>
                <li><a href="#method">Method</a></li>
                <li><a href="#features">Features</a></li>
                <li><a href="#pricing">Pricing</a></li>
              </ul>
            </div>
            <div>
              <h4>Resources</h4>
              <ul>
                <li><Link to="/fundability-score">Readiness quiz</Link></li>
                <li><a href="#faq">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h4>Contact</h4>
              <ul>
                <li><a href="mailto:hello@thecreditworkshop.com">hello@thecreditworkshop.com</a></li>
                <li><a href="mailto:hello@thecreditworkshop.com?subject=Schedule%20a%20call">Schedule a call</a></li>
              </ul>
            </div>
          </div>
          <div className="cw4-foot-bottom">
            <span>© {new Date().getFullYear()} Credit Workshop. Quietly excellent software for serious operators.</span>
            <span>Not legal or financial advice.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

function StepCard({ months, title, body, children }) {
  return (
    <div className="cw4-step-card">
      <div className="cw4-step-icon">{children}</div>
      <div className="cw4-step-n">{months}</div>
      <h3>{title}</h3>
      <p>{body}</p>
    </div>
  );
}

function CompareRow({ lbl, them, us }) {
  return (
    <div className="cw4-c-row">
      <div className="cw4-c-cell lbl">{lbl}</div>
      <div className="cw4-c-cell them"><span className="cw4-ic no">✕</span>{them}</div>
      <div className="cw4-c-cell us"><span className="cw4-ic yes">✓</span>{us}</div>
    </div>
  );
}

function Voice({ quote, metric, name, meta, initial }) {
  return (
    <article className="cw4-voice">
      <p className="cw4-voice-q">{quote}</p>
      <span className="cw4-voice-metric">{metric}</span>
      <div className="cw4-voice-foot">
        <div className="cw4-voice-av">{initial}</div>
        <div>
          <div className="cw4-voice-name">{name}</div>
          <div className="cw4-voice-meta">{meta}</div>
        </div>
      </div>
    </article>
  );
}

function Faq({ q, open, children }) {
  return (
    <details {...(open ? { open: true } : {})}>
      <summary>{q}</summary>
      <div className="cw4-ans">{children}</div>
    </details>
  );
}
