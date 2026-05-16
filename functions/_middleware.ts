// Cloudflare Pages Function Middleware
// Protects /admin with HTTP Basic Auth
// Username: admin  |  Password: from env ADMIN_PASSWORD or "niugifts2026"

export const onRequest = async (context) => {
  const { request } = context;
  const url = new URL(request.url);

  // Only protect /admin routes
  if (!url.pathname.startsWith('/admin') && !url.pathname.startsWith('/api/admin')) {
    return context.next();
  }

  const auth = request.headers.get('Authorization');
  const expectedUser = 'admin';
  const expectedPass = context.env.ADMIN_PASSWORD || 'niugifts2026';
  const expected = 'Basic ' + btoa(`${expectedUser}:${expectedPass}`);

  if (!auth || auth !== expected) {
    return new Response('Unauthorized', {
      status: 401,
      headers: { 'WWW-Authenticate': 'Basic realm="NiuGifts Admin Login"' },
    });
  }

  return context.next();
};
