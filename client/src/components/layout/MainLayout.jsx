import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import Preloader from '../common/Preloader';
import CartDrawer from '../cart/CartDrawer';

export default function MainLayout() {
  const location = useLocation();

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [location.pathname]);

  return (
    <>
      <Preloader />
      <CartDrawer />
      <Header />
      <main>
        <Outlet />
      </main>
      <Footer />
    </>
  );
}