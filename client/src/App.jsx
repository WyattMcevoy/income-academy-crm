import { Navigate, Route, Routes, Link, useNavigate } from 'react-router-dom';
import { useAuth } from './auth.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Pipeline from './pages/Pipeline.jsx';
import LeadDetail from './pages/LeadDetail.jsx';
import Expenses from './pages/Expenses.jsx';

function Protected({ children }) {
  const { auth } = useAuth();
  return auth ? children : <Navigate to="/login" replace />;
}

function Nav() {
  const { auth, logout } = useAuth();
  const nav = useNavigate();
  if (!auth) return null;
  return (
    <nav className="nav">
      <div className="nav-left">
        <Link to="/">Pipeline</Link>
        <Link to="/expenses">Expenses</Link>
      </div>
      <div className="nav-right">
        <span>{auth.user.email}</span>
        <button onClick={() => { logout(); nav('/login'); }}>Log out</button>
      </div>
    </nav>
  );
}

export default function App() {
  return (
    <>
      <Nav />
      <main className="main">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<Protected><Pipeline /></Protected>} />
          <Route path="/leads/:id" element={<Protected><LeadDetail /></Protected>} />
          <Route path="/expenses" element={<Protected><Expenses /></Protected>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </>
  );
}
