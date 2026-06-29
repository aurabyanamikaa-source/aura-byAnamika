import React, { useEffect, useRef } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import Sidebar from './Sidebar';
import Preloader from '../common/Preloader';
import CartDrawer from '../cart/CartDrawer';

export default function MainLayout() {
  const location = useLocation();
  const sidebarRef = useRef(null);
  const overlayRef = useRef(null);

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [location.pathname]);

  const openSidebar = () => {
    sidebarRef.current?.classList.add('active');
    overlayRef.current?.classList.add('active');
    document.body.style.overflow = 'hidden';
  };

  const closeSidebar = () => {
    sidebarRef.current?.classList.remove('active');
    overlayRef.current?.classList.remove('active');
    document.body.style.overflow = '';
  };

  return (
    <>
      <Preloader />
      <div
        ref={overlayRef}
        className="sidebar-overlay"
        onClick={closeSidebar}
      />
      <Sidebar ref={sidebarRef} onClose={closeSidebar} />
      <CartDrawer />
      <Header onOpenSidebar={openSidebar} />
      <main>
        <Outlet />
      </main>
      <Footer />
    </>
  );
}
