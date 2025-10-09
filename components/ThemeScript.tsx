'use client';

import Script from 'next/script';

export default function ThemeScript() {
  return (
    <Script id="theme-init" strategy="beforeInteractive">
      {`
        (function() {
          var theme = localStorage.getItem('theme');
          if (!theme) {
            theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
          }
          document.documentElement.setAttribute('data-theme', theme);
        })();
      `}
    </Script>
  );
}

