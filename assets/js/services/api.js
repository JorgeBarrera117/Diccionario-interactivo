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
      msg = err.detail || err.message || err.title || msg;
    } catch {
      try {
        const textErr = await res.text();
        if (textErr) msg = `${msg}: ${textErr.slice(0, 100)}`;
      } catch {}
    }
    throw new Error(msg);
  }
  try {
    return await res.json();
  } catch (err) {
    throw new Error('Respuesta inválida del servidor (no es JSON válido).');
  }
}

export async function fetchWithProxy(apiUrl) {
  const proxyUrl = `https://corsproxy.io/?url=${encodeURIComponent(apiUrl)}`;
  return fetchJson(proxyUrl);
}
