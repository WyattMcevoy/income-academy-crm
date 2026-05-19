import { STEPS } from './creditBuilderData.js';
import { getItemWeight } from './scoreWeights.js';

/**
 * Contextual tip below the three-column body.
 * Generates a single sentence of guidance based on what's most impactful
 * for the user to do next in the active step.
 */
function getTip(activeStep, progress) {
  const step = STEPS.find(s => s.step === activeStep);
  if (!step) return null;

  const incomplete = step.subItems.filter(
    si => !progress[`${activeStep}:${si.slug}`]?.completed
  );

  if (incomplete.length === 0) {
    if (activeStep < 7) {
      return `You've finished every item in step ${activeStep}. Move to step ${activeStep + 1} when you're ready.`;
    }
    return `You've completed every step in the program. Maintain your reporting accounts and check back monthly.`;
  }

  // Pick the two highest-impact items the user can knock out next.
  const ranked = incomplete
    .map(si => ({ si, w: getItemWeight(si.si?.slug || si.slug) }))
    .sort((a, b) => b.w - a.w);

  const top = ranked.slice(0, 2).map(r => (r.si.name || '').toLowerCase());

  if (activeStep === 1) {
    if (top.length >= 2) {
      return `Completing your ${top[0]} and ${top[1]} next will unlock Tier 1 vendor accounts.`;
    }
    return `Completing your ${top[0]} next will help unlock Tier 1 vendor accounts.`;
  }

  if (activeStep === 2) {
    return `Bureau verifications carry the most weight on this step — finish them before moving on.`;
  }

  if ([3, 5, 6, 7].includes(activeStep)) {
    return `Apply for vendors that report to all three bureaus first. Mark each one as reporting once it shows up on your business credit report.`;
  }

  return `Completing the next ${incomplete.length} item${incomplete.length === 1 ? '' : 's'} in this step will move your Credit Readiness Score forward.`;
}

export default function TipCallout({ progress, activeStep }) {
  const tip = getTip(activeStep, progress);
  if (!tip) return null;
  return (
    <div className="cb-tip-callout">
      <span className="cb-tip-icon" aria-hidden="true">💡</span>
      <span className="cb-tip-text"><strong>Tip:</strong> {tip}</span>
    </div>
  );
}
