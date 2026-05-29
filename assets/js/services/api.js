export async function fetchJson(url, options = {}) {
  const isGet = !options.method || options.method === 'GET';
  let res;
  try {
    res = await fetch(url, {
      headers: isGet ? {} : { 'Content-Type': 'application/json' },
      ...options,
    });
  } catch (err) {
    throw new Error(`Error de red o CORS. No se pudo conectar con el servidor.`);
  }
  if (!res.ok) {
    let msg = `Error ${res.status}`;
    try {
      const err = await res.json();
      msg = err.detail || err.message || msg;
    } catch {}
    throw new Error(msg);
  }
  return res.json();
}

export async function fetchWithProxy(apiUrl) {
  const proxyUrl = `https://corsproxy.io/?url=${encodeURIComponent(apiUrl)}`;
  return fetchJson(proxyUrl);
}
