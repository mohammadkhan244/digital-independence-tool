// Required in Vercel dashboard + .env.local:
// KV_REST_API_URL
// KV_REST_API_TOKEN

import { kv } from '@vercel/kv';

export const config = { runtime: 'edge' };

export default async function handler(request: Request): Promise<Response> {
  const headers = { 'Content-Type': 'application/json' };

  // ── POST — save a session ─────────────────────────────────────────────────
  if (request.method === 'POST') {
    let body: { session?: Record<string, unknown> };
    try {
      body = await request.json();
    } catch {
      return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400, headers });
    }

    const session = body?.session;
    if (!session?.id || !session?.participantId) {
      return new Response(JSON.stringify({ error: 'Missing session.id or participantId' }), { status: 400, headers });
    }

    const sessionId    = session.id as string;
    const participantId = session.participantId as string;
    const mode          = (session.assessmentMode as string) ?? 'assessment';

    await Promise.all([
      kv.set(`session:${sessionId}`, session),
      kv.sadd(`sessions:participant:${participantId}`, sessionId),
      kv.sadd(`sessions:mode:${mode}`, sessionId),
      kv.sadd('sessions:all', sessionId),
    ]);

    return new Response(JSON.stringify({ success: true }), { status: 200, headers });
  }

  // ── GET — retrieve sessions ───────────────────────────────────────────────
  if (request.method === 'GET') {
    const url           = new URL(request.url);
    const participantId = url.searchParams.get('participantId');
    const mode          = url.searchParams.get('mode');

    let sessionIds: string[];

    if (participantId && mode) {
      const [pIds, mIds] = await Promise.all([
        kv.smembers(`sessions:participant:${participantId}`),
        kv.smembers(`sessions:mode:${mode}`),
      ]);
      const mSet = new Set(mIds as string[]);
      sessionIds = (pIds as string[]).filter(id => mSet.has(id));
    } else if (participantId) {
      sessionIds = (await kv.smembers(`sessions:participant:${participantId}`)) as string[];
    } else if (mode) {
      sessionIds = (await kv.smembers(`sessions:mode:${mode}`)) as string[];
    } else {
      sessionIds = (await kv.smembers('sessions:all')) as string[];
    }

    if (sessionIds.length === 0) {
      return new Response(JSON.stringify({ sessions: [] }), { status: 200, headers });
    }

    const sessions = await Promise.all(sessionIds.map(id => kv.get(`session:${id}`)));

    return new Response(
      JSON.stringify({ sessions: sessions.filter(Boolean) }),
      { status: 200, headers },
    );
  }

  return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers });
}
