import { STEPS } from './creditBuilderData.js';
import { getItemWeight } from './scoreWeights.js';

/**
 * "Next Milestone" sidebar card.
 * Shows the next uncompleted sub-item from the active step + its point value.
 * If the step is complete, points the user at the next step's first item.
 */
export default function NextMilestone({ progress, activeStep }) {
  // First: try the active step
  let step = STEPS.find(s => s.step === activeStep);
  let next = step?.subItems.find(si => !progress[`${activeStep}:${si.slug}`]?.completed);

  // Step done? Roll forward to find the next incomplete item across all steps.
  if (!next) {
    for (let n = activeStep + 1; n <= 7; n++) {
      const s = STEPS.find(x => x.step === n);
      const cand = s?.subItems.find(si => !progress[`${n}:${si.slug}`]?.completed);
      if (cand) { step = s; next = cand; break; }
    }
  }

  if (!next) {
    return (
      <div className="cb-milestone-card">
        <span className="cb-milestone-eyebrow">Next milestone</span>
        <span className="cb-milestone-done">All milestones complete</span>
      </div>
    );
  }

  const weight = getItemWeight(next.slug);

  return (
    <div className="cb-milestone-card">
      <span className="cb-milestone-eyebrow">Next milestone</span>
      <span className="cb-milestone-label">{next.name}</span>
      {weight > 0 && (
        <span className="cb-milestone-pts">+{weight} points</span>
      )}
    </div>
  );
}
