// GitHub OAuth callback for Decap CMS
// Handles the OAuth code exchange with GitHub

export const onRequest = async (context) => {
  const { request, env } = context;
  const url = new URL(request.url);
  const code = url.searchParams.get('code');

  if (!code) {
    return new Response('Missing code parameter', { status: 400 });
  }

  try {
    const resp = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        client_id: env.GITHUB_CLIENT_ID,
        client_secret: env.GITHUB_CLIENT_SECRET,
        code,
      }),
    });

    const data = await resp.json();
    const token = data.access_token;

    if (!token) {
      return new Response(JSON.stringify(data), { status: 400 });
    }

    // Return the token as a script that sends it back to Decap CMS via postMessage
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
      {
        headers: { 'Content-Type': 'text/html' },
      }
    );
  } catch (err) {
    return new Response('OAuth error: ' + err.message, { status: 500 });
  }
};
