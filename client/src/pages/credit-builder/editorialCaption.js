import { STEPS } from './creditBuilderData.js';

/**
 * Generates an editorial one-line summary of dashboard state.
 * Pure function — takes progress + vendors + score history, returns
 * a string with light markup ({brand:"..."}, {italic:"..."}) tokens
 * that the caller's component can render as JSX (no innerHTML).
 *
 * Public.com pattern: layer narrative over data.
 */

function getStepCompletion(stepNum, progress) {
  const step = STEPS.find(s => s.step === stepNum);
  if (!step) return { done: 0, total: 0 };
  const done = step.subItems.filter(si => progress[`${stepNum}:${si.slug}`]?.completed).length;
  return { done, total: step.subItems.length };
}

export function dashboardCaption({ progress = {}, vendors = [], scoreDelta = 0 }) {
  const foundation = getStepCompletion(1, progress);
  const verification = getStepCompletion(2, progress);
  const reportingVendors = new Set(vendors.filter(v => v.completed).map(v => v.vendor_name)).size;

  // Pick the most relevant insight (priority order)
  if (foundation.done < foundation.total) {
    const remaining = foundation.total - foundation.done;
    return {
      lead: `You're ${foundation.done} of ${foundation.total} through your `,
      emphasis: 'Credit Foundation',
      tail: `. ${remaining} more step${remaining === 1 ? '' : 's'} before Tier 1 unlocks.`,
    };
  }
  if (verification.done < verification.total) {
    const remaining = verification.total - verification.done;
    return {
      lead: 'Foundation complete. ',
      emphasis: `${remaining} bureau verification${remaining === 1 ? '' : 's'}`,
      tail: ' left before your credit profile is ready to build.',
    };
  }
  if (reportingVendors < 3) {
    return {
      lead: `You have ${reportingVendors} reporting vendor${reportingVendors === 1 ? '' : 's'}. `,
      emphasis: 'Three more to reach Tier 2.',
      tail: '',
    };
  }
  if (reportingVendors < 6) {
    return {
      lead: `${reportingVendors} reporting accounts established. Tier 2 is `,
      emphasis: 'within reach',
      tail: ` — ${6 - reportingVendors} more to unlock Tier 3.`,
    };
  }
  if (reportingVendors < 9) {
    return {
      lead: 'Tier 2 complete. ',
      emphasis: 'Advanced building tier',
      tail: ` opens at 9 reporting accounts — you're at ${reportingVendors}.`,
    };
  }
  if (reportingVendors < 12) {
    return {
      lead: 'Tier 3 reached. ',
      emphasis: 'Revolving accounts (Tier 4)',
      tail: ` unlock at 12 reporting vendors.`,
    };
  }
  if (scoreDelta > 0) {
    return {
      lead: 'Your Credit Readiness has grown by ',
      emphasis: `+${scoreDelta} points`,
      tail: ' this period. Keep maintaining your reporting accounts.',
    };
  }
  return {
    lead: 'All tiers complete. ',
    emphasis: 'You are fundable.',
    tail: ' Maintain your tradelines and consider applying to a no-PG corporate card.',
  };
}

export function tierCaption({ tierNumber, reportingCount, target }) {
  if (reportingCount >= target) {
    return {
      lead: `Tier ${tierNumber} complete. `,
      emphasis: `${reportingCount} of ${target} reporting.`,
      tail: '',
    };
  }
  const remaining = target - reportingCount;
  return {
    lead: `${reportingCount} of ${target} reporting. `,
    emphasis: `${remaining} more`,
    tail: ` to complete Tier ${tierNumber}.`,
  };
}
