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

function keyTerms(word, context) {
  if (!context || context === word) return word;
  const stopWords = new Set([
    'the','a','an','in','on','at','to','of','for','by','with','from','as','into','through',
    'during','before','after','above','below','between','and','or','but','is','are','was',
    'were','be','been','being','have','has','had','do','does','did','will','would','can',
    'could','shall','should','may','might','it','its','this','that','these','those','i',
    'you','he','she','we','they','me','him','her','them','my','your','his','its','our',
    'their','not','no','nor','so','very','just','also','if','then','than','because',
    'about','which','who','whom','what','when','where','how','some','any','all','each',
    'every','both','few','more','most','other','such','only','own','same','too','up','down',
    'out','off','over','under','again','further','once','here','there',
    'el','la','los','las','un','una','unos','unas','en','de','del','para','por','con','sin',
    'es','son','era','ser','estar','está','están','tener','tiene','haber','ha','han',
    'y','o','pero','como','que','se','su','sus','lo','le','no','más','muy',
  ]);
  const combined = word + ' ' + context;
  const terms = combined
    .toLowerCase()
    .replace(/[^a-záéíóúüñ ]/g, '')
    .split(/\s+/)
    .filter(t => t.length > 3 && !stopWords.has(t));
  return [...new Set(terms)].slice(0, 4).join(' ');
}

export async function fetchImage(word, context) {
  const query = keyTerms(word, context) || word;
  const enc = encodeURIComponent;

  try {
    const data = await fetchJson(
      `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${enc(query)}&gsrnamespace=6&prop=imageinfo&iiprop=url&iiurlwidth=400&format=json&origin=*&gsrlimit=5`
    );
    const pages = data?.query?.pages;
    if (pages) {
      for (const p of Object.values(pages)) {
        if (p?.imageinfo?.[0]?.thumburl) return p.imageinfo[0].thumburl;
        if (p?.imageinfo?.[0]?.url) return p.imageinfo[0].url;
      }
    }
  } catch {}

  return `https://image.pollinations.ai/prompt/${enc(query)}?width=400&height=300&nologo=true`;
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
