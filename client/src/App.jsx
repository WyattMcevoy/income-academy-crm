import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './auth.jsx';
import Sidebar from './components/Sidebar.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Pipeline from './pages/Pipeline.jsx';
import LeadDetail from './pages/LeadDetail.jsx';
import Clients from './pages/Clients.jsx';
import Expenses from './pages/Expenses.jsx';

function Protected({ children }) {
  const { auth } = useAuth();
  return auth ? children : <Navigate to="/login" replace />;
}

function Shell({ children }) {
  const { auth } = useAuth();
  if (!auth) return <>{children}</>;
  return (
    <div className="app-shell">
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
        <Route path="/" element={<Protected><Dashboard /></Protected>} />
        <Route path="/leads" element={<Protected><Pipeline /></Protected>} />
        <Route path="/leads/:id" element={<Protected><LeadDetail /></Protected>} />
        <Route path="/clients" element={<Protected><Clients /></Protected>} />
        <Route path="/expenses" element={<Protected><Expenses /></Protected>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Shell>
  );
}
