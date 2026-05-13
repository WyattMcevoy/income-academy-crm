import { STEPS, SUB_PAGE_CONTENT, VENDOR_CATALOG } from './creditBuilderData.js';

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

  let prereqsMet = true;
  let prereqStepLabel = null;

  if (step === 3) {
    prereqsMet = checkFoundationComplete(progress);
    if (!prereqsMet) prereqStepLabel = 1;
  } else if (prereq) {
    prereqsMet = reportingCount >= prereq.requiredVendors;
    if (!prereqsMet) prereqStepLabel = prereq.requiredStep;
  }

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

      {/* Vendor catalog */}
      <div className="cb-vendor-catalog">
        <h3 className="cb-vendor-catalog-title">Tier {tierNumber} Vendor Accounts</h3>
        <p className="cb-vendor-catalog-desc">
          Apply for these accounts, then mark them as reporting once they appear on your business credit reports.
        </p>

        <div className="cb-vendor-catalog-list">
          {catalog.map(vendor => {
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
      </div>
    </div>
  );
}
