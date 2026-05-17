// GitHub OAuth callback for Decap CMS
export const onRequest = async (context) => {
  const { request, env } = context;
  const url = new URL(request.url);
  const code = url.searchParams.get('code');

  if (!code) return new Response('Missing code', { status: 400 });

  const clientId = env.GITHUB_CLIENT_ID;
  const clientSecret = env.GITHUB_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    return new Response('OAuth not configured', { status: 500 });
  }

  try {
    const resp = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ client_id: clientId, client_secret: clientSecret, code }),
    });
    const data = await resp.json();
    const token = data.access_token;
    if (!token) return new Response(JSON.stringify(data), { status: 400 });

    return new Response(
      `<html><body><script>
        (function() {
          const auth = ${JSON.stringify({ token })};
          function msg(e) { window.opener.postMessage('authorization:github:' + auth.token + ':' + JSON.stringify(auth), e.origin); }
          window.addEventListener('message', msg, false);
          window.opener.postMessage('authorizing:github', '*');
        })();
      </script></body></html>`,
      { headers: { 'Content-Type': 'text/html;charset=utf-8' } }
    );
  } catch (err) {
    return new Response('OAuth error: ' + (err.message || ''), { status: 500 });
  }
};
