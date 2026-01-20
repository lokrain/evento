import './globals.css'; 
import type { ReactNode } from 'react';
import { ThemeProvider } from '@/components/ui/theme-provider';

export const metadata = {
  title: 'Evento | Корпоративни музикални резервации',
  description: 'Премиум корпоративни музикални резервации с ескроу, договори и курирани таланти.'
};

const themeScript = `(function(){try{var c=localStorage.getItem('therapy-theme-color')||'sage',m=localStorage.getItem('therapy-theme-mode')||'system',r=m==='system'?window.matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light':m;document.documentElement.classList.add(r);document.documentElement.setAttribute('data-theme',c)}catch(e){}})();`

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html
      lang="bg"
      className="light"
      data-theme="sage"
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body
        className="antialiased"
      >
        <a href="#main-content" className="skip-link">
          Skip to content
        </a>
        <ThemeProvider defaultColor="sage" defaultMode="system">{children}</ThemeProvider>
      </body>
    </html>
  );
}