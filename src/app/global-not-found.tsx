import './globals.css';
import type { Metadata } from 'next';
import { plovdiv } from '@/styles/fonts';
import { buttonVariants } from '@/components/ui/button';
import { H1, Lead, Overline } from '@/components/ui/typography';
import { routing } from '@/i18n/routing';
export const metadata: Metadata = {
  title: '404 | Evento',
  description: 'Страницата не е намерена.'
};

export default function GlobalNotFound() {
  return (
    <html lang={routing.defaultLocale}>
      <body
        className={`${plovdiv.display.variable} ${plovdiv.sans.variable} antialiased`}
      >
        <main className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center gap-6 px-6 text-center font-sans">
          <Overline>404</Overline>
          <H1>Страницата не е намерена</H1>
          <Lead>
            Изглежда, че адресът е грешен или страницата вече не съществува.
          </Lead>
          <a href={`/${routing.defaultLocale}`} className={buttonVariants()}>
            Към началото
          </a>
        </main>
      </body>
    </html>
  );
}
