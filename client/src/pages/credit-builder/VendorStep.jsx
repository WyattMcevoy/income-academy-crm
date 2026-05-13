import { STEPS, SUB_PAGE_CONTENT } from './creditBuilderData.js';

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

/** Map tier step numbers to the prerequisite step and required vendor count. */
const TIER_PREREQS = {
  3: { requiredStep: null, requiredVendors: 0 },   // Tier 1: needs foundation items
  5: { requiredStep: 3, requiredVendors: 3 },       // Tier 2: needs 3 vendors
  6: { requiredStep: 5, requiredVendors: 6 },       // Tier 3: needs 6 vendors
  7: { requiredStep: 6, requiredVendors: 9 },       // Tier 4: needs 9 vendors
};

function getItemStatus(item, progress) {
  const key = `${item.step}:${item.slug}`;
  const entry = progress[key];

  if (!entry) return 'not_started';
  if (entry.completed) return 'completed';

  // Has a selected option but not completed — check followUp status
  if (entry.selected_option) {
    const content = SUB_PAGE_CONTENT[item.slug];
    const followUp = content?.followUp?.[entry.selected_option];
    if (followUp?.status === 'negative') return 'negative';
    // In-progress but not negative
    return 'not_started';
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
  return vendors.filter(v => v.reporting).length;
}

export default function VendorStep({
  step,
  tierName,
  targetCount,
  progress,
  vendors,
  onNavigateStep,
}) {
  const prereq = TIER_PREREQS[step];
  const reportingCount = countReportingVendors(vendors);

  // Determine if prerequisites are met
  let prereqsMet = true;
  let prereqStepLabel = null;

  if (step === 3) {
    // Tier 1 needs foundation items from steps 1-2
    prereqsMet = checkFoundationComplete(progress);
    if (!prereqsMet) prereqStepLabel = 1;
  } else if (prereq) {
    prereqsMet = reportingCount >= prereq.requiredVendors;
    if (!prereqsMet) prereqStepLabel = prereq.requiredStep;
  }

  const tierNumber = step === 3 ? 1 : step === 5 ? 2 : step === 6 ? 3 : 4;

  return (
    <div className="cb-vendor-page">
      {/* Header */}
      <div className="cb-vendor-page-header">
        <h2 className="cb-vendor-page-title">{tierName}</h2>
        <p className="cb-vendor-page-subtitle">
          {targetCount} vendors reporting
        </p>
      </div>

      {/* Warning box when prerequisites not met */}
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

      {/* Foundation checklist */}
      <div className="cb-prereq-section">
        <h3 className="cb-prereq-section-title">
          ⚙️ Foundation
        </h3>
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
        <h3 className="cb-prereq-section-title">
          ⚙️ Business Credit Builder
        </h3>
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
  );
}
