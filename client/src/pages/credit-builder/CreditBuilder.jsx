import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../auth.jsx';
import { api } from '../../api.js';
import { STEPS, SUB_PAGE_CONTENT } from './creditBuilderData.js';
import ScoreGauge from './ScoreGauge.jsx';
import VendorDistribution from './VendorDistribution.jsx';
import StepSidebar from './StepSidebar.jsx';
import SubPage from './SubPage.jsx';
import VendorStep from './VendorStep.jsx';
import FundabilityDashboard from './FundabilityDashboard.jsx';
import './credit-builder.css';

const VENDOR_STEPS = [3, 5, 6, 7];

export default function CreditBuilder() {
  const { auth } = useAuth();
  const [activeTab, setActiveTab] = useState('builder');
  const [activeStep, setActiveStep] = useState(1);
  const [activeSubItem, setActiveSubItem] = useState(null);
  const [progress, setProgress] = useState({});
  const [score, setScore] = useState({ score: 0, approved_funding: 0 });
  const [vendors, setVendors] = useState([]);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const [prog, sc, vend, forms] = await Promise.all([
        api('/api/credit-builder/progress', { token: auth.token }),
        api('/api/credit-builder/score', { token: auth.token }),
        api('/api/credit-builder/vendors', { token: auth.token }),
        api('/api/credit-builder/form-data', { token: auth.token }),
      ]);
      const progressMap = {};
      prog.forEach(p => { progressMap[`${p.step}:${p.sub_item}`] = p; });
      setProgress(progressMap);
      setScore(sc);
      setVendors(vend);
      const formMap = {};
      forms.forEach(f => { formMap[f.sub_item] = f.form_data; });
      setFormData(formMap);
    } catch (e) {
      console.error('Failed to load credit builder data:', e);
    } finally {
      setLoading(false);
    }
  }, [auth.token]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const currentStep = STEPS.find(s => s.step === activeStep);

  const handleSelectOption = async (subSlug, option) => {
    try {
      await api('/api/credit-builder/progress', {
        method: 'PUT',
        token: auth.token,
        body: { step: activeStep, sub_item: subSlug, selected_option: option },
      });
      setProgress(prev => ({
        ...prev,
        [`${activeStep}:${subSlug}`]: { step: activeStep, sub_item: subSlug, selected_option: option, completed: false },
      }));
    } catch (e) {
      console.error('Failed to save selection:', e);
    }
  };

  const handleComplete = async (subSlug) => {
    try {
      await api('/api/credit-builder/progress/complete', {
        method: 'PUT',
        token: auth.token,
        body: { step: activeStep, sub_item: subSlug, completed: true },
      });
      setProgress(prev => {
        const updated = {
          ...prev,
          [`${activeStep}:${subSlug}`]: { ...prev[`${activeStep}:${subSlug}`], completed: true },
        };
        recalcScore(updated);
        return updated;
      });
    } catch (e) {
      console.error('Failed to mark complete:', e);
    }
  };

  const recalcScore = async (currentProgress) => {
    const completedCount = Object.values(currentProgress || progress).filter(p => p.completed).length;
    const totalItems = STEPS.reduce((sum, s) => sum + s.subItems.length, 0);
    const newScore = Math.round((completedCount / totalItems) * 890);
    try {
      const result = await api('/api/credit-builder/score', {
        method: 'POST',
        token: auth.token,
        body: { score: newScore, approved_funding: 0 },
      });
      setScore(result);
    } catch (e) {
      console.error('Failed to update score:', e);
    }
  };

  const handleVendorAction = async (vendorData) => {
    try {
      const result = await api('/api/credit-builder/vendors', {
        method: 'PUT',
        token: auth.token,
        body: vendorData,
      });
      setVendors(prev => {
        const existing = prev.findIndex(v => v.bureau === result.bureau && v.vendor_name === result.vendor_name);
        if (!result.applied && !result.completed) {
          return prev.filter((_, i) => i !== existing);
        }
        if (existing >= 0) {
          const updated = [...prev];
          updated[existing] = result;
          return updated;
        }
        return [...prev, result];
      });
    } catch (e) {
      console.error('Failed to update vendor:', e);
    }
  };

  const getStepProgress = (stepNum) => {
    const step = STEPS.find(s => s.step === stepNum);
    if (!step) return 0;
    const completed = step.subItems.filter(si => progress[`${stepNum}:${si.slug}`]?.completed).length;
    return Math.round((completed / step.subItems.length) * 100);
  };

  const handleSaveForm = async (subSlug, data) => {
    try {
      await api('/api/credit-builder/form-data', {
        method: 'PUT',
        token: auth.token,
        body: { sub_item: subSlug, form_data: data },
      });
      setFormData(prev => ({ ...prev, [subSlug]: data }));
    } catch (e) {
      console.error('Failed to save form data:', e);
    }
  };

  const handleNextStep = () => {
    if (activeStep < 7) {
      setActiveStep(activeStep + 1);
      setActiveSubItem(null);
    }
  };

  const handlePrevStep = () => {
    if (activeStep > 1) {
      setActiveStep(activeStep - 1);
      setActiveSubItem(null);
    }
  };

  if (loading) {
    return <div className="cb-loading">Loading Credit Builder...</div>;
  }

  return (
    <div className="cb-container">
      <div className="cb-header">
        <h1 className="cb-title">Business Credit Builder</h1>
        <div className="cb-nav-tabs">
          <span className={`cb-nav-tab ${activeTab === 'builder' ? 'cb-nav-tab-active' : ''}`} onClick={() => setActiveTab('builder')}>Business Credit Builder</span>
          <span className="cb-nav-divider">|</span>
          <span className={`cb-nav-tab ${activeTab === 'dashboard' ? 'cb-nav-tab-active' : ''}`} onClick={() => setActiveTab('dashboard')}>Fundability Dashboard</span>
        </div>
      </div>

      {activeTab === 'dashboard' ? (
        <div className="cb-main cb-main-dashboard">
          <div className="cb-content-col" style={{ gridColumn: '1 / -1', maxWidth: '100%' }}>
            <FundabilityDashboard
              score={score.score}
              progress={progress}
              onNavigateToItem={(step, slug) => {
                setActiveTab('builder');
                setActiveStep(step);
                setActiveSubItem(slug);
              }}
            />
          </div>
          <div className="cb-score-col">
            <ScoreGauge score={score.score} maxScore={890} />
            <div className="cb-score-stats">
              <div className="cb-stat-row">
                <span>Approved Funding</span>
                <span>${score.approved_funding?.toLocaleString() || 0}</span>
              </div>
              <div className="cb-stat-row">
                <span>Revenue vs Funding</span>
                <span>{score.score > 0 ? Math.round((score.approved_funding / score.score) * 100) : 0}%</span>
              </div>
            </div>
            <VendorDistribution vendors={vendors} />
          </div>
        </div>
      ) : (
        <>
          {/* Progress bar */}
          <div className="cb-progress-bar">
            {STEPS.map(s => (
              <button
                key={s.step}
                className={`cb-progress-step ${activeStep === s.step ? 'cb-progress-step-active' : ''} ${getStepProgress(s.step) === 100 ? 'cb-progress-step-done' : ''}`}
                onClick={() => { setActiveStep(s.step); setActiveSubItem(null); }}
              >
                {s.step}/7
              </button>
            ))}
          </div>

          <div className="cb-main">
            {/* Left column: Step list */}
            <div className="cb-steps-col">
              {STEPS.map(s => (
                <button
                  key={s.step}
                  className={`cb-step-card ${activeStep === s.step ? 'cb-step-card-active' : ''}`}
                  onClick={() => { setActiveStep(s.step); setActiveSubItem(null); }}
                >
                  <span className="cb-step-icon">{s.icon}</span>
                  <div className="cb-step-info">
                    <span className="cb-step-label">STEP {s.step}</span>
                    <span className="cb-step-name">{s.name}</span>
                  </div>
                </button>
              ))}
            </div>

            {/* Center column: Step detail / sub-page */}
            <div className="cb-content-col">
              {activeSubItem ? (
                <SubPage
                  step={activeStep}
                  subSlug={activeSubItem}
                  content={SUB_PAGE_CONTENT[activeSubItem]}
                  progress={progress[`${activeStep}:${activeSubItem}`]}
                  formData={formData[activeSubItem]}
                  onSelect={(option) => handleSelectOption(activeSubItem, option)}
                  onComplete={() => handleComplete(activeSubItem)}
                  onBack={() => setActiveSubItem(null)}
                  onNavigate={(slug) => setActiveSubItem(slug)}
                  onSaveForm={(data) => handleSaveForm(activeSubItem, data)}
                />
              ) : VENDOR_STEPS.includes(activeStep) ? (
                <VendorStep
                  step={activeStep}
                  tierName={currentStep?.name}
                  targetCount={SUB_PAGE_CONTENT[currentStep?.subItems[0]?.slug]?.targetCount || 3}
                  progress={progress}
                  vendors={vendors}
                  onNavigateStep={(stepNum) => { setActiveStep(stepNum); setActiveSubItem(null); }}
                  onVendorAction={handleVendorAction}
                />
              ) : (
                <div className="cb-step-overview">
                  <div className="cb-step-overview-header">
                    <span className="cb-step-overview-icon">{currentStep?.icon}</span>
                    <div>
                      <div className="cb-step-overview-label">Step {activeStep}/7</div>
                      <h2 className="cb-step-overview-title">{currentStep?.name}</h2>
                    </div>
                  </div>

                  <div className="cb-sub-items">
                    {currentStep?.subItems.map(si => {
                      const prog = progress[`${activeStep}:${si.slug}`];
                      const subContent = SUB_PAGE_CONTENT[si.slug];
                      const followUp = subContent?.followUp?.[prog?.selected_option];
                      const status = followUp?.status || (prog?.completed ? 'positive' : null);
                      const statusIcon = status === 'positive' ? '✅' : status === 'negative' ? '❌' : '⭕';
                      return (
                        <button
                          key={si.slug}
                          className={`cb-sub-item ${status === 'positive' ? 'cb-sub-item-done' : ''} ${status === 'negative' ? 'cb-sub-item-warning' : ''}`}
                          onClick={() => setActiveSubItem(si.slug)}
                        >
                          <span className="cb-sub-item-status">{statusIcon}</span>
                          <span className="cb-sub-item-name">{si.name}</span>
                        </button>
                      );
                    })}
                  </div>

                  <div className="cb-step-nav">
                    {activeStep > 1 && (
                      <button className="cb-btn cb-btn-outline" onClick={handlePrevStep}>
                        ← Previous
                      </button>
                    )}
                    {activeStep < 7 && (
                      <button className="cb-btn cb-btn-primary" onClick={handleNextStep}>
                        Next →
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Right column: Score + Vendors */}
            <div className="cb-score-col">
              <ScoreGauge score={score.score} maxScore={890} />
              <div className="cb-score-stats">
                <div className="cb-stat-row">
                  <span>Approved Funding</span>
                  <span>${score.approved_funding?.toLocaleString() || 0}</span>
                </div>
                <div className="cb-stat-row">
                  <span>Revenue vs Funding</span>
                  <span>{score.score > 0 ? Math.round((score.approved_funding / score.score) * 100) : 0}%</span>
                </div>
              </div>
              <VendorDistribution vendors={vendors} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
