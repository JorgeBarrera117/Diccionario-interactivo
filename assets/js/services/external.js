import { fetchJson } from './api.js';
import { fetchRAEWord } from './rae.js';

const DICT_API_BASE = 'https://api.dictionaryapi.dev/api/v2/entries';
const MEMORY_API = 'https://api.mymemory.translated.net/get';

export const LANG_CODES = { en: 'en', es: 'es', fr: 'fr', de: 'de', it: 'it', pt: 'pt' };

export const EN_WORDS = [
  'serendipity', 'ephemeral', 'resilience', 'eloquent', 'ambiguous',
  'benevolent', 'candid', 'diligent', 'empathy', 'frugal',
  'gratitude', 'hypothetical', 'inevitable', 'juxtapose', 'kinetic',
  'luminous', 'meticulous', 'nostalgia', 'optimistic', 'persevere',
  'quintessential', 'rejuvenate', 'spontaneous', 'tenacious', 'ubiquitous',
  'vivid', 'whimsical', 'yearning', 'zealous', 'enigma',
  'harmony', 'insight', 'journey', 'kindness', 'laughter',
  'melody', 'notion', 'ocean', 'peace', 'quest',
  'silence', 'twilight', 'unity', 'valor', 'wisdom',
  'adventure', 'beautiful', 'courage', 'discover', 'explore',
];

export const ES_WORDS = [
  'serendipia', 'efímero', 'resiliencia', 'elocuente', 'ambiguo',
  'benevolente', 'cándido', 'diligente', 'empatía', 'frugal',
  'gratitud', 'hipotético', 'inevitable', 'yuxtaposición', 'cinético',
  'luminoso', 'meticuloso', 'nostalgia', 'optimista', 'perseverar',
  'esencial', 'rejuvenecer', 'espontáneo', 'tenaz', 'ubicuo',
  'vívido', 'caprichoso', 'anhelo', 'celoso', 'enigma',
  'armonía', 'perspicacia', 'viaje', 'bondad', 'risa',
  'melodía', 'noción', 'océano', 'paz', 'búsqueda',
  'silencio', 'crepúsculo', 'unidad', 'valor', 'sabiduría',
  'aventura', 'hermoso', 'coraje', 'descubrir', 'explorar',
];

export function getDailyWord(lang) {
  const list = lang === 'es' ? ES_WORDS : EN_WORDS;
  const start = new Date(new Date().getFullYear(), 0, 0);
  const diff = Math.floor((Date.now() - start) / 86400000);
  return list[diff % list.length];
}

async function wikiPageImage(url) {
  try {
    const data = await fetchJson(url);
    const pages = data?.query?.pages;
    if (!pages) return null;
    for (const p of Object.values(pages)) {
      if (p?.thumbnail?.source) return p.thumbnail.source;
    }
    return null;
  } catch {
    return null;
  }
}

async function commonsImage(word) {
  const url = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(word)}&gsrnamespace=6&prop=imageinfo&iiprop=url&iiurlwidth=400&format=json&origin=*&gsrlimit=3`;
  try {
    const data = await fetchJson(url);
    const pages = data?.query?.pages;
    if (!pages) return null;
    for (const p of Object.values(pages)) {
      if (p?.imageinfo?.[0]?.thumburl) return p.imageinfo[0].thumburl;
      if (p?.imageinfo?.[0]?.url) return p.imageinfo[0].url;
    }
    return null;
  } catch {
    return null;
  }
}

export async function fetchImage(word, lang) {
  const wikiLang = LANG_CODES[lang] || 'en';
  const enc = encodeURIComponent;

  // 1) Exact Wikipedia page
  let img = await wikiPageImage(
    `https://${wikiLang}.wikipedia.org/w/api.php?action=query&titles=${enc(word)}&prop=pageimages&format=json&pithumbsize=400&origin=*`
  );
  if (img) return img;

  // 2) Wikipedia search (related pages)
  img = await wikiPageImage(
    `https://${wikiLang}.wikipedia.org/w/api.php?action=query&generator=search&gsrsearch=${enc(word)}&prop=pageimages&format=json&pithumbsize=400&origin=*&gsrlimit=3`
  );
  if (img) return img;

  // 3) Wikimedia Commons search
  img = await commonsImage(word);
  if (img) return img;

  return null;
}

export async function fetchDictionary(word, lang) {
  if (lang === 'es') {
    return fetchRAEWord(word);
  }
  const code = LANG_CODES[lang] || 'en';
  const data = await fetchJson(`${DICT_API_BASE}/${code}/${encodeURIComponent(word.toLowerCase())}`);
  return normalizeEnglish(data);
}

function normalizeEnglish(data) {
  const entry = Array.isArray(data) ? data[0] : data;
  if (!entry || !entry.word) throw new Error('Palabra no encontrada.');
  return {
    word: entry.word,
    phonetic: entry.phonetic || null,
    phonetics: entry.phonetics || [],
    meanings: (entry.meanings || []).map(m => ({
      partOfSpeech: m.partOfSpeech || '',
      definitions: (m.definitions || []).map(d => ({
        definition: d.definition || '',
        examples: d.example ? [d.example] : [],
      })),
    })),
  };
}

const MAX_CHARS = 450;

async function translateChunk(text, source, target) {
  const url = `${MEMORY_API}?q=${encodeURIComponent(text)}&langpair=${source}|${target}`;
  const data = await fetchJson(url);
  if (data.responseStatus !== 200) {
    throw new Error(data.responseDetails || 'Error en la traducción.');
  }
  const result = data.responseData?.translatedText;
  if (!result || !result.trim()) {
    throw new Error('No se pudo traducir. Intenta con palabras más simples.');
  }
  if (result.includes('QUERY LENGTH LIMIT EXCEEDED')) {
    throw new Error('Límite de 500 caracteres por solicitud.');
  }
  return result;
}

function splitIntoChunks(text) {
  const sentences = text.match(/[^.!?\n]+[.!?\n]*\s*/g) || [text];
  const chunks = [];
  let current = '';
  for (const s of sentences) {
    if ((current + s).length > MAX_CHARS && current.length > 0) {
      chunks.push(current.trim());
      current = s;
    } else {
      current += s;
    }
  }
  if (current.trim()) chunks.push(current.trim());
  return chunks;
}

function splitByLength(text) {
  const chunks = [];
  for (let i = 0; i < text.length; i += MAX_CHARS) {
    chunks.push(text.slice(i, i + MAX_CHARS));
  }
  return chunks;
}

export async function translateText(text, source, target) {
  if (text.length <= MAX_CHARS) {
    return translateChunk(text, source, target);
  }
  let chunks = splitIntoChunks(text);
  if (chunks.length === 1 && chunks[0].length > MAX_CHARS) {
    chunks = splitByLength(text);
  }
  const translated = [];
  for (const chunk of chunks) {
    const t = await translateChunk(chunk, source, target);
    translated.push(t);
  }
  return translated.join(' ');
}
