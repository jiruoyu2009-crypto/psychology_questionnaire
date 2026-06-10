export async function onRequest({ request, env }) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Accept'
  };

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ ok: false, error: 'Method Not Allowed' }), {
      status: 405,
      headers: Object.assign({ 'content-type': 'application/json' }, corsHeaders)
    });
  }

  try {
    const payload = await request.json();

    if (!env.DATA_KV) {
      return new Response(JSON.stringify({ ok: false, error: 'Missing DATA_KV binding' }), {
        status: 500,
        headers: Object.assign({ 'content-type': 'application/json' }, corsHeaders)
      });
    }

    const id = crypto.randomUUID();
    const now = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    const formatted = `${now.getFullYear()}/${pad(now.getMonth() + 1)}/${pad(now.getDate())}-${pad(now.getHours() + 8)}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
    const timestamp = Math.floor(now.getTime() / 1000);
    const record = {
      id,
      timestamp,
      createdAt: now.toISOString(),
      payload
    };

    // Key format: response:YYYY/MM/DD-HH:MM:SS:UUID
    const key = `${formatted} (${id})`;
    await env.DATA_KV.put(key, JSON.stringify(record));
    console.log('Saved response to KV', { key, id, timestamp });

    return new Response(JSON.stringify({ ok: true, id, key, timestamp }), {
      status: 200,
      headers: Object.assign({ 'content-type': 'application/json' }, corsHeaders)
    });
  } catch (error) {
    return new Response(JSON.stringify({ ok: false, error: String(error) }), {
      status: 500,
      headers: Object.assign({ 'content-type': 'application/json' }, corsHeaders)
    });
  }
}
