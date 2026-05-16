// Decap CMS backend proxy — uses GitHub PAT directly, no OAuth needed
// Connects to local decap-server in dev, or GitHub API in production

import type { PagesFunction } from '@cloudflare/workers-types';

interface Env {
  GITHUB_PAT: string;
}

async function githubRequest(path: string, method: string, body?: string, env?: Env) {
  const token = env?.GITHUB_PAT;
  if (!token) {
    return new Response(JSON.stringify({ error: 'GITHUB_PAT not configured' }), { status: 500 });
  }

  const resp = await fetch(`https://api.github.com${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'niugifts-admin',
      'Content-Type': 'application/json',
    },
    body,
  });
  return resp;
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  const url = new URL(request.url);
  const path = url.pathname.replace('/api/cms/', '');
  const repo = 'bryan78128-alt/niugifts';
  const branch = 'main';
  const [resource, ...rest] = path.split('/');

  // ── Proxy to local decap-server in dev ──
  if (request.headers.get('host')?.includes('localhost') || request.headers.get('host')?.includes('127.0.0.1')) {
    const devUrl = `http://localhost:8081/api/v1/${path}`;
    const resp = await fetch(devUrl, {
      method: request.method,
      headers: { 'Content-Type': 'application/json' },
      body: request.method !== 'GET' ? await request.text() : undefined,
    });
    return new Response(await resp.text(), { status: resp.status, headers: { 'Content-Type': 'application/json' } });
  }

  // ── Production: commit to GitHub ──
  if (resource === 'entries' && request.method === 'PUT') {
    // Save file to GitHub: PUT /repos/{owner}/{repo}/contents/{path}
    const filePath = rest.join('/');
    const body = await request.json();
    const content = btoa(unescape(encodeURIComponent(body.content || body.data || '')));

    // Try to get existing file SHA
    const existing = await githubRequest(`/repos/${repo}/contents/${filePath}?ref=${branch}`, 'GET', undefined, env);
    const sha = existing.ok ? (await existing.json()).sha : undefined;

    const commitResp = await githubRequest(`/repos/${repo}/contents/${filePath}`, 'PUT', JSON.stringify({
      message: `Update ${filePath}`,
      content,
      sha,
      branch,
    }), env);

    return new Response(JSON.stringify(await commitResp.json()), {
      status: commitResp.ok ? 200 : 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (resource === 'entries' && request.method === 'GET') {
    // Get file or list collection
    const filePath = rest.join('/');
    const resp = await githubRequest(`/repos/${repo}/contents/${filePath}?ref=${branch}`, 'GET', undefined, env);

    if (!resp.ok) {
      return new Response(JSON.stringify([]), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }

    const data = await resp.json();
    if (Array.isArray(data)) {
      return new Response(JSON.stringify(data), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(data.content, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Content-Encoding': 'identity',
      },
    });
  }

  if (resource === 'media' && request.method === 'PUT') {
    // Upload media file
    const filePath = rest.join('/');
    const body = await request.text();
    const content = btoa(unescape(encodeURIComponent(body)));

    const existing = await githubRequest(`/repos/${repo}/contents/${filePath}?ref=${branch}`, 'GET', undefined, env);
    const sha = existing.ok ? (await existing.json()).sha : undefined;

    const commitResp = await githubRequest(`/repos/${repo}/contents/${filePath}`, 'PUT', JSON.stringify({
      message: `Upload ${filePath}`,
      content,
      sha,
      branch,
    }), env);

    return new Response(JSON.stringify(await commitResp.json()), {
      status: commitResp.ok ? 200 : 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response('Not found', { status: 404 });
};
