import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function AuthPage({ mode }) {
  const isLogin = mode === 'login';
  const { user, login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from ?? '/';
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to={redirectTo} replace />;

  const update = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      if (isLogin) await login(form.email, form.password);
      else await register(form.name, form.email, form.password);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  return (
    <form className="form-card" onSubmit={submit}>
      <h1>{isLogin ? 'Welcome back' : 'Create your account'}</h1>
      <p className="muted">
        {isLogin ? 'Log in to check out and track your orders.' : 'It takes less than a minute.'}
      </p>
      {!isLogin && (
        <label className="field">
          Name
          <input name="name" autoComplete="name" required value={form.name} onChange={update} />
        </label>
      )}
      <label className="field">
        Email
        <input name="email" type="email" autoComplete="email" required value={form.email} onChange={update} />
      </label>
      <label className="field">
        Password
        <input
          name="password"
          type="password"
          autoComplete={isLogin ? 'current-password' : 'new-password'}
          required
          minLength={isLogin ? undefined : 6}
          value={form.password}
          onChange={update}
        />
      </label>
      {error && <p className="alert">{error}</p>}
      <button className="btn btn-primary btn-block" disabled={busy}>
        {busy ? 'Please wait…' : isLogin ? 'Log in' : 'Sign up'}
      </button>
      <p className="muted small center">
        {isLogin ? 'New to ShopNest? ' : 'Already have an account? '}
        <Link to={isLogin ? '/register' : '/login'} state={location.state}>
          {isLogin ? 'Create an account' : 'Log in'}
        </Link>
      </p>
    </form>
  );
}
