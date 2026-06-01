import { fetchDictionary, getDailyWord, fetchImage } from '../services/external.js';
import { getState, addHistory } from '../store.js';
import {
  showLoading,
  hideLoading,
  showError,
  hideError,
  renderWordResult,
  renderWordOfDay,
} from '../views/dictionary.js';

export async function searchWord(word) {
  if (!word.trim()) return;
  const lang = getState().language;

  document.getElementById('emptyState').classList.add('d-none');
  hideError();
  showLoading();

  addHistory(word);

  try {
    const entry = await fetchDictionary(word, lang);
    const imgUrl = await fetchImage(word, lang);
    hideLoading();
    renderWordResult(entry, getState().favorites.includes(entry?.word ?? ''), lang, imgUrl);
  } catch (err) {
    hideLoading();
    document.getElementById('resultSection').innerHTML = '';
    const msg = err.message || 'Error al buscar la palabra.';
    if (msg.includes('Failed to fetch')) {
      showError('No se pudo conectar con el servidor de diccionario. Verifica tu conexión a internet o intenta más tarde.');
    } else if (msg.includes('404') || msg.includes('not found') || msg.includes('no encontrada')) {
      showError(`No se encontró la palabra "${word}" en el diccionario.`);
    } else {
      showError(msg);
    }
  }
}

export async function loadWordOfDay() {
  const lang = getState().language;
  const word = getDailyWord(lang);
  renderWordOfDay(word, 'Cargando definición...', lang);
  try {
    const entry = await fetchDictionary(word, lang);
    const def = entry?.meanings[0]?.definitions[0]?.definition || 'Sin definición disponible.';
    renderWordOfDay(word, def, lang);
  } catch {
    renderWordOfDay(word, 'No se pudo cargar la definición.', lang);
  }
}
