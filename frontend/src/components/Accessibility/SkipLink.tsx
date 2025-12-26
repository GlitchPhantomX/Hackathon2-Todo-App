'use client';

import React from 'react';

export const SkipLink = () => {
  const handleSkip = () => {
    const mainContent = document.getElementById('main-content');
    if (mainContent) {
      mainContent.focus();
      mainContent.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:p-4 focus:bg-white focus:text-black focus:rounded focus:border-2 focus:border-blue-500 focus:font-semibold"
      onClick={handleSkip}
    >
      Skip to main content
    </a>
  );
};