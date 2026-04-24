// Vercel Edge Middleware — gates ai.incomeacademy.biz and affiliate.incomeacademy.biz
// behind basic auth AND rewrites root path to the appropriate product landing page.
// Main domain (incomeacademy.biz) is unaffected.
//
// Password is set via Vercel env var MARKETING_PREVIEW_PASSWORD.
// Username field in the browser prompt is ignored; only the password is checked.

export const config = {
  matcher: '/:path*',
};

export default function middleware(request) {
  const host = (request.headers.get('host') || '').toLowerCase();
  const url = new URL(request.url);

  const isAiSubdomain = host.startsWith('ai.');
  const isAffiliateSubdomain = host.startsWith('affiliate.');
  const isPreviewSubdomain = isAiSubdomain || isAffiliateSubdomain;

  if (!isPreviewSubdomain) {
    return;
  }

  const expectedPassword = process.env.MARKETING_PREVIEW_PASSWORD;
  const authHeader = request.headers.get('authorization') || '';

  const unauthorized = (label) => {
    console.log(`[preview-auth] ${host} ${label} deny`);
    return new Response('Authentication required', {
      status: 401,
      headers: {
        'WWW-Authenticate': 'Basic realm="Income Academy Preview"',
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-store',
      },
    });
  };

  if (!expectedPassword) return unauthorized('env-missing');
  if (!authHeader.startsWith('Basic ')) return unauthorized('no-header');

  let submittedPassword;
  try {
    const decoded = atob(authHeader.slice(6));
    submittedPassword = decoded.split(':').slice(1).join(':');
  } catch {
    return unauthorized('malformed');
  }

  if (submittedPassword !== expectedPassword) {
    return unauthorized('wrong-password');
  }

  // Auth passed. Rewrite root path to the appropriate product page.
  // /styles.css, /favicon.svg, /checkout, /ai/img/* etc. pass through unchanged.
  const isRoot = url.pathname === '/' || url.pathname === '';
  const alreadyProductPath =
    url.pathname.startsWith('/ai/') || url.pathname.startsWith('/affiliate/');

  if (isRoot && !alreadyProductPath) {
    const destinationPath = isAiSubdomain ? '/ai' : '/affiliate';
    const rewriteUrl = new URL(destinationPath, url.origin);
    console.log(`[preview-auth] ${host} allow -> ${destinationPath}`);
    return new Response(null, {
      headers: {
        'x-middleware-rewrite': rewriteUrl.toString(),
      },
    });
  }

  console.log(`[preview-auth] ${host} allow (passthrough ${url.pathname})`);
}
