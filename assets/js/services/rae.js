import { fetchJson } from './api.js';

const DICT_DEV_ES = 'https://api.dictionaryapi.dev/api/v2/entries/es';
const RAE_API = 'https://rae-api.com/api/words';

const PROXIES = [
  'https://corsproxy.io/?url=',
  'https://api.codetabs.com/v1/proxy?quest=',
];

export async function fetchRAEWord(word) {
  const cleanWord = word.toLowerCase().trim();

  const errors = [];

  for (const attempt of attempts(cleanWord)) {
    try {
      return await attempt();
    } catch (err) {
      errors.push(err.message);
    }
  }

  throw new Error(
    `No se encontró "${word}" en español.\nMotivos:\n- ${errors.join('\n- ')}`
  );
}

function attempts(word) {
  const encoded = encodeURIComponent(word);
  return [
    // 1) dictionaryapi.dev (tiene CORS, quizás tenga español)
    () => fetchJson(`${DICT_DEV_ES}/${encoded}`).then(normalizeDev),

    // 2-3) rae-api.com via CORS proxies
    ...PROXIES.map(proxy => () => fetchJson(`${proxy}${encodeURIComponent(`${RAE_API}/${encoded}`)}`).then(normalizeRAE)),

    // 4) DLE search directo
    () => fetchJson(`https://dle.rae.es/data/search?w=${encoded}`).then(normalizeDLE),
  ];
}

function normalizeDev(data) {
  const entry = Array.isArray(data) ? data[0] : data;
  if (!entry || !entry.word) throw new Error('Sin resultados en dictionaryapi.dev');
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

function normalizeRAE(data) {
  if (!data || !data.ok || !data.data) {
    throw new Error('Respuesta vacía de la API RAE.');
  }
  const entry = data.data;
  return {
    word: entry.word,
    phonetic: null,
    phonetics: [],
    meanings: (entry.meanings || []).flatMap(m => (m.senses || []).map(s => ({
      partOfSpeech: s.category || '',
      definitions: [{
        definition: s.description || '',
        examples: s.examples ? [s.examples] : [],
      }],
    }))),
  };
}

function normalizeDLE(data) {
  if (!data || !data.words || data.words.length === 0) {
    throw new Error('Palabra no encontrada en el DLE.');
  }
  const entry = data.words[0];
  return {
    word: entry.header || '',
    phonetic: null,
    phonetics: [],
    meanings: [{
      partOfSpeech: '',
      definitions: (entry.definitions || []).map(d => ({
        definition: typeof d === 'string' ? d : d.value || '',
        examples: [],
      })),
    }],
  };
}
