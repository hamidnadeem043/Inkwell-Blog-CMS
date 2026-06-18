import { useState } from 'react';
import { useAuth } from '../AuthContext';
import { useToast } from '../ToastContext';

export default function AuthModal({ onClose }) {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();
  const toast = useToast();

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const submit = async () => {
    setError('');
    setLoading(true);
    try {
      if (mode === 'login') {
        const u = await login(form.email, form.password);
        toast(`Welcome back, ${u.username}!`);
      } else {
        const u = await register(form.username, form.email, form.password);
        toast(`Account created! Welcome, ${u.username}!`);
      }
      onClose();
    } catch (e) {
      setError(e.response?.data?.error || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="auth-card">
        {mode === 'login' ? (
          <>
            <h2>Welcome back</h2>
            <p className="sub">No account? <button className="link-btn" onClick={() => { setMode('register'); setError(''); }}>Create one free</button></p>
          </>
        ) : (
          <>
            <h2>Create account</h2>
            <p className="sub">Have one? <button className="link-btn" onClick={() => { setMode('login'); setError(''); }}>Sign in</button></p>
          </>
        )}

        {error && <div className="error-msg">{error}</div>}

        {mode === 'register' && (
          <div className="form-group">
            <label>Username</label>
            <input value={form.username} onChange={set('username')} placeholder="yourname" />
          </div>
        )}
        <div className="form-group">
          <label>Email</label>
          <input type="email" value={form.email} onChange={set('email')} placeholder="you@example.com" />
        </div>
        <div className="form-group">
          <label>Password</label>
          <input type="password" value={form.password} onChange={set('password')} placeholder="••••••••"
            onKeyDown={e => e.key === 'Enter' && submit()} />
        </div>

        <button className="btn btn-primary btn-full" onClick={submit} disabled={loading}>
          {loading ? 'Please wait…' : mode === 'login' ? 'Sign In' : 'Create Account'}
        </button>
        {mode === 'login' && <p className="demo-hint">Demo: demo@blog.com / password123</p>}
      </div>
    </div>
  );
}
