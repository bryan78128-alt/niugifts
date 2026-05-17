// GitHub proxy for admin editor
// GET  ?path=file.md  → read file
// PUT  ?path=file.md  → save file (body: { content: "..." })

export const onRequest = async (context) => {
  const { request, env } = context;
  const url = new URL(request.url);
  const path = url.searchParams.get('path');
  const token = env.GITHUB_PAT;
  const repo = 'bryan78128-alt/niugifts';
  const branch = 'main';

  if (!token) {
    return new Response(JSON.stringify({ error: 'GITHUB_PAT not set in env' }), {
      status: 500, headers: { 'Content-Type': 'application/json' }
    });
  }

  if (request.method === 'GET' && path) {
    const resp = await fetch(`https://api.github.com/repos/${repo}/contents/${path}?ref=${branch}`, {
      headers: { Authorization: `Bearer ${token}`, 'User-Agent': 'niugifts' }
    });
    if (!resp.ok) return new Response('Not found', { status: 404 });
    const data = await resp.json();
    const text = data.content ? atob(data.content.replace(/\n/g, '')) : '';
    return new Response(text, { headers: { 'Content-Type': 'text/plain;charset=utf-8' } });
  }

  if (request.method === 'PUT' && path) {
    const { content } = await request.json();
    const encoded = btoa(unescape(encodeURIComponent(content)));

    // Get SHA if file exists
    const existing = await fetch(`https://api.github.com/repos/${repo}/contents/${path}?ref=${branch}`, {
      headers: { Authorization: `Bearer ${token}`, 'User-Agent': 'niugifts' }
    });
    const sha = existing.ok ? (await existing.json()).sha : undefined;

    // Commit
    const res = await fetch(`https://api.github.com/repos/${repo}/contents/${path}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', 'User-Agent': 'niugifts' },
      body: JSON.stringify({ message: `Update ${path}`, content: encoded, sha, branch }),
    });

    if (res.ok) return new Response(JSON.stringify({ ok: true }), { headers: { 'Content-Type': 'application/json' } });
    const err = await res.json();
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }

  return new Response('Use GET ?path= or PUT ?path=', { status: 400 });
};
