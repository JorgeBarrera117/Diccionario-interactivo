import { getState } from '../store.js';

export function hasWolframKey() {
  return true; // Siempre true para habilitar opciones, ya que usamos Newton API (gratuita)
}

export async function wolframSolve(input) {
  const url = `https://newton.vercel.app/api/v2/zeroes/${encodeURIComponent(input)}`;
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    if (!data.result) return null;
    let resText = Array.isArray(data.result) ? data.result.join(', ') : data.result;
    return {
      result: { plaintext: `x = ${resText}` },
      stepsPod: null,
      plotPod: null,
    };
  } catch {
    return null;
  }
}

export async function wolframPlot(func, xMin = -10, xMax = 10) {
  return null; // Newton no soporta gráficos de la misma forma, caerá en el fallback local
}
