import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { count } = useCart();
  const navigate = useNavigate();

  return (
    <header className="navbar">
      <div className="container nav-inner">
        <Link to="/" className="brand">
          🛍️ Shop<span>Nest</span>
        </Link>
        <nav className="nav-links">
          <NavLink to="/">Shop</NavLink>
          {user && <NavLink to="/orders">My Orders</NavLink>}
          {user?.isAdmin && <NavLink to="/admin">Admin</NavLink>}
          <NavLink to="/cart">
            Cart{count > 0 && <span className="badge">{count}</span>}
          </NavLink>
          {user ? (
            <>
              <span className="hello">Hi, {user.name.split(' ')[0]}</span>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => {
                  logout();
                  navigate('/');
                }}
              >
                Log out
              </button>
            </>
          ) : (
            <Link to="/login" className="btn btn-primary btn-sm">
              Log in
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
