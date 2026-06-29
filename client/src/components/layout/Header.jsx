import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Splide, SplideSlide } from '@splidejs/react-splide';
import { AutoScroll } from '@splidejs/splide-extension-auto-scroll';
import '@splidejs/splide/dist/css/splide.min.css';
import { selectCartCount } from '../../store/slices/cartSlice';
import { selectWishlistCount } from '../../store/slices/wishlistSlice';
import { selectSettings } from '../../store/slices/settingsSlice';
import { logoutUser } from '../../store/slices/authSlice';
import api from '../../services/api';

export default function Header({ onOpenSidebar }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useSelector(s => s.auth);
  const cartCount = useSelector(selectCartCount);
  const wishCount = useSelector(selectWishlistCount);
  const settings = useSelector(selectSettings);
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('');
  const [categories, setCategories] = useState([]);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    api.get('/categories').then(r => setCategories(r.data.data)).catch(() => {});
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (selectedCat) params.set('category', selectedCat);
    navigate(`/shop?${params.toString()}`);
    setSearchOpen(false);
    setSearch('');
  };

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate('/');
  };

  const announcementText = settings.announcement_text || '🌟 Free shipping on orders over $100!';

  return (
    <header className="ul-header">
      {/* ── HEADER TOP: Announcement ticker ─────────────────── */}
      <div className="ul-header-top">
        <div className="ul-container">
          <Splide
            className="ul-header-top-slider"
            options={{
              type: 'loop',
              autoScroll: { speed: 1 },
              arrows: false,
              pagination: false,
              drag: false,
              perPage: 3,
              gap: '80px',
              breakpoints: { 767: { perPage: 1 }, 991: { perPage: 2 } },
            }}
            extensions={{ AutoScroll }}
          >
            {Array(8).fill(announcementText).map((text, i) => (
              <SplideSlide key={i}>
                <p className="ul-header-top-slider-item">
                  <i className="bi bi-stars"></i> {text}
                </p>
              </SplideSlide>
            ))}
          </Splide>
        </div>
      </div>

      {/* ── HEADER BOTTOM ──────────────────────────────────── */}
      <div className="ul-header-bottom">
        <div className="ul-container">
          <div className="ul-header-bottom-wrapper">

            {/* Logo + Search */}
            <div className="header-bottom-left">
              <div className="logo-container">
                <Link to="/" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}>
                  <img
                    src={settings.logo || '/assets/img/logo.png'}
                    alt={settings.store_name || 'Aura by Anamika'}
                    style={{ height: 'clamp(70px, 7vw, 100px)', width: 'auto', display: 'block' }}
                  />
                </Link>
              </div>

              {/* Desktop search form */}
              <div className="ul-header-search-form-wrapper flex-grow-1 flex-shrink-0 d-none d-xxl-flex">
                <form className="ul-header-search-form" onSubmit={handleSearch}>
                  <div style={{ borderRight: '1px solid rgba(0,0,0,0.12)', display: 'flex', alignItems: 'center', padding: '0 16px', flexShrink: 0 }}>
                    <select
                      value={selectedCat}
                      onChange={e => setSelectedCat(e.target.value)}
                      style={{ border: 'none', background: 'transparent', fontSize: '14px', cursor: 'pointer', minWidth: 130, outline: 'none', height: '100%' }}
                    >
                      <option value="">All Categories</option>
                      {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div className="ul-header-search-form-right">
                    <input
                      type="search"
                      placeholder="Search Here"
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                    />
                    <button type="submit">
                      <span className="icon"><i className="bi bi-search"></i></span>
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* ── NAV — matches original exactly ─────────── */}
            <div className="ul-header-nav-wrapper d-none d-lg-flex">
              <nav className="ul-header-nav">
                <Link to="/">Home</Link>
                <Link to="/shop">Shop</Link>

                {/* Women's — category link */}
                <Link to="/shop?category=womens-fashion">Women</Link>

                {/* Men's — category link */}
                <Link to="/shop?category=mens-fashion">Men's</Link>

                {/* Kids/New Arrivals */}
                <Link to="/shop?newArrival=true">New</Link>

                <Link to="/blog">Blog</Link>

                {/* Pages mega menu */}
                <div className="has-sub-menu has-mega-menu">
                  <a role="button" style={{ cursor: 'pointer' }}>Pages</a>
                  <div className="ul-header-submenu ul-header-megamenu">

                    <div className="single-col">
                      <span className="single-col-title">Inner Pages</span>
                      <ul>
                        <li><Link to="/about">About</Link></li>
                        <li><Link to="/blog">Blogs</Link></li>
                        <li><Link to="/contact">Contact</Link></li>
                        <li><Link to="/faq">FAQ</Link></li>
                        <li><Link to="/login">Log In</Link></li>
                        <li><Link to="/signup">Sign Up</Link></li>
                      </ul>
                    </div>

                    <div className="single-col">
                      <span className="single-col-title">Shop Pages</span>
                      <ul>
                        <li><Link to="/shop">Shop</Link></li>
                        <li><Link to="/shop?newArrival=true">New Arrivals</Link></li>
                        <li><Link to="/shop?bestSeller=true">Best Sellers</Link></li>
                        <li><Link to="/shop?onSale=true">Sale Items</Link></li>
                        <li><Link to="/wishlist">Wishlist</Link></li>
                        <li><Link to="/cart">Cart</Link></li>
                        <li><Link to="/checkout">Checkout</Link></li>
                      </ul>
                    </div>

                    <div className="single-col">
                      <span className="single-col-title">Women's</span>
                      <ul>
                        <li><Link to="/shop?category=womens-fashion">Clothing</Link></li>
                        <li><Link to="/shop?category=footwear">Footwear</Link></li>
                        <li><Link to="/shop?category=bags">Bags</Link></li>
                        <li><Link to="/shop?category=accessories">Accessories</Link></li>
                        <li><Link to="/shop?category=jewelry">Jewelry</Link></li>
                      </ul>
                    </div>

                    <div className="single-col">
                      <span className="single-col-title">Men's</span>
                      <ul>
                        <li><Link to="/shop?category=mens-fashion">Clothing</Link></li>
                        <li><Link to="/shop?category=footwear">Footwear</Link></li>
                        <li><Link to="/shop?category=accessories">Accessories</Link></li>
                        <li><Link to="/shop?category=sportswear">Sportswear</Link></li>
                      </ul>
                    </div>

                  </div>
                </div>

              </nav>
            </div>

            {/* ── ACTION ICONS ────────────────────────────── */}
            <div className="ul-header-actions">
              {/* Mobile search toggle */}
              <button className="d-xxl-none" onClick={() => setSearchOpen(true)} title="Search">
                <i className="bi bi-search"></i>
              </button>

              {/* Account */}
              {isAuthenticated ? (
                <div className="has-sub-menu" style={{ position: 'relative' }}>
                  <button title="My Account">
                    <i className="bi bi-person"></i>
                  </button>
                  <div className="ul-header-submenu" style={{ right: 0, left: 'auto', minWidth: 180 }}>
                    <ul>
                      <li><Link to="/account">My Account</Link></li>
                      <li><Link to="/account/orders">My Orders</Link></li>
                      <li><Link to="/wishlist">Wishlist</Link></li>
                      <li>
                        <button
                          onClick={handleLogout}
                          style={{ width: '100%', textAlign: 'left', padding: '8px 20px', color: '#EF2853', background: 'none', border: 'none', cursor: 'pointer', fontSize: 14 }}
                        >
                          Logout
                        </button>
                      </li>
                    </ul>
                  </div>
                </div>
              ) : (
                <Link to="/login" title="Login">
                  <i className="bi bi-person"></i>
                </Link>
              )}

              {/* Wishlist */}
              <div style={{ position: 'relative', display: 'inline-flex' }}>
                <Link to="/wishlist" title="Wishlist">
                  <i className="bi bi-heart"></i>
                </Link>
                {wishCount > 0 && (
                  <span className="cart-badge">{wishCount}</span>
                )}
              </div>

              {/* Cart */}
              <div style={{ position: 'relative', display: 'inline-flex' }}>
                <Link to="/cart" title="Cart">
                  <i className="bi bi-bag"></i>
                </Link>
                {cartCount > 0 && (
                  <span className="cart-badge">{cartCount}</span>
                )}
              </div>

              {/* Sidebar / Hamburger */}
              <button className="ul-header-sidebar-opener" onClick={onOpenSidebar} title="Menu">
                <i className="bi bi-list"></i>
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* ── MOBILE SEARCH OVERLAY ──────────────────────────── */}
      {searchOpen && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
          onClick={e => { if (e.target === e.currentTarget) setSearchOpen(false); }}
        >
          <div style={{ width: '100%', maxWidth: 560 }}>
            <form
              className="ul-header-search-form"
              style={{ background: '#fff', borderRadius: 999 }}
              onSubmit={handleSearch}
            >
              <div style={{ padding: '0 16px', borderRight: '1px solid rgba(0,0,0,0.12)', display: 'flex', alignItems: 'center' }}>
                <select
                  value={selectedCat}
                  onChange={e => setSelectedCat(e.target.value)}
                  style={{ border: 'none', background: 'transparent', fontSize: 14, outline: 'none', padding: '12px 0' }}
                >
                  <option value="">All Categories</option>
                  {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
              </div>
              <div className="ul-header-search-form-right">
                <input autoFocus type="search" placeholder="Search Here" value={search} onChange={e => setSearch(e.target.value)} />
                <button type="submit"><i className="bi bi-search"></i></button>
              </div>
            </form>
            <button
              onClick={() => setSearchOpen(false)}
              style={{ display: 'block', margin: '20px auto 0', background: 'none', border: '2px solid rgba(255,255,255,0.4)', borderRadius: '50%', width: 44, height: 44, color: '#fff', fontSize: 20, cursor: 'pointer' }}
            >
              ×
            </button>
          </div>
        </div>
      )}
    </header>
  );
}