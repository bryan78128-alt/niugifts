import type { APIRoute } from 'astro';

export const prerender = false;

export const GET: APIRoute = async ({ url, request }) => {
  const code = url.searchParams.get('code');
  if (!code) {
    return new Response('Missing code', { status: 400 });
  }

  // @ts-ignore - Cloudflare runtime env
  const clientId = import.meta.env?.GITHUB_CLIENT_ID || (typeof process !== 'undefined' && process.env?.GITHUB_CLIENT_ID);
  // @ts-ignore
  const clientSecret = import.meta.env?.GITHUB_CLIENT_SECRET || (typeof process !== 'undefined' && process.env?.GITHUB_CLIENT_SECRET);

  if (!clientId || !clientSecret) {
    return new Response('OAuth not configured on server. Add GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET to Pages environment variables.', { status: 500 });
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

    const data = await resp.json() as Record<string, string>;
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
    return new Response('OAuth error: ' + (err instanceof Error ? err.message : String(err)), { status: 500 });
  }
};
