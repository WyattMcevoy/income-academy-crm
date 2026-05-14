import { useState } from 'react';
import { STEPS, SUB_PAGE_CONTENT, VENDOR_CATALOG } from './creditBuilderData.js';

const VENDORS_PER_PAGE = 4;

const FOUNDATION_ITEMS = [
  { slug: 'business-address', name: 'Business address', step: 1 },
  { slug: 'business-entity', name: 'Entity', step: 1 },
  { slug: 'foreign-filing', name: 'Foreign filing', step: 1 },
  { slug: 'ownership', name: 'Ownership', step: 1 },
  { slug: 'ein', name: 'Ein', step: 1 },
  { slug: 'business-phone', name: 'Business phone', step: 1 },
  { slug: 'business-industry', name: 'Industry', step: 1 },
];

const CREDIT_ITEMS = [
  { slug: 'experian-verification', name: 'Experian report', step: 2 },
  { slug: 'dnb-verification', name: 'DnB', step: 2 },
];

const TIER_PREREQS = {
  3: { requiredStep: null, requiredVendors: 0 },
  5: { requiredStep: 3, requiredVendors: 3 },
  6: { requiredStep: 5, requiredVendors: 6 },
  7: { requiredStep: 6, requiredVendors: 9 },
};

const STEP_TO_TIER = { 3: 1, 5: 2, 6: 3, 7: 4 };

// Honest expectations per tier. What it actually unlocks vs. what it doesn't.
const TIER_REALITY = {
  1: {
    achieves: 'A real business credit file separate from your personal one. Starter vendors begin reporting your payment history to D&B / Experian / Equifax within 30–90 days of opening.',
    doesnt: 'Tier 1 alone does NOT unlock bank lines of credit, SBA loans, or business credit cards with high limits. Those still weigh revenue and personal credit heavily.',
    realistic: 'Expect 60–90 days for first tradelines to report. Tier 2 becomes realistic around month 3–4 for most users.',
  },
  2: {
    achieves: 'Store revolving credit (Home Depot, Staples, Office Depot, etc.). Higher purchase limits, broader bureau coverage, and your first revolving tradelines.',
    doesnt: 'Still mostly trade credit and store cards — useful for operating expenses, not for raising capital.',
    realistic: 'Approval likely on 60–70% of applications once Tier 1 is reporting. Limits typically start at $500–$5,000.',
  },
  3: {
    achieves: 'Fleet and fuel cards. Real D&B Paydex weight. Lenders begin recognizing your business credit profile independently.',
    doesnt: 'Most fleet cards still require some level of personal guarantee for new entities. The "no PG" claims are mostly marketing.',
    realistic: 'At 9+ reporting accounts, your D&B Paydex should be 80+ if all payments are on time. This is the inflection point for real underwriting.',
  },
  4: {
    achieves: 'No-PG corporate cards (Brex, Ramp, Divvy) become approvable if you also have meaningful business bank balance ($25K–$50K+). Real fundability.',
    doesnt: 'Tier 4 cards still underwrite on business bank balance and revenue — not just your credit file. Tradelines alone are not enough.',
    realistic: 'Most users hit Tier 4 around month 9–18 from starting. SBA loans become realistic at 24 months in business with strong tradelines.',
  },
};

function getItemStatus(item, progress) {
  const key = `${item.step}:${item.slug}`;
  const entry = progress[key];
  if (!entry) return 'not_started';
  if (entry.completed) return 'completed';
  if (entry.selected_option) {
    const content = SUB_PAGE_CONTENT[item.slug];
    const followUp = content?.followUp?.[entry.selected_option];
    if (followUp?.status === 'negative') return 'negative';
  }
  return 'not_started';
}

function StatusIcon({ status }) {
  if (status === 'completed') return <span className="cb-prereq-status-icon">✅</span>;
  if (status === 'negative') return <span className="cb-prereq-status-icon">❌</span>;
  return <span className="cb-prereq-status-icon">⭕</span>;
}

function checkFoundationComplete(progress) {
  return FOUNDATION_ITEMS.every(item => {
    const key = `${item.step}:${item.slug}`;
    return progress[key]?.completed;
  });
}

function countReportingVendors(vendors) {
  if (!vendors || !Array.isArray(vendors)) return 0;
  const reportingNames = new Set();
  vendors.forEach(v => {
    if (v.completed) reportingNames.add(v.vendor_name);
  });
  return reportingNames.size;
}

function getVendorStatus(vendorName, vendors) {
  const rows = vendors.filter(v => v.vendor_name === vendorName);
  if (rows.length === 0) return 'none';
  if (rows.some(v => v.completed)) return 'reporting';
  if (rows.some(v => v.applied)) return 'applied';
  return 'none';
}

function BureauBadge({ bureau }) {
  const colors = {
    'D&B': '#196499',
    'Experian': '#0cae87',
    'Equifax': '#dc3545',
  };
  return (
    <span className="cb-vendor-bureau-badge" style={{ background: colors[bureau] || '#6b7280' }}>
      {bureau}
    </span>
  );
}

export default function VendorStep({
  step,
  tierName,
  targetCount,
  progress,
  vendors,
  onNavigateStep,
  onVendorAction,
}) {
  const prereq = TIER_PREREQS[step];
  const reportingCount = countReportingVendors(vendors);
  const tierNumber = STEP_TO_TIER[step];
  const catalog = VENDOR_CATALOG[tierNumber] || [];

  // Collapse prereqs by default if any foundation work has been done
  const anyFoundationDone = FOUNDATION_ITEMS.some(item => progress[`${item.step}:${item.slug}`]?.completed);
  const [prereqOpen, setPrereqOpen] = useState(!anyFoundationDone);
  const [page, setPage] = useState(0);

  let prereqsMet = true;
  let prereqStepLabel = null;

  if (step === 3) {
    prereqsMet = checkFoundationComplete(progress);
    if (!prereqsMet) prereqStepLabel = 1;
  } else if (prereq) {
    prereqsMet = reportingCount >= prereq.requiredVendors;
    if (!prereqsMet) prereqStepLabel = prereq.requiredStep;
  }

  const foundationDone = FOUNDATION_ITEMS.filter(item => progress[`${item.step}:${item.slug}`]?.completed).length;
  const creditDone = CREDIT_ITEMS.filter(item => progress[`${item.step}:${item.slug}`]?.completed).length;
  const totalPrereq = FOUNDATION_ITEMS.length + CREDIT_ITEMS.length;
  const totalPrereqDone = foundationDone + creditDone;

  // Vendor pagination
  const totalPages = Math.max(1, Math.ceil(catalog.length / VENDORS_PER_PAGE));
  const pageStart = page * VENDORS_PER_PAGE;
  const pagedVendors = catalog.slice(pageStart, pageStart + VENDORS_PER_PAGE);

  const handleApply = (vendor) => {
    vendor.bureaus.forEach(bureau => {
      onVendorAction?.({ bureau, vendor_name: vendor.name, tier: tierNumber, applied: true, completed: false });
    });
  };

  const handleMarkReporting = (vendor) => {
    vendor.bureaus.forEach(bureau => {
      onVendorAction?.({ bureau, vendor_name: vendor.name, tier: tierNumber, applied: true, completed: true });
    });
  };

  const handleRemove = (vendor) => {
    vendor.bureaus.forEach(bureau => {
      onVendorAction?.({ bureau, vendor_name: vendor.name, tier: tierNumber, applied: false, completed: false });
    });
  };

  return (
    <div className="cb-vendor-page">
      <div className="cb-vendor-page-header">
        <h2 className="cb-vendor-page-title">{tierName}</h2>
        <p className="cb-vendor-page-subtitle">
          {reportingCount} of {targetCount} vendors reporting
        </p>
      </div>

      {!prereqsMet && (
        <>
          <div className="cb-vendor-warning">
            <div className="cb-vendor-warning-icon">⚠️</div>
            <div className="cb-vendor-warning-content">
              <div className="cb-vendor-warning-title">
                Tier {tierNumber} accounts not matched
              </div>
              <p className="cb-vendor-warning-desc">
                {step === 3
                  ? 'Before applying for any trade vendors, you must have completed the minimum Fundability Foundation Factors.'
                  : `You must first have ${prereq.requiredVendors} accounts reporting before you can start applying for Tier ${tierNumber} accounts`}
              </p>
            </div>
          </div>

          {prereqStepLabel && (
            <button
              className="cb-vendor-goto"
              onClick={() => onNavigateStep(prereqStepLabel)}
            >
              <span>Go to Step {prereqStepLabel}: {STEPS.find(s => s.step === prereqStepLabel)?.name}</span>
              <span className="cb-vendor-goto-arrow">›</span>
            </button>
          )}
        </>
      )}

      {/* Prerequisites — collapsible summary + details */}
      <div className={`cb-prereq-collapse ${prereqOpen ? 'is-open' : ''}`}>
        <button
          className="cb-prereq-toggle"
          onClick={() => setPrereqOpen(o => !o)}
          aria-expanded={prereqOpen}
        >
          <span className="cb-prereq-toggle-status">
            {totalPrereqDone === totalPrereq ? '✅' : totalPrereqDone === 0 ? '⭕' : '🔵'}
          </span>
          <span className="cb-prereq-toggle-label">
            <strong>{totalPrereqDone} of {totalPrereq}</strong> prerequisites complete
          </span>
          <span className="cb-prereq-toggle-chevron" aria-hidden="true">
            {prereqOpen ? '▴ Hide details' : '▾ Show details'}
          </span>
        </button>

        {prereqOpen && (
          <div className="cb-prereq-details">
            <div className="cb-prereq-section">
              <h3 className="cb-prereq-section-title">⚙️ Foundation</h3>
              <div className="cb-prereq-grid">
                {FOUNDATION_ITEMS.map(item => {
                  const status = getItemStatus(item, progress);
                  return (
                    <div key={item.slug} className="cb-prereq-item">
                      <StatusIcon status={status} />
                      <span className="cb-prereq-item-name">{item.name}</span>
                      <span className="cb-prereq-item-info" onClick={() => onNavigateStep(item.step)} title={`View ${item.name}`}>i</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="cb-prereq-section">
              <h3 className="cb-prereq-section-title">⚙️ Business Credit Builder</h3>
              <div className="cb-prereq-grid">
                {CREDIT_ITEMS.map(item => {
                  const status = getItemStatus(item, progress);
                  return (
                    <div key={item.slug} className="cb-prereq-item">
                      <StatusIcon status={status} />
                      <span className="cb-prereq-item-name">{item.name}</span>
                      <span className="cb-prereq-item-info" onClick={() => onNavigateStep(item.step)} title={`View ${item.name}`}>i</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* What this tier actually achieves — realistic-expectations section */}
      {TIER_REALITY[tierNumber] && (
        <div className="cb-tier-reality">
          <h3 className="cb-tier-reality-title">What Tier {tierNumber} actually achieves</h3>
          <div className="cb-tier-reality-grid">
            <div className="cb-tier-reality-card cb-tier-reality-positive">
              <span className="cb-tier-reality-label">It does</span>
              <p>{TIER_REALITY[tierNumber].achieves}</p>
            </div>
            <div className="cb-tier-reality-card cb-tier-reality-negative">
              <span className="cb-tier-reality-label">It does not</span>
              <p>{TIER_REALITY[tierNumber].doesnt}</p>
            </div>
          </div>
          <p className="cb-tier-reality-timing">
            <span className="cb-tier-reality-timing-label">Realistic timing</span>
            {TIER_REALITY[tierNumber].realistic}
          </p>
        </div>
      )}

      {/* Vendor catalog (paginated) */}
      <div className="cb-vendor-catalog">
        <div className="cb-vendor-catalog-head">
          <div>
            <h3 className="cb-vendor-catalog-title">Tier {tierNumber} Vendor Accounts</h3>
            <p className="cb-vendor-catalog-desc">
              Apply for these accounts, then mark them as reporting once they appear on your business credit reports.
            </p>
          </div>
          <span className="cb-vendor-catalog-counter">
            Showing {pageStart + 1}–{Math.min(pageStart + VENDORS_PER_PAGE, catalog.length)} of {catalog.length}
          </span>
        </div>

        <div className="cb-vendor-catalog-list">
          {pagedVendors.map(vendor => {
            const status = getVendorStatus(vendor.name, vendors);
            return (
              <div key={vendor.name} className={`cb-vendor-card cb-vendor-card-${status}`}>
                <div className="cb-vendor-card-header">
                  <div className="cb-vendor-card-info">
                    <span className="cb-vendor-card-name">{vendor.name}</span>
                    <span className="cb-vendor-card-category">{vendor.category}</span>
                    <span className="cb-vendor-card-terms">{vendor.terms}</span>
                  </div>
                  {status === 'reporting' && <span className="cb-vendor-card-badge cb-vendor-badge-reporting">Reporting</span>}
                  {status === 'applied' && <span className="cb-vendor-card-badge cb-vendor-badge-applied">Applied</span>}
                </div>

                <div className="cb-vendor-card-bureaus">
                  {vendor.bureaus.map(b => <BureauBadge key={b} bureau={b} />)}
                </div>

                <div className="cb-vendor-card-actions">
                  {status === 'none' && (
                    <>
                      <a href={vendor.url} target="_blank" rel="noopener noreferrer" className="cb-btn cb-btn-outline cb-btn-sm">
                        Visit Website
                      </a>
                      <button className="cb-btn cb-btn-primary cb-btn-sm" onClick={() => handleApply(vendor)}>
                        Mark Applied
                      </button>
                    </>
                  )}
                  {status === 'applied' && (
                    <>
                      <button className="cb-btn cb-btn-outline cb-btn-sm" onClick={() => handleRemove(vendor)}>
                        Remove
                      </button>
                      <button className="cb-btn cb-btn-save cb-btn-sm" onClick={() => handleMarkReporting(vendor)}>
                        Mark Reporting
                      </button>
                    </>
                  )}
                  {status === 'reporting' && (
                    <>
                      <a href={vendor.url} target="_blank" rel="noopener noreferrer" className="cb-btn cb-btn-outline cb-btn-sm">
                        Visit Website
                      </a>
                      <button className="cb-btn cb-btn-outline cb-btn-sm" onClick={() => handleRemove(vendor)}>
                        Remove
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {totalPages > 1 && (
          <nav className="cb-vendor-pagination" aria-label="Vendor pages">
            <button
              className="cb-vendor-page-btn"
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
            >
              ← Previous
            </button>

            <div className="cb-vendor-page-dots">
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  className={`cb-vendor-page-dot ${i === page ? 'is-active' : ''}`}
                  onClick={() => setPage(i)}
                  aria-label={`Go to page ${i + 1}`}
                  aria-current={i === page ? 'page' : undefined}
                >
                  {i + 1}
                </button>
              ))}
            </div>

            <button
              className="cb-vendor-page-btn"
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
            >
              Next →
            </button>
          </nav>
        )}
      </div>
    </div>
  );
}
