import { translateText } from '../services/external.js';

let debounceTimer = null;

const LANGUAGES = [
  { code: 'en', name: 'Inglés', emoji: '🇺🇸' },
  { code: 'es', name: 'Español', emoji: '🇪🇸' },
  { code: 'fr', name: 'Francés', emoji: '🇫🇷' },
  { code: 'de', name: 'Alemán', emoji: '🇩🇪' },
  { code: 'it', name: 'Italiano', emoji: '🇮🇹' },
  { code: 'pt', name: 'Portugués', emoji: '🇵🇹' },
];

function getLangEmoji(code) {
  const l = LANGUAGES.find(x => x.code === code);
  return l ? l.emoji : '🌐';
}

function getLangName(code) {
  const l = LANGUAGES.find(x => x.code === code);
  return l ? l.name : code;
}

export function renderTranslatePanel() {
  const section = document.getElementById('translateSection');
  
  // HTML layout
  section.innerHTML = `
    <div class="translate-container">
      <div class="translate-panel">
        <div class="translate-header">
          <div class="translate-lang-select d-flex gap-2 align-items-center">
            <select class="m3-filter-chip active" id="sourceLangBtn" style="appearance: auto; padding-right: 8px;">
              ${LANGUAGES.map(l => '<option value="' + l.code + '">' + l.emoji + ' ' + l.name + '</option>').join('')}
            </select>
          </div>
          <button class="swap-btn-m3" id="swapLangBtn" title="Intercambiar idiomas">
            <span class="material-symbols-rounded">swap_horiz</span>
          </button>
          <div class="translate-lang-select d-flex gap-2 align-items-center justify-content-end">
            <select class="m3-filter-chip active" id="targetLangBtn" style="appearance: auto; padding-right: 8px;">
              ${LANGUAGES.filter(l => l.code !== 'auto').map(l => '<option value="' + l.code + '" ' + (l.code === 'es' ? 'selected' : '') + '>' + l.emoji + ' ' + l.name + '</option>').join('')}
            </select>
          </div>
        </div>
        
        <div class="translate-body">
          <div class="translate-panel-left">
            <textarea id="translateInput" class="translate-textarea" placeholder="Escribe o pega el texto aquí..."></textarea>
            <div class="translate-action-bar">
              <span id="translateChars" style="font-size: 0.75rem; color: var(--md-sys-color-on-surface-variant, #49454F);">0 / 5000</span>
              <div class="d-flex gap-1">
                <button class="btn btn-icon btn-sm d-none" id="btnClear" title="Limpiar texto">
                  <span class="material-symbols-rounded">close</span>
                </button>
              </div>
            </div>
          </div>
          <div class="translate-panel-right">
            <div id="translateResult" class="translate-result-text d-flex flex-column" style="position: relative;">
              <!-- Empty state default -->
              <div class="text-center m-auto" id="translateEmptyState" style="color: var(--md-sys-color-on-surface-variant, #49454F);">
                <span class="material-symbols-rounded" style="font-size: 48px; opacity: 0.5;">language</span>
                <div class="fw-medium mt-2" style="font-size: 1rem;">La traducción aparecerá aquí</div>
                <div style="font-size: 0.85rem; opacity: 0.8;">Empieza a escribir en el panel izquierdo</div>
              </div>
              
              <!-- Loader state -->
              <div id="translateLoader" class="d-none w-100 mt-2">
                <div class="m3-skeleton-line" style="width: 80%;"></div>
                <div class="m3-skeleton-line" style="width: 90%;"></div>
                <div class="m3-skeleton-line" style="width: 60%;"></div>
              </div>
              
              <!-- Result text -->
              <div id="translateOutput" class="d-none"></div>
            </div>
            <div class="translate-action-bar">
              <div></div>
              <div class="d-flex gap-1">
                <button class="btn btn-icon btn-sm position-relative" id="btnCopy" title="Copiar al portapapeles">
                  <span class="material-symbols-rounded">content_copy</span>
                  <span class="badge bg-secondary position-absolute d-none" id="copyTooltip" style="top: -25px; left: 50%; transform: translateX(-50%);">Copiado</span>
                </button>
                <button class="btn btn-icon btn-sm" id="btnFav" title="Guardar en favoritos">
                  <span class="material-symbols-rounded">star</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Frequent languages extra chips -->
      <div class="mt-3">
        <div style="font-size: 0.85rem; font-weight: 500; color: var(--md-sys-color-on-surface-variant, #49454F); margin-bottom: 8px;">Idiomas frecuentes</div>
        <div class="translate-recent-chips">
          <button class="m3-assist-chip" onclick="setFastLanguage('en', 'es')">🇺🇸 Inglés a 🇪🇸 Español</button>
          <button class="m3-assist-chip" onclick="setFastLanguage('es', 'en')">🇪🇸 Español a 🇺🇸 Inglés</button>
          <button class="m3-assist-chip" onclick="setFastLanguage('es', 'fr')">🇪🇸 Español a 🇫🇷 Francés</button>
          <button class="m3-assist-chip" onclick="setFastLanguage('es', 'pt')">🇪🇸 Español a 🇵🇹 Portugués</button>
        </div>
      </div>
    </div>
  `;

  // Globals for fast language swap
  window.setFastLanguage = (src, tgt) => {
    sourceLangVal = src;
    targetLangVal = tgt;
    document.getElementById('sourceLangBtn').value = src;
    document.getElementById('targetLangBtn').value = tgt;
    checkSwapBtn();
    if(input.value.trim()) input.dispatchEvent(new Event('input'));
  };

  const input = document.getElementById('translateInput');
  const emptyState = document.getElementById('translateEmptyState');
  const loader = document.getElementById('translateLoader');
  const output = document.getElementById('translateOutput');
  const chars = document.getElementById('translateChars');
  const swapBtn = document.getElementById('swapLangBtn');
  const btnClear = document.getElementById('btnClear');
  
  let sourceLangVal = 'en';
  let targetLangVal = 'es';

  function checkSwapBtn() {
    if (sourceLangVal === 'auto') {
      swapBtn.disabled = true;
    } else {
      swapBtn.disabled = false;
    }
  }
  
  const sourceLangBtn = document.getElementById('sourceLangBtn');
  const targetLangBtn = document.getElementById('targetLangBtn');
  
  sourceLangBtn.addEventListener('change', () => {
    sourceLangVal = sourceLangBtn.value;
    checkSwapBtn();
    if(input.value.trim()) input.dispatchEvent(new Event('input'));
  });

  targetLangBtn.addEventListener('change', () => {
    targetLangVal = targetLangBtn.value;
    if(input.value.trim()) input.dispatchEvent(new Event('input'));
  });

  swapBtn.addEventListener('click', function () {
    if (sourceLangVal === 'auto') return;
    
    // Rotate animation
    swapBtn.classList.toggle('rotate-180');
    
    const tmp = sourceLangVal;
    sourceLangVal = targetLangVal;
    targetLangVal = tmp;
    
    sourceLangBtn.value = sourceLangVal;
    targetLangBtn.value = targetLangVal;
    
    const translatedText = output.innerText.trim();
    if (translatedText && !output.classList.contains('text-danger')) {
      input.value = translatedText;
    }
    
    input.dispatchEvent(new Event('input'));
  });

  // Action buttons
  btnClear.addEventListener('click', () => {
    input.value = '';
    input.dispatchEvent(new Event('input'));
  });
  document.getElementById('btnCopy').addEventListener('click', () => {
    if (!output.innerText) return;
    navigator.clipboard.writeText(output.innerText);
    const tooltip = document.getElementById('copyTooltip');
    tooltip.classList.remove('d-none');
    setTimeout(() => tooltip.classList.add('d-none'), 2000);
  });
  
  const btnFav = document.getElementById('btnFav');
  btnFav.addEventListener('click', () => {
    if (!output.innerText) return;
    const icon = btnFav.querySelector('span');
    if (icon.textContent === 'star') {
      icon.textContent = 'star_rate';
      icon.style.fontVariationSettings = "'FILL' 1";
      icon.classList.add('text-warning');
    } else {
      icon.textContent = 'star';
      icon.style.fontVariationSettings = "'FILL' 0";
      icon.classList.remove('text-warning');
    }
  });

  input.addEventListener('input', function () {
    const text = this.value;
    let len = text.length;
    if (len > 5000) {
      input.value = text.substring(0, 5000);
      len = 5000;
    }
    chars.textContent = `${len} / 5000`;
    
    if (len > 0) btnClear.classList.remove('d-none');
    else btnClear.classList.add('d-none');
    
    clearTimeout(debounceTimer);
    
    if (!text.trim()) {
      emptyState.classList.remove('d-none');
      loader.classList.add('d-none');
      output.classList.add('d-none');
      output.innerText = '';
      return;
    }
    
    emptyState.classList.add('d-none');
    loader.classList.remove('d-none');
    output.classList.add('d-none');
    
    debounceTimer = setTimeout(async () => {
      try {
        const translated = await translateText(text, sourceLangVal, targetLangVal);
        loader.classList.add('d-none');
        output.classList.remove('d-none');
        output.classList.remove('text-danger');
        output.textContent = translated;
      } catch (err) {
        loader.classList.add('d-none');
        output.classList.remove('d-none');
        output.innerHTML = `<span class="text-danger"><span class="material-symbols-rounded align-middle">error</span> Error: ${err.message}</span>`;
      }
    }, 500);
  });

  checkSwapBtn();
}
