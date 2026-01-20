import {NextRequest, NextResponse} from 'next/server';
import createMiddleware from 'next-intl/middleware';
import {routing} from './i18n/routing'; // locales: ['bg','en'], defaultLocale: 'bg'

const intl = createMiddleware(routing);

export default function proxy(req: NextRequest) {
  const {pathname} = req.nextUrl;        // e.g., /bgj/kk
  const [, first] = pathname.split('/'); // 'bgj'

  if (first && !routing.locales.includes(first as typeof routing.locales[number])) {
    const url = new URL(req.url);
    url.pathname = `/${routing.defaultLocale}${pathname}`;
    return NextResponse.redirect(url);
  }
  return intl(req);
}

export const config = {
  matcher: ['/((?!api|trpc|_next|_vercel|.*\\..*).*)']
};