import { useState, useEffect, useCallback, useMemo } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../auth.jsx';
import { api } from '../../api.js';
import { STEPS, SUB_PAGE_CONTENT } from './creditBuilderData.js';
import { computeFundabilityScore, SCORE_MAX } from './scoreWeights.js';
import ScoreGauge from './ScoreGauge.jsx';
import ScoreHistoryChart from './ScoreHistoryChart.jsx';
import VendorDistribution from './VendorDistribution.jsx';
import FundingEvents from './FundingEvents.jsx';
import SubPage from './SubPage.jsx';
import VendorStep from './VendorStep.jsx';
import FundabilityDashboard from './FundabilityDashboard.jsx';
import './credit-builder.css';

const VENDOR_STEPS = [3, 5, 6, 7];
const TENANT_THEME_CLASS = 'cb-theme-income-academy'; // swap for 'cb-theme-kickstart' when white-labeled

// Inject editorial fonts once.
function useEditorialFonts() {
  useEffect(() => {
    const id = 'cb-fonts';
    if (document.getElementById(id)) return;
    const link = document.createElement('link');
    link.id = id;
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;1,9..144,500&family=Geist:wght@400;460;500;600;700&family=Geist+Mono:wght@500;600&display=swap';
    document.head.appendChild(link);
  }, []);
}

export default function CreditBuilder() {
  useEditorialFonts();
  const { auth } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const params = useParams();

  // Parse URL → state. Pattern: /credit-builder, /credit-builder/dashboard,
  // /credit-builder/step/:n, /credit-builder/step/:n/:slug
  const pathMatch = useMemo(() => {
    const segs = location.pathname.replace(/^\/credit-builder\/?/, '').split('/').filter(Boolean);
    if (segs[0] === 'dashboard') return { tab: 'dashboard', step: 1, sub: null };
    if (segs[0] === 'step') {
      const n = parseInt(segs[1], 10);
      const step = Number.isInteger(n) && n >= 1 && n <= 7 ? n : 1;
      const sub = segs[2] || null;
      return { tab: 'builder', step, sub };
    }
    return { tab: 'builder', step: 1, sub: null };
  }, [location.pathname]);

  const [progress, setProgress] = useState({});
  const [score, setScore] = useState({ score: 0 });
  const [vendors, setVendors] = useState([]);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [historyKey, setHistoryKey] = useState(0); // bump to refresh sparkline

  const activeTab = pathMatch.tab;
  const activeStep = pathMatch.step;
  const activeSubItem = pathMatch.sub;

  const setTab = (tab) => {
    if (tab === 'dashboard') navigate('/credit-builder/dashboard');
    else navigate('/credit-builder');
  };
  const setStep = (n) => navigate(`/credit-builder/step/${n}`);
  const setSubItem = (slug) => {
    if (slug) navigate(`/credit-builder/step/${activeStep}/${slug}`);
    else navigate(`/credit-builder/step/${activeStep}`);
  };

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
          [`${activeStep}:${subSlug}`]: { ...prev[`${activeStep}:${subSlug}`], step: activeStep, sub_item: subSlug, completed: true },
        };
        recalcScore(updated);
        return updated;
      });
    } catch (e) {
      console.error('Failed to mark complete:', e);
    }
  };

  // Impact-weighted score (see scoreWeights.js)
  const recalcScore = async (currentProgress) => {
    const newScore = computeFundabilityScore(currentProgress || progress);
    try {
      const result = await api('/api/credit-builder/score', {
        method: 'POST',
        token: auth.token,
        body: { score: newScore, approved_funding: 0 },
      });
      setScore(result);
      setHistoryKey(k => k + 1);
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

  const handleNextStep = () => { if (activeStep < 7) setStep(activeStep + 1); };
  const handlePrevStep = () => { if (activeStep > 1) setStep(activeStep - 1); };

  if (loading) {
    return <div className={`${TENANT_THEME_CLASS} cb-loading`}>Loading Credit Builder…</div>;
  }

  return (
    <div className={`${TENANT_THEME_CLASS} cb-container`}>
      <div className="cb-header">
        <h1 className="cb-title">Business Credit Builder</h1>
        <div className="cb-nav-tabs">
          <span className={`cb-nav-tab ${activeTab === 'builder' ? 'cb-nav-tab-active' : ''}`} onClick={() => setTab('builder')}>Business Credit Builder</span>
          <span className="cb-nav-divider">|</span>
          <span className={`cb-nav-tab ${activeTab === 'dashboard' ? 'cb-nav-tab-active' : ''}`} onClick={() => setTab('dashboard')}>Fundability Dashboard</span>
        </div>
      </div>

      {activeTab === 'dashboard' ? (
        <div className="cb-main cb-main-dashboard">
          <div className="cb-content-col" style={{ gridColumn: '1 / -1', maxWidth: '100%' }}>
            <FundabilityDashboard
              score={score.score}
              progress={progress}
              onNavigateToItem={(step, slug) => navigate(`/credit-builder/step/${step}/${slug}`)}
            />
          </div>
          <div className="cb-score-col">
            <ScoreGauge score={score.score} maxScore={SCORE_MAX} />
            <ScoreHistoryChart refreshKey={historyKey} maxScore={SCORE_MAX} />
            <FundingEvents />
            <VendorDistribution vendors={vendors} />
          </div>
        </div>
      ) : (
        <>
          <div className="cb-progress-bar">
            {STEPS.map(s => (
              <button
                key={s.step}
                className={`cb-progress-step ${activeStep === s.step ? 'cb-progress-step-active' : ''} ${getStepProgress(s.step) === 100 ? 'cb-progress-step-done' : ''}`}
                onClick={() => setStep(s.step)}
              >
                {s.step}/7
              </button>
            ))}
          </div>

          <div className="cb-main">
            <div className="cb-steps-col">
              {STEPS.map(s => (
                <button
                  key={s.step}
                  className={`cb-step-card ${activeStep === s.step ? 'cb-step-card-active' : ''}`}
                  onClick={() => setStep(s.step)}
                >
                  <span className="cb-step-icon">{s.icon}</span>
                  <div className="cb-step-info">
                    <span className="cb-step-label">STEP {s.step}</span>
                    <span className="cb-step-name">{s.name}</span>
                  </div>
                </button>
              ))}
            </div>

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
                  onBack={() => setSubItem(null)}
                  onNavigate={(slug) => setSubItem(slug)}
                  onSaveForm={(data) => handleSaveForm(activeSubItem, data)}
                />
              ) : VENDOR_STEPS.includes(activeStep) ? (
                <VendorStep
                  step={activeStep}
                  tierName={currentStep?.name}
                  targetCount={SUB_PAGE_CONTENT[currentStep?.subItems[0]?.slug]?.targetCount || 3}
                  progress={progress}
                  vendors={vendors}
                  onNavigateStep={(stepNum) => setStep(stepNum)}
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
                          onClick={() => setSubItem(si.slug)}
                        >
                          <span className="cb-sub-item-status">{statusIcon}</span>
                          <span className="cb-sub-item-name">{si.name}</span>
                        </button>
                      );
                    })}
                  </div>

                  <div className="cb-step-nav">
                    {activeStep > 1 && (
                      <button className="cb-btn cb-btn-outline" onClick={handlePrevStep}>← Previous</button>
                    )}
                    {activeStep < 7 && (
                      <button className="cb-btn cb-btn-primary" onClick={handleNextStep}>Next →</button>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="cb-score-col">
              <ScoreGauge score={score.score} maxScore={SCORE_MAX} />
              <ScoreHistoryChart refreshKey={historyKey} maxScore={SCORE_MAX} />
              <FundingEvents />
              <VendorDistribution vendors={vendors} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
