import React, { useEffect, useState } from 'react';

export default function Preloader() {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setHidden(true), 1200);
    return () => clearTimeout(timer);
  }, []);

  if (hidden) return null;

  return (
    <div
      className="preloader"
      style={{ opacity: hidden ? 0 : 1, pointerEvents: hidden ? 'none' : 'all', transition: '0.5s ease' }}
    >
      <div className="loader"></div>
    </div>
  );
}
