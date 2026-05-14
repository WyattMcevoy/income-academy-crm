import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import '../auth.css';
import './fundability-quiz.css';

const QUIZ_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000';

// Each question maps an answer key → weighted points. Subset of the full
// 890-point Credit Readiness Score — enough signal for a directional snapshot.
const QUESTIONS = [
  {
    id: 'entity',
    prompt: 'How is your business legally structured?',
    options: [
      { value: 'llc', label: 'LLC', points: 60 },
      { value: 'corp', label: 'S- or C-Corp', points: 60 },
      { value: 'partnership', label: 'Partnership', points: 30 },
      { value: 'sole_prop', label: 'Sole proprietor / no entity', points: 0 },
    ],
  },
  {
    id: 'ein',
    prompt: 'Does your business have an EIN?',
    options: [
      { value: 'yes', label: 'Yes', points: 60 },
      { value: 'no', label: 'No / not sure', points: 0 },
    ],
  },
  {
    id: 'bank',
    prompt: 'Do you have a dedicated business bank account?',
    options: [
      { value: 'yes', label: 'Yes', points: 50 },
      { value: 'no', label: 'No', points: 0 },
    ],
  },
  {
    id: 'address',
    prompt: 'What kind of business address are you using?',
    options: [
      { value: 'commercial', label: 'Commercial / leased office', points: 40 },
      { value: 'virtual', label: 'Virtual address', points: 35 },
      { value: 'home', label: 'Home address', points: 25 },
      { value: 'po_or_ra', label: 'PO Box or registered-agent only', points: 0 },
    ],
  },
  {
    id: 'phone',
    prompt: 'Is there a business phone number listed in 411 / directory?',
    options: [
      { value: 'yes', label: 'Yes', points: 30 },
      { value: 'no', label: 'Only my personal cell', points: 0 },
    ],
  },
  {
    id: 'duns',
    prompt: 'Have you registered for a D&B DUNS number?',
    options: [
      { value: 'yes', label: 'Yes — and it\'s active', points: 70 },
      { value: 'no', label: 'No / not yet', points: 0 },
    ],
  },
  {
    id: 'time',
    prompt: 'How long has the business been operating?',
    options: [
      { value: '2plus', label: '2+ years', points: 30 },
      { value: '1to2', label: '1–2 years', points: 20 },
      { value: 'under1', label: 'Under 1 year', points: 10 },
      { value: 'pre', label: 'Pre-launch', points: 0 },
    ],
  },
];

// Snapshot subset adds to 340 max — scale to 890 for presentation parity.
const SUBSET_MAX = QUESTIONS.reduce((sum, q) => sum + Math.max(...q.options.map(o => o.points)), 0);
const DISPLAY_MAX = 890;

function tierFor(score) {
  if (score >= 700) return { label: 'Revolving / Fundable', body: 'Your fundability is in the top range. No-PG corporate cards and bank LOCs are realistic — keep your tradelines reporting.' };
  if (score >= 550) return { label: 'Advanced Building', body: 'Underwriters are likely starting to recognize your business credit profile independently. Stay disciplined on reporting.' };
  if (score >= 400) return { label: 'Building Credit', body: 'Foundation is in place. Apply for Tier 2 retail revolving accounts and keep adding reporting tradelines.' };
  if (score >= 200) return { label: 'Foundation Complete', body: 'You have the structure to apply for Tier 1 vendor accounts. The next 90 days matter most.' };
  return { label: 'Establishing Foundation', body: 'Most of the fundability work is still ahead of you — and that\'s normal. The Credit Builder walks you through every step in order.' };
}

function injectFonts() {
  if (typeof document === 'undefined') return;
  if (document.getElementById('auth-fonts')) return;
  const link = document.createElement('link');
  link.id = 'auth-fonts';
  link.rel = 'stylesheet';
  link.href = 'https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;1,9..144,500&family=Geist:wght@400;460;500;600&family=Geist+Mono:wght@500;600&display=swap';
  document.head.appendChild(link);
}

export default function FundabilityQuiz() {
  useEffect(injectFonts, []);

  const [step, setStep] = useState(0); // 0..QUESTIONS.length = question; QUESTIONS.length+1 = email; +2 = result
  const [answers, setAnswers] = useState({});
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [score, setScore] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState('');

  const isQuestionStep = step < QUESTIONS.length;
  const isEmailStep = step === QUESTIONS.length;
  const isResultStep = step === QUESTIONS.length + 1;

  const handleAnswer = (qId, opt) => {
    const next = { ...answers, [qId]: opt.value };
    setAnswers(next);
    setTimeout(() => setStep(s => s + 1), 220); // brief reveal for the highlight
  };

  const computeScore = () => {
    const subsetPoints = QUESTIONS.reduce((sum, q) => {
      const ans = answers[q.id];
      const picked = q.options.find(o => o.value === ans);
      return sum + (picked?.points || 0);
    }, 0);
    return Math.round((subsetPoints / SUBSET_MAX) * DISPLAY_MAX);
  };

  const submit = async (e) => {
    e.preventDefault();
    setErr('');
    const finalScore = computeScore();
    setScore(finalScore);
    setSubmitting(true);
    try {
      const res = await fetch(`${QUIZ_BASE}/api/intake/fundability-quiz`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, first_name: firstName, answers, score: finalScore }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || 'Could not save');
      }
      setStep(step + 1);
    } catch (e) {
      setErr(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const progress = isResultStep ? 100 : Math.round((step / (QUESTIONS.length + 1)) * 100);
  const band = tierFor(score);

  return (
    <div className="auth-page fundability-quiz-page">
      <div className="auth-grain" aria-hidden="true" />

      <div className="fq-shell">
        <header className="fq-header">
          <div className="auth-brand">
            <span className="auth-brand-mark">IA</span>
            <span className="auth-brand-divider" aria-hidden="true" />
            <span className="auth-brand-name">Credit Readiness Score</span>
          </div>
          {!isResultStep && (
            <div className="fq-progress">
              <span className="fq-progress-label">{Math.min(step + 1, QUESTIONS.length + 1)} of {QUESTIONS.length + 1}</span>
              <div className="fq-progress-bar"><div className="fq-progress-bar-fill" style={{ width: `${progress}%` }} /></div>
            </div>
          )}
        </header>

        <main className="fq-main">
          {isQuestionStep && (
            <div className="fq-step" key={`q-${step}`}>
              <p className="auth-eyebrow fq-eyebrow">Question {step + 1}</p>
              <h2 className="fq-prompt">{QUESTIONS[step].prompt}</h2>
              <div className="fq-options">
                {QUESTIONS[step].options.map(opt => (
                  <button
                    key={opt.value}
                    className={`fq-option ${answers[QUESTIONS[step].id] === opt.value ? 'is-selected' : ''}`}
                    onClick={() => handleAnswer(QUESTIONS[step].id, opt)}
                  >
                    {opt.label}
                    <span className="fq-option-arrow" aria-hidden="true">→</span>
                  </button>
                ))}
              </div>
              {step > 0 && (
                <button className="fq-back" onClick={() => setStep(s => s - 1)}>← Back</button>
              )}
            </div>
          )}

          {isEmailStep && (
            <div className="fq-step">
              <p className="auth-eyebrow fq-eyebrow">Last step</p>
              <h2 className="fq-prompt">Where should we send your <em>score breakdown</em>?</h2>
              <p className="fq-sub">We'll email you the detailed report and what to do next. No spam, ever.</p>

              <form onSubmit={submit} className="fq-form" noValidate>
                <div className="auth-field">
                  <label htmlFor="fq-first" className="auth-label">First name</label>
                  <input id="fq-first" className="auth-input" type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} autoFocus autoComplete="given-name" />
                </div>
                <div className="auth-field">
                  <label htmlFor="fq-email" className="auth-label">Email</label>
                  <input id="fq-email" className="auth-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
                </div>

                {err && <p className="auth-error">— {err}</p>}

                <button type="submit" className="auth-submit" disabled={submitting || !email}>
                  <span>{submitting ? 'Calculating…' : 'See my score'}</span>
                  <span className="auth-submit-arrow" aria-hidden="true">→</span>
                </button>
                <button type="button" className="fq-back" onClick={() => setStep(s => s - 1)}>← Back</button>
              </form>

              <p className="fq-fine-print">
                We don't sell your data. We don't share it with lenders unless you ask us to.
              </p>
            </div>
          )}

          {isResultStep && (
            <div className="fq-result">
              <p className="auth-eyebrow fq-eyebrow">Your snapshot</p>
              <div className="fq-score-block">
                <div className="fq-score-num">{score}</div>
                <div className="fq-score-meta">
                  <span className="fq-score-max">/ {DISPLAY_MAX}</span>
                  <span className="fq-score-mono-label">Fundability score</span>
                  <div className="fq-score-bar">
                    <div className="fq-score-bar-fill" style={{ width: `${(score / DISPLAY_MAX) * 100}%` }} />
                  </div>
                  <span className="fq-score-tier">{band.label}</span>
                </div>
              </div>

              <p className="fq-result-body">{band.body}</p>

              <div className="fq-result-cta">
                <p className="fq-result-cta-lead">
                  This is a directional snapshot from 7 questions. The full Fundability profile —
                  with 22 weighted factors, 4 vendor tiers, and 26 curated reporting accounts —
                  is what your bankers actually want to see.
                </p>
                <Link to="/register" className="auth-submit fq-result-cta-btn">
                  <span>Build the full profile</span>
                  <span className="auth-submit-arrow" aria-hidden="true">→</span>
                </Link>
                <Link to="/" className="fq-back">← Back to home</Link>
              </div>
            </div>
          )}
        </main>

        <footer className="fq-footer">
          <span className="auth-pill">Snapshot</span>
          <span>This is not a credit decision. Your real fundability requires verification with the bureaus.</span>
        </footer>
      </div>
    </div>
  );
}
