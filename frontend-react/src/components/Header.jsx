import { useAuth } from '../AuthContext';
import { useToast } from '../ToastContext';

export default function Header({ view, setView, onLoginClick }) {
  const { user, logout } = useAuth();
  const toast = useToast();

  const handleLogout = () => {
    logout();
    setView('blog');
    toast('Signed out.');
  };

  return (
    <header className="header">
      <div className="logo" onClick={() => setView('blog')} style={{ cursor: 'pointer' }}>
        Ink<span>well</span>
      </div>
      <nav className="nav-actions">
        {user && <span className="user-badge"><strong>{user.username}</strong></span>}
        <button className="btn btn-ghost" onClick={() => setView('blog')}>Blog</button>
        {user && <button className="btn btn-ghost" onClick={() => setView('dashboard')}>Dashboard</button>}
        {user
          ? <button className="btn btn-ghost" onClick={handleLogout}>Sign Out</button>
          : <button className="btn btn-primary" onClick={onLoginClick}>Sign In</button>
        }
      </nav>
    </header>
  );
}
