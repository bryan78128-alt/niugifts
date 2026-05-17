import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ url, site }) => {
  const code = url.searchParams.get('code');
  if (!code) {
    return new Response('Missing code', { status: 400 });
  }

  const clientId = import.meta.env.GITHUB_CLIENT_ID;
  const clientSecret = import.meta.env.GITHUB_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return new Response('OAuth not configured', { status: 500 });
  }

  try {
    const resp = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
      }),
    });

    const data: Record<string, string> = await resp.json();
    const token = data.access_token;

    if (!token) {
      return new Response(JSON.stringify(data), { status: 400 });
    }

    const origin = url.origin;
    return new Response(
      `<html><body><script>
        (function() {
          function receiveMessage(e) {
            window.opener.postMessage('authorization:github:${token}:${JSON.stringify({ token })}', e.origin);
          }
          window.addEventListener('message', receiveMessage, false);
          window.opener.postMessage('authorizing:github', '*');
        })();
      </script></body></html>`,
      { headers: { 'Content-Type': 'text/html' } }
    );
  } catch (err) {
    return new Response('OAuth error', { status: 500 });
  }
};
