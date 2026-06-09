export async function onRequestPost({ request, env }) {
  try {
    const payload = await request.json();

    if (!env.DATA_KV) {
      return new Response(JSON.stringify({ ok: false, error: 'Missing DATA_KV binding' }), {
        status: 500,
        headers: { 'content-type': 'application/json' }
      });
    }

    const id = crypto.randomUUID();
    const record = {
      id,
      createdAt: new Date().toISOString(),
      ...payload
    };

    await env.DATA_KV.put(`response:${id}`, JSON.stringify(record));

    return new Response(JSON.stringify({ ok: true, id }), {
      status: 200,
      headers: {
        'content-type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({ ok: false, error: String(error) }), {
      status: 500,
      headers: {
        'content-type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
}
