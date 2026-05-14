import { useState } from 'react';

/**
 * Curated lender / capital partner marketplace.
 * Affiliate-link page with honest broker disclosure per partner.
 * Tabbed by category so it doesn't scroll for ages.
 */

const PARTNERS = [
  {
    tier: 'Free / Government',
    items: [
      {
        name: 'SBA.gov Lender Match',
        category: 'SBA-backed loans',
        url: 'https://www.sba.gov/funding-programs/loans/lender-match',
        revenue: 'Varies by program',
        timeInBusiness: 'Most need 2+ years',
        creditPull: 'Hard, personal + business',
        pg: 'Yes',
        funding: '$5K – $5M',
        commission: 'No commission — direct .gov link.',
        note: 'Slow but cheap money. Start here if you can wait 60–90 days for underwriting.',
      },
    ],
  },
  {
    tier: 'Marketplaces / Brokers',
    items: [
      {
        name: 'Lendio',
        category: 'Broker — 75+ lender network',
        url: 'https://www.lendio.com/',
        revenue: '$50K+ annual',
        timeInBusiness: '6+ months',
        creditPull: 'Soft to start',
        pg: 'Usually yes',
        funding: '$5K – $5M',
        commission: '~$200 if you close a loan through them.',
        note: 'One application matches you to multiple offers. Will spam you with calls — expect 5+ outreach attempts in week one.',
      },
      {
        name: 'Bankrate Business Loans',
        category: 'Comparison + broker',
        url: 'https://www.bankrate.com/loans/business-loans/',
        revenue: 'Varies',
        timeInBusiness: 'Varies',
        creditPull: 'Soft to compare',
        pg: 'Usually yes',
        funding: '$5K – $500K',
        commission: '~$50 per filled-out form (lead-share, not closed-loan based).',
        note: 'Useful for rate comparison even if you don\'t click through. Pricing data is public.',
      },
    ],
  },
  {
    tier: 'Working Capital / Lines of Credit',
    items: [
      {
        name: 'Bluevine',
        category: 'Business checking + LOC',
        url: 'https://www.bluevine.com/',
        revenue: '$10K+ monthly',
        timeInBusiness: '12+ months',
        creditPull: 'Soft, then hard at offer',
        pg: 'Yes (personal guarantee)',
        funding: 'LOC up to $250K',
        commission: '~$50 if you open a free checking account.',
        note: 'Free business checking + a real LOC. One of the better combos for early-stage operators.',
      },
      {
        name: 'Fundbox',
        category: 'Revolving credit',
        url: 'https://fundbox.com/',
        revenue: '$8K+ monthly',
        timeInBusiness: '6+ months',
        creditPull: 'Soft',
        pg: 'Yes',
        funding: 'Up to $150K',
        commission: '~$75 if you draw on a line.',
        note: 'Fast approval, transparent fees. Higher APR than a bank but cleaner than MCA.',
      },
      {
        name: 'OnDeck',
        category: 'Term loan + LOC',
        url: 'https://www.ondeck.com/',
        revenue: '$100K+ annual',
        timeInBusiness: '12+ months',
        creditPull: 'Hard',
        pg: 'Yes',
        funding: '$5K – $250K',
        commission: '~$150 per funded loan.',
        note: 'Daily/weekly repayment can strain cash flow. Read the APR carefully — often 30%+ effective.',
      },
      {
        name: 'Credibly',
        category: 'Working capital loans',
        url: 'https://www.credibly.com/',
        revenue: '$15K+ monthly',
        timeInBusiness: '6+ months',
        creditPull: 'Soft',
        pg: 'Yes',
        funding: '$5K – $400K',
        commission: '~$100 per funded loan.',
        note: 'Speed (24–48 hrs) is the main value here. Factor rates, not interest rates — math the real cost.',
      },
      {
        name: 'Kapitus',
        category: 'Term + revenue-based',
        url: 'https://kapitus.com/',
        revenue: '$50K+ annual',
        timeInBusiness: '12+ months',
        creditPull: 'Hard',
        pg: 'Yes',
        funding: '$10K – $500K',
        commission: '~$125 per funded deal.',
        note: 'Multiple product lines (LOC, MCA, equipment). Sales-driven — be ready for follow-up calls.',
      },
    ],
  },
  {
    tier: 'No-PG Corporate Cards',
    items: [
      {
        name: 'Brex',
        category: 'Corporate Visa/MC',
        url: 'https://www.brex.com/',
        revenue: 'Bank balance > revenue',
        timeInBusiness: 'Any (incorporated)',
        creditPull: 'No personal pull',
        pg: 'No — underwrites on bank balance',
        funding: 'Limit 10–20% of bank balance',
        commission: '~$200 if you spend $1K in the first 60 days.',
        note: 'Requires $50K+ in business bank account at application. Built for VC-backed startups.',
      },
      {
        name: 'Ramp',
        category: 'Corporate Visa',
        url: 'https://ramp.com/',
        revenue: 'Bank balance > revenue',
        timeInBusiness: 'Any (incorporated)',
        creditPull: 'No personal pull',
        pg: 'No',
        funding: 'Limit based on bank balance',
        commission: '~$250 if you reach minimum spend.',
        note: 'Lower bank balance requirement than Brex (~$25K). Strong expense management built in.',
      },
      {
        name: 'Divvy (BILL)',
        category: 'Corporate card + spend mgmt',
        url: 'https://www.divvy.co/',
        revenue: 'Varies',
        timeInBusiness: 'Any',
        creditPull: 'Soft',
        pg: 'No for most',
        funding: 'Up to $5M for established',
        commission: '~$50 referral.',
        note: 'Free product, makes money on interchange. Easier approval than Brex/Ramp for non-VC businesses.',
      },
    ],
  },
];

export default function FundingMarketplace() {
  const [active, setActive] = useState(0);
  const group = PARTNERS[active];

  return (
    <div className="cb-marketplace">
      <div className="cb-marketplace-header">
        <p className="cb-marketplace-eyebrow">Funding marketplace</p>
        <h2 className="cb-marketplace-title">
          Capital partners, <em>honestly disclosed</em>.
        </h2>
        <p className="cb-marketplace-sub">
          Every lender below is one we'd use ourselves. We disclose what we earn from each
          partner and what it actually takes to get approved. No "$50K in 30 days" promises.
        </p>
      </div>

      <div className="cb-marketplace-tabs" role="tablist">
        {PARTNERS.map((g, i) => (
          <button
            key={g.tier}
            role="tab"
            aria-selected={i === active}
            className={`cb-marketplace-tab ${i === active ? 'is-active' : ''}`}
            onClick={() => setActive(i)}
          >
            <span className="cb-marketplace-tab-num">{String(i + 1).padStart(2, '0')}</span>
            <span className="cb-marketplace-tab-label">{g.tier}</span>
            <span className="cb-marketplace-tab-count">{g.items.length}</span>
          </button>
        ))}
      </div>

      <section className="cb-marketplace-section" key={group.tier}>
        <div className="cb-marketplace-grid">
          {group.items.map(p => (
            <article key={p.name} className="cb-marketplace-card">
              <header className="cb-marketplace-card-head">
                <div>
                  <h4 className="cb-marketplace-card-name">{p.name}</h4>
                  <p className="cb-marketplace-card-cat">{p.category}</p>
                </div>
                <span className="cb-marketplace-card-fund">{p.funding}</span>
              </header>

              <dl className="cb-marketplace-card-specs">
                <div><dt>Revenue</dt><dd>{p.revenue}</dd></div>
                <div><dt>Time in biz</dt><dd>{p.timeInBusiness}</dd></div>
                <div><dt>Credit pull</dt><dd>{p.creditPull}</dd></div>
                <div><dt>PG required</dt><dd>{p.pg}</dd></div>
              </dl>

              <p className="cb-marketplace-card-note">{p.note}</p>

              <div className="cb-marketplace-card-foot">
                <a
                  href={p.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cb-marketplace-card-cta"
                >
                  Visit {p.name} <span aria-hidden="true">→</span>
                </a>
                <p className="cb-marketplace-card-commission">
                  <strong>Honest broker:</strong> {p.commission}
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <footer className="cb-marketplace-footer">
        <p>
          We're an affiliate of every partner above. We're not a lender, broker, or financial
          advisor — and we don't push you to any single product. If you find a better rate elsewhere,
          take it. The whole point of this page is to make the comparison transparent.
        </p>
      </footer>
    </div>
  );
}
