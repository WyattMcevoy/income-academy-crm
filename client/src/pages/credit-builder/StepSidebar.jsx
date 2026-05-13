import { STEPS } from './creditBuilderData.js';

export default function StepSidebar({ activeStep, activeSubItem, progress, onStepClick, onSubItemClick }) {
  return (
    <div className="cb-step-sidebar">
      {STEPS.map(s => (
        <div key={s.step} className="cb-sidebar-step">
          <button
            className={`cb-sidebar-step-header ${activeStep === s.step ? 'cb-sidebar-step-active' : ''}`}
            onClick={() => onStepClick(s.step)}
          >
            <span className="cb-sidebar-step-num">{s.step}</span>
            <span className="cb-sidebar-step-name">{s.name}</span>
          </button>
          {activeStep === s.step && (
            <div className="cb-sidebar-sub-items">
              {s.subItems.map(si => {
                const prog = progress[`${s.step}:${si.slug}`];
                return (
                  <button
                    key={si.slug}
                    className={`cb-sidebar-sub-item ${activeSubItem === si.slug ? 'cb-sidebar-sub-active' : ''} ${prog?.completed ? 'cb-sidebar-sub-done' : ''}`}
                    onClick={() => onSubItemClick(si.slug)}
                  >
                    <span className="cb-sidebar-sub-status">
                      {prog?.completed ? '✅' : '⭕'}
                    </span>
                    {si.name}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
