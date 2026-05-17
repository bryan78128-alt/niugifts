// GitHub API proxy for admin CRUD
// GET  /api/data?path=...  → read file
// PUT  /api/data?path=...  → save file (body: { content: "..." })
// POST /api/data/upload    → upload image (multipart)

export const onRequest = async (context) => {
  const { request, env } = context;
  const url = new URL(request.url);
  const path = url.searchParams.get('path');
  const token = env.GITHUB_PAT;
  const repo = 'bryan78128-alt/niugifts';
  const branch = 'main';
  const gh = (p, method = 'GET', body = undefined) =>
    fetch(`https://api.github.com/repos/${repo}/contents/${p}?ref=${branch}`, {
      method,
      headers: { Authorization: `Bearer ${token}`, 'User-Agent': 'niugifts', 'Content-Type': 'application/json', Accept: 'application/vnd.github.v3+json' },
      body: body ? JSON.stringify(body) : undefined,
    });

  if (!token) return new Response(JSON.stringify({ error: 'GITHUB_PAT not set' }), { status: 500, headers: { 'content-type': 'application/json' } });

  // Upload image
  if (url.pathname.endsWith('/upload') && request.method === 'POST') {
    const form = await request.formData();
    const file = form.get('file');
    const name = form.get('name') || file.name;
    const buffer = await file.arrayBuffer();
    const content = btoa(String.fromCharCode(...new Uint8Array(buffer)));
    const mediaPath = `public/images/products/${name}`;
    try {
      const existing = await gh(mediaPath);
      const sha = existing.ok ? (await existing.json()).sha : undefined;
      const res = await gh(mediaPath, 'PUT', { message: `Upload ${name}`, content, sha, branch });
      if (res.ok) return new Response(JSON.stringify({ url: `/images/products/${name}` }), { headers: { 'content-type': 'application/json' } });
      const err = await res.json();
      return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { 'content-type': 'application/json' } });
    } catch (e) {
      return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { 'content-type': 'application/json' } });
    }
  }

  // Read file
  if (request.method === 'GET' && path) {
    try {
      const res = await gh(path);
      if (!res.ok) return new Response('', { status: 200 });
      const data = await res.json();
      const text = data.content ? atob(data.content.replace(/\n/g, '')) : '';
      return new Response(text, { headers: { 'content-type': 'text/plain;charset=utf-8' } });
    } catch { return new Response('', { status: 200 }); }
  }

  // Save file
  if (request.method === 'PUT' && path) {
    try {
      const { content } = await request.json();
      const encoded = btoa(unescape(encodeURIComponent(content)));
      const existing = await gh(path);
      const sha = existing.ok ? (await existing.json()).sha : undefined;
      const res = await gh(path, 'PUT', { message: `Update ${path}`, content: encoded, sha, branch });
      if (res.ok) return new Response(JSON.stringify({ ok: true }), { headers: { 'content-type': 'application/json' } });
      const err = await res.json();
      return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { 'content-type': 'application/json' } });
    } catch (e) {
      return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { 'content-type': 'application/json' } });
    }
  }

  return new Response('Not found', { status: 404 });
};
