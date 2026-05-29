import { useEffect } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { useAuth } from './auth.jsx';
import { useBrand, BRANDS } from './brand.js';

// Public marketing pages that should never render the auth'd app shell.
const PUBLIC_FULLSCREEN_PATHS = ['/login', '/register', '/fundability-score', '/credit-builder/sso', '/credit-workshop'];
import Sidebar from './components/Sidebar.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Pipeline from './pages/Pipeline.jsx';
import LeadDetail from './pages/LeadDetail.jsx';
import Clients from './pages/Clients.jsx';
import Expenses from './pages/Expenses.jsx';
import CreditBuilder from './pages/credit-builder/CreditBuilder.jsx';
import Admin from './pages/Admin.jsx';
import FundabilityQuiz from './pages/FundabilityQuiz.jsx';
import SsoLanding from './pages/SsoLanding.jsx';
import CreditWorkshopLanding from './pages/CreditWorkshopLanding.jsx';

function Protected({ children }) {
  const { auth } = useAuth();
  return auth ? children : <Navigate to="/login" replace />;
}

// Hostname-aware root. See brand.js — thecreditworkshop.biz serves the
// public landing at /; dashboard.incomeacademy.biz serves the dashboard.
function RootRoute() {
  const brand = useBrand();
  if (brand.id === 'credit-workshop') return <CreditWorkshopLanding />;
  return <Protected><Dashboard /></Protected>;
}

function Shell({ children }) {
  const { auth } = useAuth();
  const location = useLocation();
  const brand = useBrand();
  // Keep the browser tab title aligned with the active brand.
  useEffect(() => { document.title = brand.titleSuffix; }, [brand]);
  const isPublicFullscreen = PUBLIC_FULLSCREEN_PATHS.some(p =>
    location.pathname === p || location.pathname.startsWith(p + '/')
  );
  if (!auth || isPublicFullscreen) return <>{children}</>;
  return (
    <div className="app-shell" data-brand={brand.id}>
      <Sidebar />
      <main className="app-main">{children}</main>
    </div>
  );
}

export default function App() {
  return (
    <Shell>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/fundability-score" element={<FundabilityQuiz />} />
        <Route path="/credit-workshop" element={<CreditWorkshopLanding />} />
        {/* SSO must be declared BEFORE the /credit-builder/* catch-all */}
        <Route path="/credit-builder/sso" element={<SsoLanding />} />
        <Route path="/" element={<RootRoute />} />
        <Route path="/leads" element={<Protected><Pipeline /></Protected>} />
        <Route path="/leads/:id" element={<Protected><LeadDetail /></Protected>} />
        <Route path="/clients" element={<Protected><Clients /></Protected>} />
        <Route path="/credit-builder/*" element={<Protected><CreditBuilder /></Protected>} />
        <Route path="/expenses" element={<Protected><Expenses /></Protected>} />
        <Route path="/admin" element={<Protected><Admin /></Protected>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Shell>
  );
}
