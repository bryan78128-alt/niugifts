// Basic auth for /admin and /api/admin
export const onRequest = async (context) => {
  const { request, env } = context;
  const url = new URL(request.url);
  if (!url.pathname.startsWith('/admin') && !url.pathname.startsWith('/api/admin')) {
    return context.next();
  }
  const auth = request.headers.get('Authorization');
  const pass = env.ADMIN_PASSWORD || 'niugifts2026';
  const expected = 'Basic ' + btoa('admin:' + pass);
  if (!auth || auth !== expected) {
    return new Response('Unauthorized', { status: 401, headers: { 'WWW-Authenticate': 'Basic realm="NiuGifts Admin"' } });
  }
  return context.next();
};
