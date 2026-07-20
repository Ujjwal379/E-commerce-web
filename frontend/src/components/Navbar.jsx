import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiSearch, FiShoppingCart, FiHeart, FiUser, FiMenu, FiX, FiLogOut, FiGrid } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const { itemCount } = useCart();
  const [query, setQuery] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/products?keyword=${encodeURIComponent(query)}`);
    setMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-sm">
      <div className="container-x flex items-center gap-4 h-16">
        <button className="md:hidden" onClick={() => setMenuOpen((o) => !o)} aria-label="Toggle menu">
          {menuOpen ? <FiX size={22} /> : <FiMenu size={22} />}
        </button>

        <Link to="/" className="text-2xl font-extrabold text-brand-600 shrink-0">
          Shop<span className="text-gray-900">Ease</span>
        </Link>

        <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-xl">
          <div className="relative w-full">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              type="text"
              placeholder="Search for products, brands and more..."
              className="input pr-10"
            />
            <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
              <FiSearch size={18} />
            </button>
          </div>
        </form>

        <nav className="hidden md:flex items-center gap-6 ml-auto">
          <Link to="/products" className="text-sm font-medium text-gray-700 hover:text-brand-600">
            Shop
          </Link>
          <Link to="/contact" className="text-sm font-medium text-gray-700 hover:text-brand-600">
            Contact
          </Link>
          <Link to="/wishlist" className="text-gray-700 hover:text-brand-600" aria-label="Wishlist">
            <FiHeart size={20} />
          </Link>
          <Link to="/cart" className="relative text-gray-700 hover:text-brand-600" aria-label="Cart">
            <FiShoppingCart size={20} />
            {itemCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-brand-600 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
                {itemCount}
              </span>
            )}
          </Link>

          <div className="relative">
            <button
              onClick={() => setUserMenuOpen((o) => !o)}
              className="flex items-center gap-1 text-gray-700 hover:text-brand-600"
            >
              <FiUser size={20} />
            </button>
            {userMenuOpen && (
              <div
                onMouseLeave={() => setUserMenuOpen(false)}
                className="absolute right-0 mt-2 w-48 card p-2 text-sm"
              >
                {user ? (
                  <>
                    <p className="px-3 py-2 text-gray-500 truncate">Hi, {user.name}</p>
                    <Link to="/profile" className="block px-3 py-2 rounded-lg hover:bg-gray-100">
                      My Profile
                    </Link>
                    <Link to="/orders" className="block px-3 py-2 rounded-lg hover:bg-gray-100">
                      My Orders
                    </Link>
                    {isAdmin && (
                      <Link to="/admin" className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100">
                        <FiGrid /> Admin Dashboard
                      </Link>
                    )}
                    <button
                      onClick={logout}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 text-red-600"
                    >
                      <FiLogOut /> Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link to="/login" className="block px-3 py-2 rounded-lg hover:bg-gray-100">
                      Login
                    </Link>
                    <Link to="/register" className="block px-3 py-2 rounded-lg hover:bg-gray-100">
                      Register
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>
        </nav>
      </div>

      {menuOpen && (
        <div className="md:hidden border-t border-gray-100 p-4 space-y-3">
          <form onSubmit={handleSearch}>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              type="text"
              placeholder="Search products..."
              className="input"
            />
          </form>
          <Link onClick={() => setMenuOpen(false)} to="/products" className="block py-1">
            Shop
          </Link>
          <Link onClick={() => setMenuOpen(false)} to="/cart" className="block py-1">
            Cart ({itemCount})
          </Link>
          <Link onClick={() => setMenuOpen(false)} to="/wishlist" className="block py-1">
            Wishlist
          </Link>
          <Link onClick={() => setMenuOpen(false)} to="/contact" className="block py-1">
            Contact
          </Link>
          {user ? (
            <>
              <Link onClick={() => setMenuOpen(false)} to="/profile" className="block py-1">
                My Profile
              </Link>
              <Link onClick={() => setMenuOpen(false)} to="/orders" className="block py-1">
                My Orders
              </Link>
              {isAdmin && (
                <Link onClick={() => setMenuOpen(false)} to="/admin" className="block py-1">
                  Admin Dashboard
                </Link>
              )}
              <button onClick={logout} className="block py-1 text-red-600">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link onClick={() => setMenuOpen(false)} to="/login" className="block py-1">
                Login
              </Link>
              <Link onClick={() => setMenuOpen(false)} to="/register" className="block py-1">
                Register
              </Link>
            </>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
