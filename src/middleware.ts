import createMiddleware from 'next-intl/middleware';
import {routing} from './lib/i18n/routing';

export default createMiddleware(routing);

export const config = {
  // Match all paths except api routes, static files, and Next.js internals
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
