import { env } from 'cloudflare:workers';

type RoomRecord = { code: string; room_json: string; updated_at: number };

async function ensureSchema() {
  await env.DB.prepare(`CREATE TABLE IF NOT EXISTS rooms (code TEXT PRIMARY KEY, room_json TEXT NOT NULL, updated_at INTEGER NOT NULL)`).run();
}

export async function GET(request: Request) {
  await ensureSchema();
  const code = new URL(request.url).searchParams.get('code')?.toUpperCase();
  if (!code) return Response.json({ error: 'Missing room code.' }, { status: 400 });
  const row = await env.DB.prepare('SELECT room_json FROM rooms WHERE code = ?').bind(code).first<{ room_json: string }>();
  if (!row) return Response.json({ error: 'Room not found.' }, { status: 404 });
  return Response.json(JSON.parse(row.room_json));
}

export async function PUT(request: Request) {
  await ensureSchema();
  const room = await request.json() as { code?: string } & Record<string, unknown>;
  const code = room.code?.toUpperCase();
  if (!code) return Response.json({ error: 'Missing room code.' }, { status: 400 });
  const normalized = { ...room, code };
  await env.DB.prepare('INSERT INTO rooms (code, room_json, updated_at) VALUES (?, ?, ?) ON CONFLICT(code) DO UPDATE SET room_json = excluded.room_json, updated_at = excluded.updated_at')
    .bind(code, JSON.stringify(normalized), Date.now()).run();
  return Response.json(normalized);
}
