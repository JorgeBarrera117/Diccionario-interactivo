import { hasWolframKey, wolframSolve, wolframPlot } from '../services/wolfram.js';

let history = [];
let currentTab = 'calc';

const PHYSICS = [
  { 
    name: 'Velocidad final (MRUV)', 
    category: 'Cinemática',
    vars: { v: 'Velocidad final (m/s)', u: 'Velocidad inicial (m/s)', a: 'Aceleración (m/s²)', t: 'Tiempo (s)' },
    formula: 'v = u + a \\cdot t',
    solve: {
      v: { tex: 'v = u + a \\cdot t', calc: (v) => v.u + v.a * v.t },
      u: { tex: 'u = v - a \\cdot t', calc: (v) => v.v - v.a * v.t },
      a: { tex: 'a = \\frac{v - u}{t}', calc: (v) => (v.v - v.u) / v.t },
      t: { tex: 't = \\frac{v - u}{a}', calc: (v) => (v.v - v.u) / v.a }
    }
  },
  { 
    name: 'Distancia (MRUV)', 
    category: 'Cinemática',
    vars: { s: 'Distancia (m)', u: 'Vel. inicial (m/s)', t: 'Tiempo (s)', a: 'Aceleración (m/s²)' },
    formula: 's = u \\cdot t + \\frac{1}{2} a \\cdot t^2',
    solve: {
      s: { tex: 's = u \\cdot t + 0.5 \\cdot a \\cdot t^2', calc: (v) => v.u * v.t + 0.5 * v.a * v.t ** 2 },
      u: { tex: 'u = \\frac{s - 0.5 \\cdot a \\cdot t^2}{t}', calc: (v) => (v.s - 0.5 * v.a * v.t ** 2) / v.t },
      a: { tex: 'a = \\frac{2(s - u \\cdot t)}{t^2}', calc: (v) => (2 * (v.s - v.u * v.t)) / (v.t ** 2) }
    }
  },
  { 
    name: 'Segunda ley Newton', 
    category: 'Dinámica',
    vars: { F: 'Fuerza (N)', m: 'Masa (kg)', a: 'Aceleración (m/s²)' },
    formula: 'F = m \\cdot a',
    solve: {
      F: { tex: 'F = m \\cdot a', calc: (v) => v.m * v.a },
      m: { tex: 'm = \\frac{F}{a}', calc: (v) => v.F / v.a },
      a: { tex: 'a = \\frac{F}{m}', calc: (v) => v.F / v.m }
    }
  },
  { 
    name: 'Energía cinética', 
    category: 'Energía',
    vars: { KE: 'Energía (J)', m: 'Masa (kg)', v: 'Velocidad (m/s)' },
    formula: 'KE = \\frac{1}{2} m \\cdot v^2',
    solve: {
      KE: { tex: 'KE = 0.5 \\cdot m \\cdot v^2', calc: (v) => 0.5 * v.m * v.v ** 2 },
      m: { tex: 'm = \\frac{2 \\cdot KE}{v^2}', calc: (v) => (2 * v.KE) / (v.v ** 2) },
      v: { tex: 'v = \\sqrt{\\frac{2 \\cdot KE}{m}}', calc: (v) => Math.sqrt((2 * v.KE) / v.m) }
    }
  },
  { 
    name: 'Energía potencial gravitatoria', 
    category: 'Energía',
    vars: { PE: 'Energía (J)', m: 'Masa (kg)', h: 'Altura (m)', g: 'Gravedad (m/s²)' },
    formula: 'PE = m \\cdot g \\cdot h',
    solve: {
      PE: { tex: 'PE = m \\cdot g \\cdot h', calc: (v) => v.m * (v.g ?? 9.81) * v.h },
      m: { tex: 'm = \\frac{PE}{g \\cdot h}', calc: (v) => v.PE / ((v.g ?? 9.81) * v.h) },
      g: { tex: 'g = \\frac{PE}{m \\cdot h}', calc: (v) => v.PE / (v.m * v.h) },
      h: { tex: 'h = \\frac{PE}{m \\cdot g}', calc: (v) => v.PE / (v.m * (v.g ?? 9.81)) }
    }
  },
  { 
    name: 'Ley de Ohm', 
    category: 'Electricidad',
    vars: { V: 'Voltaje (V)', I: 'Corriente (A)', R: 'Resistencia (Ω)' },
    formula: 'V = I \\cdot R',
    solve: {
      V: { tex: 'V = I \\cdot R', calc: (v) => v.I * v.R },
      I: { tex: 'I = \\frac{V}{R}', calc: (v) => v.V / v.R },
      R: { tex: 'R = \\frac{V}{I}', calc: (v) => v.V / v.I }
    }
  },
  { 
    name: 'Trabajo mecánico', 
    category: 'Energía',
    vars: { W: 'Trabajo (J)', F: 'Fuerza (N)', d: 'Distancia (m)' },
    formula: 'W = F \\cdot d',
    solve: {
      W: { tex: 'W = F \\cdot d', calc: (v) => v.F * v.d },
      F: { tex: 'F = \\frac{W}{d}', calc: (v) => v.W / v.d },
      d: { tex: 'd = \\frac{W}{F}', calc: (v) => v.W / v.F }
    }
  },
  { 
    name: 'Densidad', 
    category: 'Propiedades',
    vars: { rho: 'Densidad (kg/m³)', m: 'Masa (kg)', v: 'Volumen (m³)' },
    formula: '\\rho = \\frac{m}{v}',
    solve: {
      rho: { tex: '\\rho = \\frac{m}{v}', calc: (v) => v.m / v.v },
      m: { tex: 'm = \\rho \\cdot v', calc: (v) => v.rho * v.v },
      v: { tex: 'v = \\frac{m}{\\rho}', calc: (v) => v.m / v.rho }
    }
  },
  { 
    name: 'Teorema de Pitágoras', 
    category: 'Geometría',
    vars: { c: 'Hipotenusa', a: 'Cateto a', b: 'Cateto b' },
    formula: 'c^2 = a^2 + b^2',
    solve: {
      c: { tex: 'c = \\sqrt{a^2 + b^2}', calc: (v) => Math.sqrt(v.a ** 2 + v.b ** 2) },
      a: { tex: 'a = \\sqrt{c^2 - b^2}', calc: (v) => Math.sqrt(v.c ** 2 - v.b ** 2) },
      b: { tex: 'b = \\sqrt{c^2 - a^2}', calc: (v) => Math.sqrt(v.c ** 2 - v.a ** 2) }
    }
  }
];

function setActiveSubTab(tab) {
  currentTab = tab;
  document.querySelectorAll('.math-subtab').forEach(t => t.classList.toggle('active', t.dataset.tab === tab));
  document.querySelectorAll('.math-panel').forEach(p => p.classList.toggle('d-none', p.id !== `mathPanel${tab.charAt(0).toUpperCase() + tab.slice(1)}`));
  if (tab === 'graph') drawGraph();
}

function safeEval(expr) {
  const s = expr.replace(/\^/g, '**');
  if (!/^[\d\s+\-*/().,%eπpiMath\.a-z]+$/i.test(s)) throw new Error('Expresión no válida');
  return Function(`"use strict"; return (${s})`)();
}

function mathDisplay(val) {
  const d = document.getElementById('mathDisplay');
  const e = document.getElementById('mathExpr');
  if (d) d.textContent = val ?? '0';
  if (e) e.textContent = '';
}

function handleCalc(key) {
  const disp = document.getElementById('mathDisplay');
  const expr = document.getElementById('mathExpr');
  let cur = disp.textContent;
  if (cur === '0' || cur === 'Error') cur = '';
  if (key === 'C') { mathDisplay('0'); return; }
  if (key === '⌫') { mathDisplay(cur.slice(0, -1) || '0'); return; }
  if (key === '=') {
    try {
      const r = safeEval(cur);
      const f = typeof r === 'number' && !Number.isInteger(r) ? parseFloat(r.toFixed(10)).toString() : String(r);
      history.unshift({ expr: cur, result: f }); if (history.length > 20) history.pop();
      if (expr) expr.textContent = cur + ' =';
      mathDisplay(f); renderHistory();
    } catch { showError('Error'); }
    return;
  }
  const map = { '×': '*', '÷': '/', π: `(${Math.PI})` };
  const ins = map[key] || key;
  if (['sin','cos','tan','sqrt','log','ln'].includes(key)) mathDisplay(cur + key + '(');
  else mathDisplay(cur + ins);
}

function showError(msg) {
  const d = document.getElementById('mathDisplay');
  if (d) d.textContent = msg;
}

function renderHistory() {
  const el = document.getElementById('mathHistory');
  if (!el) return;
  el.innerHTML = history.length === 0
    ? '<p class="text-body-secondary small mb-0">Sin cálculos aún</p>'
    : history.map(h => `<div class="math-history-item"><span class="text-body-secondary small">${h.expr} =</span><span class="fw-medium ms-1">${h.result}</span></div>`).join('');
}

function parseMath(expr) {
  try { return math.evaluate(expr); } catch { return null; }
}

function insertAtCursor(input, before, after = '') {
  const mf = document.getElementById('algMathField');
  if (mf) {
    mf.focus();
    mf.executeCommand(['insert', before + after]);
  }
}

function parseLatexToAsciiMath(latex) {
  // Conversión básica a texto plano para que lo procese Math.js si no hay Wolfram
  let s = latex;
  s = s.replace(/\\frac{([^}]+)}{([^}]+)}/g, '($1)/($2)');
  s = s.replace(/\\cdot/g, '*');
  s = s.replace(/\\left/g, '').replace(/\\right/g, '');
  s = s.replace(/\\sqrt{([^}]+)}/g, 'sqrt($1)');
  s = s.replace(/\^{([^}]+)}/g, '^($1)');
  s = s.replace(/\^([^\s()]+)/g, '^$1');
  s = s.replace(/\\pi/g, 'pi');
  s = s.replace(/\\infty/g, 'Infinity');
  s = s.replace(/\\sin/g, 'sin');
  s = s.replace(/\\cos/g, 'cos');
  s = s.replace(/\\tan/g, 'tan');
  s = s.replace(/\\log/g, 'log');
  s = s.replace(/\\ln/g, 'log');
  return s;
}

const ALG_EXAMPLES = {
  solve: 'Ej: 2x + 5 = 13  |  x^2 - 4 = 0  |  33x - 15y = 24',
  simplify: 'Ej: 2x + 3x  |  (x+1)^2 + (x-1)^2',
  expand: 'Ej: (x+1)(x-1)  |  (x+2)^3',
  factor: 'Ej: x^2 - 4  |  x^2 + 5x + 6',
  derive: 'Ej: x^3 + 2x^2 - 5  |  \\sin(x)',
  integrate: 'Ej: x^2  |  2x + 1  |  \\sin(x)',
  eval: 'Ej: 2 + 2*5  |  \\sqrt{16} + \\pi',
};

function getVars(expr) {
  try {
    const node = math.parse(expr);
    const vars = new Set();
    node.traverse(n => {
      if (n.isSymbolNode && !math[n.name] && n.name !== 'pi' && n.name !== 'e') {
        vars.add(n.name);
      }
    });
    return Array.from(vars).sort();
  } catch { return []; }
}

function gcd(a, b) {
  a = Math.abs(a); b = Math.abs(b);
  while (b) { const t = b; b = a % b; a = t; }
  return a;
}

function gcdMultiple(...arr) {
  return arr.reduce((acc, val) => gcd(acc, val));
}

function formatTerm(coeff, varName, isFirst) {
  if (coeff === 0) return '';
  const sign = coeff < 0 ? '-' : (isFirst ? '' : '+');
  const abs = Math.abs(coeff);
  const numStr = abs === 1 && varName ? '' : abs;
  return `${isFirst ? sign : (sign === '-' ? ' - ' : ' + ')}${numStr}${varName}`;
}

function formatFraction(num, den) {
  if (num === 0) return '0';
  const g = gcd(num, den);
  const n = num / g;
  const d = Math.abs(den / g);
  const sign = Math.sign(num) * Math.sign(den) < 0 ? '-' : '';
  const absN = Math.abs(n);
  if (d === 1) return `${sign}${absN}`;
  return `${sign}\\frac{${absN}}{${d}}`;
}

function getSlopeInterceptForm(vName, otherVName, nOther, nC, d) {
  if (nOther === 0 && nC === 0) return `${vName} = 0`;
  let p1 = '';
  if (nOther !== 0) {
    const frac = formatFraction(nOther, d);
    if (frac === '1') p1 = otherVName;
    else if (frac === '-1') p1 = `-${otherVName}`;
    else p1 = `${frac}${otherVName}`;
  }
  let p2 = '';
  if (nC !== 0) {
    const frac = formatFraction(nC, d);
    if (p1 === '') {
      p2 = frac;
    } else {
      if (frac.startsWith('-')) p2 = ` - ${frac.substring(1)}`;
      else p2 = ` + ${frac}`;
    }
  }
  return `${vName} = ${p1}${p2}`;
}

function solveMultivariableLinear(s) {
  const [lRaw, rRaw] = s.split('=').map(x => x.trim());
  const expr = `(${lRaw}) - (${rRaw})`;
  const vars = getVars(expr);
  if (vars.length !== 2) return null;
  
  const [v1, v2] = vars;
  try {
    const c = math.evaluate(expr, { [v1]: 0, [v2]: 0 });
    const c1 = math.evaluate(expr, { [v1]: 1, [v2]: 0 }) - c;
    const c2 = math.evaluate(expr, { [v1]: 0, [v2]: 1 }) - c;
    
    // Check linearity
    const test = math.evaluate(expr, { [v1]: 2, [v2]: -3 });
    if (Math.abs(test - (c1*2 + c2*-3 + c)) > 1e-9) return null;
    
    const g = gcdMultiple(c1, c2, c);
    const simC1 = c1 / g;
    const simC2 = c2 / g;
    const simC = c / g;

    const steps = [];
    steps.push({ num: 1, title: 'Identificar tipo de ecuación', steps: [{ desc: 'Ecuación lineal con múltiples variables.', tex: s }] });
    steps.push({
      num: 2, title: 'Forma general',
      steps: [{ desc: 'Agrupamos y simplificamos:', tex: `${formatTerm(simC1, v1, true)}${formatTerm(simC2, v2, false)}${formatTerm(simC, '', false)} = 0` }]
    });

    const solutions = [];
    if (simC1 !== 0) {
      const stepDespejeV1 = [];
      let n2 = -simC2;
      let nC = -simC;
      
      stepDespejeV1.push({ desc: `1. Movemos los términos sin ${v1} al lado derecho:`, tex: `${formatTerm(simC1, v1, true)} = ${formatTerm(n2, v2, true)}${formatTerm(nC, '', n2 === 0)}` });
      
      let sV1 = Math.sign(simC1), d = Math.abs(simC1);
      n2 = n2 * sV1;
      nC = nC * sV1;
      let nt = `${formatTerm(n2, v2, true)}${formatTerm(nC, '', n2 === 0)}`;
      if (nt === '') nt = '0';
      
      if (d !== 1) {
        stepDespejeV1.push({ desc: `2. Dividimos ambos lados por ${simC1}:`, tex: `${v1} = \\frac{${formatTerm(-simC2, v2, true)}${formatTerm(-simC, '', -simC2 === 0)}}{${simC1}}` });
        if (sV1 === -1) {
          stepDespejeV1.push({ desc: `3. Simplificamos los signos:`, tex: `${v1} = \\frac{${nt}}{${d}}` });
        }
      }
      
      const slopeIntForm = getSlopeInterceptForm(v1, v2, -simC2 * sV1, -simC * sV1, d);
      stepDespejeV1.push({ desc: `Forma pendiente-intersección separada:`, tex: slopeIntForm });
      solutions.push({ num: 3, title: `Despejar ${v1}`, steps: stepDespejeV1 });
    }
    
    if (simC2 !== 0) {
      const stepDespejeV2 = [];
      let n1 = -simC1;
      let nC = -simC;
      
      stepDespejeV2.push({ desc: `1. Movemos los términos sin ${v2} al lado derecho:`, tex: `${formatTerm(simC2, v2, true)} = ${formatTerm(n1, v1, true)}${formatTerm(nC, '', n1 === 0)}` });
      
      let sV2 = Math.sign(simC2), d = Math.abs(simC2);
      n1 = n1 * sV2;
      nC = nC * sV2;
      let nt = `${formatTerm(n1, v1, true)}${formatTerm(nC, '', n1 === 0)}`;
      if (nt === '') nt = '0';
      
      if (d !== 1) {
        stepDespejeV2.push({ desc: `2. Dividimos ambos lados por ${simC2}:`, tex: `${v2} = \\frac{${formatTerm(-simC1, v1, true)}${formatTerm(-simC, '', -simC1 === 0)}}{${simC2}}` });
        if (sV2 === -1) {
          stepDespejeV2.push({ desc: `3. Simplificamos los signos:`, tex: `${v2} = \\frac{${nt}}{${d}}` });
        }
      }

      const slopeIntForm = getSlopeInterceptForm(v2, v1, -simC1 * sV2, -simC * sV2, d);
      stepDespejeV2.push({ desc: `Forma pendiente-intersección separada:`, tex: slopeIntForm });
      solutions.push({ num: solutions.length === 0 ? 3 : 4, title: `Despejar ${v2}`, steps: stepDespejeV2 });
    }

    solutions.forEach(sol => steps.push(sol));
    
    const lastStepObj = {
      num: steps.length + 1, title: 'Despejes posibles (Solución)',
      steps: [
        ...(simC1 !== 0 ? [{ desc: '', tex: `\\text{Despejada para } ${v1}:\\quad ${getSlopeInterceptForm(v1, v2, -simC2 * Math.sign(simC1), -simC * Math.sign(simC1), Math.abs(simC1))}` }] : []),
        ...(simC2 !== 0 ? [{ desc: '', tex: `\\text{Despejada para } ${v2}:\\quad ${getSlopeInterceptForm(v2, v1, -simC1 * Math.sign(simC2), -simC * Math.sign(simC2), Math.abs(simC2))}` }] : [])
      ]
    };

    if (v2 === 'y' && simC2 !== 0) {
      lastStepObj.graphExpr = `(-${simC1}*x - (${simC})) / ${simC2}`;
    } else if (v1 === 'y' && simC1 !== 0) {
      lastStepObj.graphExpr = `(-${simC2}*x - (${simC})) / ${simC1}`;
    }

    steps.push(lastStepObj);
    return steps;
  } catch (e) { return null; }
}

function extractCoeffs(exprStr, varName, degree) {
  try {
    if (degree === 1) {
      const f0 = math.evaluate(exprStr, { [varName]: 0 });
      const f1 = math.evaluate(exprStr, { [varName]: 1 });
      if (isNaN(f0) || isNaN(f1) || !isFinite(f0) || !isFinite(f1)) return null;
      return { a: f1 - f0, b: f0 };
    }
    if (degree === 2) {
      const f0 = math.evaluate(exprStr, { [varName]: 0 });
      const f1 = math.evaluate(exprStr, { [varName]: 1 });
      const fn1 = math.evaluate(exprStr, { [varName]: -1 });
      if ([f0, f1, fn1].some(v => isNaN(v) || !isFinite(v))) return null;
      const a = (f1 + fn1 - 2 * f0) / 2;
      const b = (f1 - fn1) / 2;
      const c = f0;
      return { a: Math.round(a * 1e12) / 1e12, b: Math.round(b * 1e12) / 1e12, c: Math.round(c * 1e12) / 1e12 };
    }
    return null;
  } catch (e) {
    return null;
  }
}

function renderStep(step) {
  const stepDiv = document.createElement('div');
  stepDiv.className = 'step-item';
  const steps = step.steps || [{ tex: step.tex, desc: step.desc }];
  stepDiv.innerHTML = `
    <div class="step-head">
      <span class="step-badge">${step.num}</span>
      <span class="step-title">${step.title || ''}</span>
    </div>
    <div class="step-body">
      ${steps.map(s => `<div class="step-row">
        <div class="step-desc">${s.desc}</div>
        <div class="step-tex" data-tex="${String(s.tex).replace(/"/g, '&quot;')}"></div>
      </div>`).join('')}
      ${step.result ? `<div class="step-result">${step.result}</div>` : ''}
    </div>`;
  requestAnimationFrame(() => {
    stepDiv.querySelectorAll('.step-tex').forEach(el => {
      const tex = el.dataset.tex;
      if (tex) try { katex.render(tex, el, { displayMode: true, throwOnError: false }); } catch {}
    });
  });
  return stepDiv;
}

function generateSolveSteps(input) {
  const steps = [];
  const s = input.replace(/\s+/g, '');
  if (!s.includes('=')) return [{ title: 'No es una ecuación', tex: '\\text{Ingresa una ecuación con } = ', num: 0, steps: [] }];
  const [lRaw, rRaw] = s.split('=').map(x => x.trim());
  if (!lRaw || rRaw === undefined) return [{ title: 'Ecuación incompleta', tex: '\\text{Falta el lado izquierdo o derecho}', num: 0, steps: [] }];

  const hasSquare = /x\^2|x\*\*2|x\^\(2\)|y\^2|y\*\*2|y\^\(2\)/.test(s);
  const hasHigher = /[a-z]\^[3-9]|[a-z]\*\*[3-9]|[a-z]\^\([3-9]\)/.test(s);

  const exprForVars = `(${lRaw}) - (${rRaw})`;
  const detectedVars = getVars(exprForVars);
  
  if (detectedVars.length === 2 && !hasSquare && !hasHigher) {
    const multiSteps = solveMultivariableLinear(s);
    if (multiSteps) return multiSteps;
  }

  if (detectedVars.length > 1) {
    return [{ num: 1, title: 'Ecuación compleja', steps: [{ desc: 'Múltiples variables no lineales detectadas.', tex: s }] }];
  }

  if (hasSquare && !hasHigher) {
    const rVal = math.evaluate(rRaw);
    steps.push({ num: 1, title: 'Escribir la ecuación', steps: [{ desc: 'Planteamos la ecuación: ', tex: lRaw + ' = ' + rRaw }] });

    let leftExpr = lRaw;
    let rightVal = rVal;

    if (rVal !== 0) {
      steps.push({
        num: 2, title: 'Igualar a cero',
        steps: [{ desc: `Restamos ${rVal} de ambos lados:`, tex: lRaw + ' - (' + rRaw + ') = 0' }]
      });
      leftExpr = `(${lRaw}) - (${rRaw})`;
      rightVal = 0;
    }

    const coeffs = extractCoeffs(leftExpr, 'x', 2);
    if (!coeffs || coeffs.a === 0) {
      steps.push({ num: 3, title: 'Error al identificar coeficientes', tex: '\\text{No se pudo identificar la cuadrática}', steps: [] });
      return steps;
    }
    const { a, b, c } = coeffs;
    const aStr = a === 1 ? '' : a === -1 ? '-' : a;
    const bStr = b === 0 ? '' : (b > 0 ? '+' + (b === 1 ? '' : b) : (b === -1 ? '-' : b));
    const cStr = c === 0 ? '' : (c > 0 ? '+' + c : c);

    steps.push({
      num: 3, title: 'Identificar coeficientes',
      steps: [
        { desc: `Término cuadrático (a): ${a}`, tex: `${aStr === '' ? '' : aStr}x^2` },
        { desc: `Término lineal (b): ${b}`, tex: `${b > 0 ? '+' : ''}${bStr === '' ? (b === 0 ? '' : b === 1 ? 'x' : b + 'x') : bStr + 'x'}` },
        { desc: `Término independiente (c): ${c}`, tex: c === 0 ? '0' : (c > 0 ? '+' + c : c) },
      ]
    });

    const D = b * b - 4 * a * c;
    const Dtex = `${b === 0 ? '0' : b}^2 - 4 \\cdot ${a} \\cdot ${c}`;
    steps.push({
      num: 4, title: 'Calcular el discriminante',
      steps: [
        { desc: 'Fórmula: D = b² - 4ac', tex: 'D = b^2 - 4ac' },
        { desc: 'Sustituimos:', tex: `D = ${Dtex}` },
        D >= 0
          ? { desc: `D = ${D} (positivo) — dos soluciones reales`, tex: `D = ${D}` }
          : D === 0
            ? { desc: `D = 0 — una solución real (doble)`, tex: `D = 0` }
            : { desc: `D = ${D} (negativo) — sin solución real`, tex: `D = ${D} < 0` },
      ]
    });

    if (D >= 0) {
      const sqrtD = Math.sqrt(D);
      const x1 = (-b + sqrtD) / (2 * a);
      const x2 = (-b - sqrtD) / (2 * a);
      steps.push({
        num: 5, title: 'Aplicar fórmula general',
        steps: [
          { desc: 'Fórmula: x = (-b ± √D) / (2a)', tex: `x = \\frac{-b \\pm \\sqrt{D}}{2a}` },
          { desc: 'Sustituimos:', tex: `x = \\frac{-(${b}) \\pm \\sqrt{${D}}}{2 \\cdot ${a}}` },
          { desc: 'Calculamos:', tex: `x = \\frac{${-b} \\pm ${parseFloat(sqrtD.toFixed(6))}}{${2 * a}}` },
        ]
      });
      steps.push({
        num: 6, title: 'Soluciones',
        steps: [
          { desc: `x₁ = (${-b} + ${parseFloat(sqrtD.toFixed(6))}) / ${2 * a}`, tex: `x_1 = ${x1.toFixed(6)}` },
          { desc: `x₂ = (${-b} - ${parseFloat(sqrtD.toFixed(6))}) / ${2 * a}`, tex: `x_2 = ${x2.toFixed(6)}` },
        ]
      });
    } else {
      steps.push({
        num: 5, title: 'Conclusión', steps: [
          { desc: 'El discriminante es negativo, no hay raíces reales.', tex: `D = ${D} < 0 \\Rightarrow \\text{sin solucion real}` }
        ]
      });
    }
    return steps;
  }

  if (!hasSquare && !hasHigher) {
    const leftExpr = lRaw;
    const coeffs = extractCoeffs(leftExpr, 'x', 1);
    if (!coeffs || coeffs.a === 0) {
      steps.push({ num: 1, title: 'Resolver ecuación', steps: [{ desc: 'Ecuación no soportada por el resolutor básico.', tex: s }] });
      return steps;
    }
    const { a, b } = coeffs;
    const rVal = math.evaluate(rRaw);
    steps.push({ num: 1, title: 'Escribir la ecuación', steps: [{ desc: 'Planteamos:', tex: `${a}x + (${b}) = ${rVal}` }] });

    if (b !== 0) {
      steps.push({
        num: 2, title: 'Despejar el término con x',
        steps: [
          { desc: `Restamos ${b} de ambos lados:`, tex: `${a}x = ${rVal} - (${b})` },
          { desc: 'Simplificamos:', tex: `${a}x = ${rVal - b}` },
        ]
      });
    }

    const rhs = rVal - b;
    if (a !== 1) {
      steps.push({
        num: 3, title: 'Solución',
        steps: [
          { desc: `Dividimos entre ${a}:`, tex: `x = \\frac{${rhs}}{${a}}` },
          { desc: 'Simplificamos:', tex: `x = ${(rhs / a).toFixed(6).replace(/\\.?0+$/, '')}` }
        ]
      });
    } else {
      steps.push({
        num: 3, title: 'Solución', steps: [{ desc: 'Resultado:', tex: `x = ${rhs}` }]
      });
    }
    return steps;
  }

  steps.push({ num: 1, title: 'Error', steps: [{ desc: 'Ecuación demasiado compleja para el resolutor básico.', tex: s }] });
  return steps;
}

function generateSteps(mode, input, result) {
  if (mode === 'solve') return generateSolveSteps(input);
  const steps = [];
  const modeNames = {
    simplify: 'Simplificar la expresión',
    expand: 'Expandir la expresión',
    factor: 'Factorizar la expresión',
    derive: 'Derivar la expresión',
    integrate: 'Integrar la expresión',
    eval: 'Evaluar la expresión',
  };
  steps.push({ num: 1, title: modeNames[mode] || 'Operación', steps: [{ desc: 'Expresión ingresada:', tex: input }] });
  steps.push({ num: 2, title: 'Resultado', steps: [{ desc: mode === 'eval' ? 'Valor:' : 'Expresión resultante:', tex: String(result) }] });
  return steps;
}

function renderWolframSteps(stepsPod, stepsContent, plotUrl) {
  stepsPod.subpods.forEach((sp, i) => {
    const stepDiv = document.createElement('div');
    stepDiv.className = 'step-item';
    const imgs = [];
    if (sp.img?.src) imgs.push(`<img src="${sp.img.src}" alt="Paso ${i + 1}" style="max-width:100%;height:auto;border-radius:4px;" />`);
    stepDiv.innerHTML = `
      <div class="step-head"><span class="step-badge">${i + 1}</span><span class="step-title"></span></div>
      <div class="step-body"><div class="step-row">${sp.plaintext ? `<div class="step-desc">${sp.plaintext}</div>` : ''}${imgs.length ? imgs.join('') : ''}</div></div>`;
    stepsContent.appendChild(stepDiv);
  });
  if (plotUrl) {
    const plotDiv = document.createElement('div');
    plotDiv.className = 'step-item';
    plotDiv.innerHTML = `<div class="step-head"><span class="step-badge"><span class="material-symbols-rounded">show_chart</span></span><span class="step-title">Gráfica</span></div><div class="step-body"><img src="${plotUrl}" alt="Gráfica" style="max-width:100%;height:auto;border-radius:4px;" /></div>`;
    stepsContent.appendChild(plotDiv);
  }
}

async function doAlgebra() {
  const mf = document.getElementById('algMathField');
  if (!mf) return;
  const latexInput = mf.getValue();
  const asciiInput = mf.getValue('ascii-math') || parseLatexToAsciiMath(latexInput);
  
  const mode = document.getElementById('algMode').value;
  const result = document.getElementById('algResult');
  const stepsEl = document.getElementById('algSteps');
  const stepsContent = document.getElementById('algStepsContent');
  if (!latexInput) { result.textContent = 'Ingresa una expresión'; return; }
  try {
    let out = '';
    let algebraExpr = asciiInput;
    if (mode === 'solve' && !asciiInput.includes('=')) {
      algebraExpr = asciiInput + ' = 0';
    }
    
    let genSteps = [];

    switch (mode) {
      case 'solve': {
        genSteps = generateSolveSteps(algebraExpr);
        const lastStep = genSteps[genSteps.length - 1];
        if (lastStep.title === 'Soluciones') {
           out = lastStep.steps.map(s => s.tex.replace(/x_?\d?\s*=\s*/g, '')).join(', ');
        } else if (lastStep.title === 'Solución') {
           const finalStepTex = lastStep.steps[lastStep.steps.length - 1].tex;
           out = finalStepTex.replace(/x_?\d?\s*=\s*/g, '');
        } else if (lastStep.title === 'Despejes posibles (Solución)') {
           out = lastStep.steps.map(s => s.tex.replace(/\\text{Despejada para } [a-z]:\\quad /g, '')).join('   ó   ');
        } else if (lastStep.title === 'Conclusión') {
           out = 'Sin solución real';
        } else {
           // Fallback a la API de Newton (que se encuentra en wolframSolve)
           const apiRes = await wolframSolve(algebraExpr);
           const pt = apiRes?.result?.plaintext || '';
           if (pt && pt !== 'x = ' && pt !== 'x = null' && pt !== 'x = undefined') {
             out = pt.replace('x = ', '');
             genSteps.push({ num: 2, title: 'Solución calculada por Newton API', steps: [{ desc: 'Resuelto externamente:', tex: `x = ${out}` }] });
           } else {
             out = 'No se pudo resolver automáticamente (verifica si hay variables adicionales)';
             genSteps.push({ num: 2, title: 'Límite alcanzado', steps: [{ desc: 'Nota:', tex: '\\text{Múltiples variables o ecuación muy compleja}' }] });
           }
        }
        break;
      }
      case 'simplify': out = math.simplify(algebraExpr).toString(); break;
      case 'expand': out = math.expand(algebraExpr).toString(); break;
      case 'factor': out = math.factor(algebraExpr).toString(); break;
      case 'derive': out = math.derivative(algebraExpr, 'x').toString(); break;
      case 'integrate': out = math.integrate(algebraExpr, 'x').toString(); break;
      case 'eval': {
        const v = math.evaluate(algebraExpr);
        out = typeof v === 'number' && !Number.isInteger(v) ? parseFloat(v.toFixed(10)).toString() : String(v);
        break;
      }
      default: out = 'Modo no soportado';
    }
    
    const display = String(out);
    result.innerHTML = `
      <div class="d-flex flex-column gap-3 align-items-start align-items-md-center flex-md-row justify-content-between">
        <span style="word-break: break-all;">${display}</span>
        <button class="btn btn-indigo shadow-sm px-4 py-2 fw-semibold text-nowrap rounded-pill mt-2 mt-md-0" id="btnGraphResult" style="transition: transform 0.2s, box-shadow 0.2s;" onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 4px 8px rgba(0,0,0,0.1)'" onmouseout="this.style.transform='none'; this.style.boxShadow='none'">
          <span class="material-symbols-rounded me-1">show_chart</span> Graficar Respuesta
        </button>
      </div>
    `;
    result.className = 'math-result-display';

    const btnGraphResult = document.getElementById('btnGraphResult');
    if (btnGraphResult) {
      btnGraphResult.addEventListener('click', () => {
        const graphTab = document.querySelector('.math-subtab[data-tab="graph"]');
        if (graphTab) graphTab.click();
        const graphInput = document.getElementById('graphInput');
        if (graphInput) {
          if (mode === 'solve') {
            if (genSteps.length && genSteps[genSteps.length - 1].title === 'Despejes posibles (Solución)') {
              graphInput.value = genSteps[genSteps.length - 1].graphExpr || algebraExpr;
            } else if (algebraExpr.includes('=')) {
              const [l, r] = algebraExpr.split('=');
              graphInput.value = `(${l.trim()}) - (${r.trim()})`;
            } else {
              graphInput.value = algebraExpr;
            }
          } else {
            graphInput.value = algebraExpr;
          }
          document.getElementById('graphBtn').click();
        }
      });
    }

    if (mode !== 'solve') {
      genSteps = generateSteps(mode, algebraExpr, out);
    }
    
    if (genSteps.length > 0) {
      stepsEl.innerHTML = '<h4>Paso a paso</h4>';
      const container = document.createElement('div');
      container.className = 'steps-container';
      genSteps.forEach(s => container.appendChild(renderStep(s)));
      stepsEl.appendChild(container);
      stepsEl.classList.remove('d-none');
    } else {
      stepsEl.classList.add('d-none');
    }
  } catch (e) {
    result.textContent = 'Error: ' + e.message;
    result.className = 'math-result-display text-danger';
    stepsEl.classList.add('d-none');
  }
}

function insertMathSymbol(symbol) {
  const mfId = currentTab === 'algebra' ? 'algMathField' : (currentTab === 'graph' ? 'graphInput' : null);
  if (!mfId) return;
  const mf = document.getElementById(mfId);
  if (!mf) return;
  const map = {
    'sqrt': '\\sqrt{}', 'square': '^{2}', 'cube': '^{3}', 'power': '^{}',
    'frac': '\\frac{}{}', 'pi': '\\pi', 'infty': '\\infty', 'pm': '\\pm',
    'cdot': '\\cdot', 'alpha': '\\alpha', 'beta': '\\beta', 'theta': '\\theta',
    'delta': '\\delta', 'gamma': '\\gamma', 'lambda': '\\lambda', 'sigma': '\\sigma',
    'sum': '\\sum_{}^{}', 'int': '\\int_{}^{}', 'prod': '\\prod_{}^{}', 'lim': '\\lim_{}',
    'sin': '\\sin{}', 'cos': '\\cos{}', 'tan': '\\tan{}', 'log': '\\log{}', 'ln': '\\ln{}',
    'lparen': '(', 'rparen': ')', 'lbracket': '[', 'rbracket': ']',
    'lbrace': '{', 'rbrace': '}', 'equal': '=',
    'plus': '+', 'minus': '-', 'times': '\\cdot', 'divide': '/',
    'abs': '\\left| \\right|', 'binom': '\\binom{}{}', 'vector': '\\overrightarrow{}',
    'hat': '\\hat{}', 'bar': '\\bar{}', 'prime': "'",
  };
  const ins = map[symbol] || symbol;
  mf.focus();
  if (symbol === 'frac') {
    mf.executeCommand(['insert', '\\frac{#0}{#?}', {focus: true}]);
  } else if (symbol === 'sqrt') {
    mf.executeCommand(['insert', '\\sqrt{#0}', {focus: true}]);
  } else if (ins.includes('{}')) {
    mf.executeCommand(['insert', ins.replace('{}', '{#0}'), {focus: true}]);
  } else if (ins.includes('_{}^{}')) {
    mf.executeCommand(['insert', ins.replace('_{}^{}', '_{#0}^{#?}'), {focus: true}]);
  } else {
    mf.executeCommand(['insert', ins]);
  }
}

async function drawGraph() {
  const canvas = document.getElementById('graphCanvas');
  if (!canvas) return;
  const mf = document.getElementById('graphInput');
  let exprRaw = mf.value.trim() || 'x^2';
  
  let expr = exprRaw;
  if (mf.tagName && mf.tagName.toLowerCase() === 'math-field') {
    expr = mf.getValue('ascii-math') || parseLatexToAsciiMath(exprRaw);
    expr = expr.replace(/^[fy]\s*\(\s*x\s*\)\s*=\s*/i, '').replace(/^y\s*=\s*/i, '');
  }

  if (hasWolframKey()) {
    const plotUrl = await wolframPlot(expr);
    if (plotUrl) {
      const ctx = canvas.getContext('2d');
      const W = canvas.width = canvas.clientWidth;
      const H = canvas.height = canvas.clientHeight;
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = 'var(--bs-tertiary-bg, #f0f0f0)';
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = 'var(--bs-body-color, #000)';
      ctx.font = '14px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Cargando gráfica de Wolfram...', W / 2, H / 2);
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => { ctx.clearRect(0, 0, W, H); ctx.drawImage(img, 0, 0, W, H); };
      img.onerror = () => { ctx.clearRect(0, 0, W, H); drawGraphCanvas(canvas, expr); };
      img.src = plotUrl;
      return;
    }
  }
  drawGraphCanvas(canvas, expr);
}

function drawGraphCanvas(canvas, exprInput) {
  const ctx = canvas.getContext('2d');
  const W = canvas.width = canvas.clientWidth;
  const H = canvas.height = canvas.clientHeight;

  // 1. Parse Expressions
  function splitExpressions(str) {
    const result = [];
    let current = '';
    let depth = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str[i];
      if (char === '(' || char === '[' || char === '{') depth++;
      else if (char === ')' || char === ']' || char === '}') depth--;
      if (char === ',' && depth === 0) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    if (current.trim()) result.push(current.trim());
    return result;
  }

  const items = splitExpressions(exprInput);
  const parsed = [];
  
  for (let item of items) {
    if (!item) continue;
    const ptMatch = item.match(/^\s*\(([^,]+),\s*([^)]+)\)\s*$/);
    if (ptMatch) {
      try {
        const x = math.evaluate(ptMatch[1]);
        const y = math.evaluate(ptMatch[2]);
        if (isFinite(x) && isFinite(y)) {
           parsed.push({ type: 'point', x, y, label: item });
           continue;
        }
      } catch(e) {}
    }
    if (item.includes('=')) {
      const explicitMatch = item.match(/^(?:y|f\s*\(\s*x\s*\))\s*=\s*(.*)$/i);
      if (explicitMatch) {
         parsed.push({ type: 'explicit', expr: explicitMatch[1] });
      } else {
         const parts = item.split('=');
         if (parts.length === 2) {
           parsed.push({ type: 'implicit', expr: `(${parts[0].trim()}) - (${parts[1].trim()})` });
         }
      }
    } else {
      parsed.push({ type: 'explicit', expr: item });
    }
  }

  // 2. Bounds Calculation
  let xMin = -10, xMax = 10, yMin = -10, yMax = 10;
  const intercepts = [];
  for (const item of parsed) {
     if (item.type === 'point') {
        if (item.x < xMin + 2) xMin = Math.floor(item.x) - 4;
        if (item.x > xMax - 2) xMax = Math.ceil(item.x) + 4;
        if (item.y < yMin + 2) yMin = Math.floor(item.y) - 4;
        if (item.y > yMax - 2) yMax = Math.ceil(item.y) + 4;
     } else if (item.type === 'explicit') {
        try {
          const yInt = math.evaluate(item.expr, { x: 0 });
          if (isFinite(yInt)) intercepts.push({x: 0, y: yInt});
        } catch(e) {}
        let prev_px = null, prev_py = null;
        for (let i = 0; i <= 2000; i++) {
          const px = -100 + (i / 2000) * 200;
          try {
            const py = math.evaluate(item.expr, { x: px });
            if (prev_py !== null && ((prev_py > 0 && py <= 0) || (prev_py < 0 && py >= 0))) {
              if (py === 0) intercepts.push({x: px, y: 0});
              else if (prev_py !== 0) {
                const xRoot = px - py * (px - prev_px) / (py - prev_py);
                if (Math.abs(xRoot) > 1e-5) intercepts.push({x: xRoot, y: 0});
              }
            }
            prev_px = px; prev_py = py;
          } catch(e) { prev_py = null; }
        }
     }
  }

  const uniqueInts = [];
  for (const pt of intercepts) {
    if (!uniqueInts.some(u => Math.abs(u.x - pt.x) < 0.1 && Math.abs(u.y - pt.y) < 0.1)) uniqueInts.push(pt);
  }

  if (uniqueInts.length > 0) {
    const minXInt = Math.min(...uniqueInts.map(pt => pt.x));
    const maxXInt = Math.max(...uniqueInts.map(pt => pt.x));
    const minYInt = Math.min(...uniqueInts.map(pt => pt.y));
    const maxYInt = Math.max(...uniqueInts.map(pt => pt.y));
    if (minXInt < xMin + 2) xMin = Math.floor(minXInt) - 4;
    if (maxXInt > xMax - 2) xMax = Math.ceil(maxXInt) + 4;
    if (minYInt < yMin + 2) yMin = Math.floor(minYInt) - 4;
    if (maxYInt > yMax - 2) yMax = Math.ceil(maxYInt) + 4;
  }

  ctx.clearRect(0, 0, W, H);
  
  const originX = ((0 - xMin) / (xMax - xMin)) * W;
  const originY = ((yMax - 0) / (yMax - yMin)) * H;

  // Grid & Axes
  ctx.strokeStyle = 'var(--md-sys-color-surface-container-highest, #E6E0E9)'; 
  ctx.lineWidth = 0.5;
  for (let i = xMin; i <= xMax; i++) { 
    const x = ((i - xMin) / (xMax - xMin)) * W; 
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); 
  }
  for (let i = yMin; i <= yMax; i++) { 
    const y = ((yMax - i) / (yMax - yMin)) * H; 
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); 
  }
  ctx.strokeStyle = 'var(--md-sys-color-on-surface-variant, #49454F)'; 
  ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(originX, 0); ctx.lineTo(originX, H); ctx.stroke(); 
  ctx.beginPath(); ctx.moveTo(0, originY); ctx.lineTo(W, originY); ctx.stroke(); 

  // Ticks
  const xTick = (xMax - xMin) > 60 ? 10 : (xMax - xMin) > 30 ? 5 : 2;
  const yTick = (yMax - yMin) > 60 ? 10 : (yMax - yMin) > 30 ? 5 : 2;
  ctx.font = '11px Inter, sans-serif'; // Label Small
  ctx.fillStyle = 'var(--md-sys-color-on-surface-variant, #49454F)';
  ctx.textAlign = 'center'; ctx.textBaseline = 'top';
  for (let i = Math.ceil(xMin); i <= xMax; i++) { 
    if (i !== 0 && i % xTick === 0) {
      const x = ((i - xMin) / (xMax - xMin)) * W; 
      ctx.fillText(i, x, originY + 6);
      ctx.beginPath(); ctx.moveTo(x, originY - 4); ctx.lineTo(x, originY + 4); ctx.stroke();
    }
  }
  ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
  for (let i = Math.ceil(yMin); i <= yMax; i++) { 
    if (i !== 0 && i % yTick === 0) {
      const y = ((yMax - i) / (yMax - yMin)) * H; 
      ctx.fillText(i, originX - 6, y);
      ctx.beginPath(); ctx.moveTo(originX - 4, y); ctx.lineTo(originX + 4, y); ctx.stroke();
    }
  }
  ctx.textAlign = 'right'; ctx.textBaseline = 'top';
  ctx.fillText('0', originX - 6, originY + 6);

  // Drawing Loop
  const colors = ['var(--primary-color)', '#006A6A', '#B3261E', '#625B71']; // primary, tertiary, error, secondary
  let colorIdx = 0;
  
  for (const item of parsed) {
     const color = colors[colorIdx % colors.length];
     colorIdx++;
     
     if (item.type === 'point') {
        const sx = ((item.x - xMin) / (xMax - xMin)) * W;
        const sy = ((yMax - item.y) / (yMax - yMin)) * H;
        if (sx >= -10 && sx <= W + 10 && sy >= -10 && sy <= H + 10) {
          ctx.fillStyle = color;
          ctx.beginPath();
          ctx.arc(sx, sy, 5, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = 'var(--bs-body-color, #212529)';
          ctx.textAlign = 'left';
          ctx.textBaseline = 'bottom';
          ctx.fillText(item.label, sx + 8, sy - 8);
        }
     } 
     else if (item.type === 'explicit') {
        ctx.strokeStyle = color; 
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        let first = true;
        const steps = Math.max(800, W);
        for (let i = 0; i <= steps; i++) {
          const px = xMin + (i / steps) * (xMax - xMin);
          try {
            const py = math.evaluate(item.expr, { x: px });
            const sx = ((px - xMin) / (xMax - xMin)) * W;
            const sy = ((yMax - py) / (yMax - yMin)) * H;
            if (py < yMin || py > yMax || !isFinite(py) || !isFinite(sy)) { first = true; continue; }
            if (first) { ctx.moveTo(sx, sy); first = false; } else ctx.lineTo(sx, sy);
          } catch { first = true; }
        }
        ctx.stroke();
     }
     else if (item.type === 'implicit') {
        ctx.strokeStyle = color; 
        ctx.lineWidth = 2.5;
        try {
          const res = 150; 
          const dx = (xMax - xMin) / res;
          const dy = (yMax - yMin) / res;
          
          const vals = new Float32Array((res + 1) * (res + 1));
          const node = math.parse(item.expr);
          const code = node.compile();

          for (let i = 0; i <= res; i++) {
            const x = xMin + i * dx;
            for (let j = 0; j <= res; j++) {
              const y = yMin + j * dy;
              try { vals[j * (res + 1) + i] = code.evaluate({ x, y }); } catch(e) { vals[j * (res + 1) + i] = NaN; }
            }
          }

          ctx.beginPath();
          for (let i = 0; i < res; i++) {
            for (let j = 0; j < res; j++) {
              const idx = j * (res + 1) + i;
              const v00 = vals[idx];
              const v10 = vals[idx + 1];
              const v01 = vals[idx + res + 1];
              const v11 = vals[idx + res + 2];
              
              if (isNaN(v00) || isNaN(v10) || isNaN(v01) || isNaN(v11)) continue;
              
              const state = (v00 > 0 ? 1 : 0) | (v10 > 0 ? 2 : 0) | (v11 > 0 ? 4 : 0) | (v01 > 0 ? 8 : 0);
              if (state === 0 || state === 15) continue;
              
              const x0 = xMin + i * dx;
              const y0 = yMin + j * dy;
              const x1 = xMin + (i + 1) * dx;
              const y1 = yMin + (j + 1) * dy;
              
              const getT = (vA, vB) => Math.abs(vA) / (Math.abs(vA) + Math.abs(vB));
              
              const pts = [];
              if ((state & 1) !== ((state >> 1) & 1)) pts.push({ x: x0 + getT(v00, v10) * dx, y: y0 });
              if (((state >> 1) & 1) !== ((state >> 2) & 1)) pts.push({ x: x1, y: y0 + getT(v10, v11) * dy });
              if (((state >> 2) & 1) !== ((state >> 3) & 1)) pts.push({ x: x0 + getT(v01, v11) * dx, y: y1 });
              if (((state >> 3) & 1) !== (state & 1)) pts.push({ x: x0, y: y0 + getT(v00, v01) * dy });
              
              if (pts.length === 2) {
                ctx.moveTo(((pts[0].x - xMin) / (xMax - xMin)) * W, ((yMax - pts[0].y) / (yMax - yMin)) * H);
                ctx.lineTo(((pts[1].x - xMin) / (xMax - xMin)) * W, ((yMax - pts[1].y) / (yMax - yMin)) * H);
              } else if (pts.length === 4) {
                const vCenter = (v00 + v10 + v01 + v11) / 4;
                if ((vCenter > 0) === (v00 > 0)) {
                   ctx.moveTo(((pts[0].x - xMin) / (xMax - xMin)) * W, ((yMax - pts[0].y) / (yMax - yMin)) * H);
                   ctx.lineTo(((pts[3].x - xMin) / (xMax - xMin)) * W, ((yMax - pts[3].y) / (yMax - yMin)) * H);
                   ctx.moveTo(((pts[1].x - xMin) / (xMax - xMin)) * W, ((yMax - pts[1].y) / (yMax - yMin)) * H);
                   ctx.lineTo(((pts[2].x - xMin) / (xMax - xMin)) * W, ((yMax - pts[2].y) / (yMax - yMin)) * H);
                } else {
                   ctx.moveTo(((pts[0].x - xMin) / (xMax - xMin)) * W, ((yMax - pts[0].y) / (yMax - yMin)) * H);
                   ctx.lineTo(((pts[1].x - xMin) / (xMax - xMin)) * W, ((yMax - pts[1].y) / (yMax - yMin)) * H);
                   ctx.moveTo(((pts[2].x - xMin) / (xMax - xMin)) * W, ((yMax - pts[2].y) / (yMax - yMin)) * H);
                   ctx.lineTo(((pts[3].x - xMin) / (xMax - xMin)) * W, ((yMax - pts[3].y) / (yMax - yMin)) * H);
                }
              }
            }
          }
          ctx.stroke();
        } catch(e) {}
     }
  }

  // Intercept Dots (solo para explícitas para compatibilidad con la versión anterior)
  ctx.fillStyle = 'var(--md-sys-color-error, #B3261E)';
  for (const pt of uniqueInts) {
    const sx = ((pt.x - xMin) / (xMax - xMin)) * W;
    const sy = ((yMax - pt.y) / (yMax - yMin)) * H;
    if (sx >= -10 && sx <= W + 10 && sy >= -10 && sy <= H + 10) {
      ctx.beginPath();
      ctx.arc(sx, sy, 4, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.fillStyle = 'var(--bs-body-color, #212529)';
      ctx.textAlign = pt.x === 0 ? 'left' : 'center';
      ctx.textBaseline = pt.x === 0 ? 'middle' : 'bottom';
      const tX = pt.x === 0 ? sx + 8 : sx;
      const tY = pt.x === 0 ? sy : sy - 8;
      ctx.fillText(`(${Number.isInteger(pt.x) ? pt.x : parseFloat(pt.x.toFixed(2))}, ${Number.isInteger(pt.y) ? pt.y : parseFloat(pt.y.toFixed(2))})`, tX, tY);
      ctx.fillStyle = 'var(--md-sys-color-error, #B3261E)';
    }
  }
}

function doPhysics() {
  const sel = document.getElementById('physSelect');
  // Need to extract the actual value which might be within optgroups
  const idx = sel.value;
  const p = PHYSICS[idx];
  const inputs = document.querySelectorAll('.phys-input');
  const vals = {};
  let missing = [], filled = 0;
  
  // Reset all inputs styling first
  inputs.forEach(inp => {
    inp.style.backgroundColor = 'transparent';
    inp.style.borderColor = 'var(--md-sys-color-outline, #79747E)';
    inp.style.borderWidth = '1px';
    const v = inp.value.trim();
    if (v === '') { missing.push(inp.dataset.var); }
    else { vals[inp.dataset.var] = parseFloat(v); filled++; }
  });
  
  const resultDiv = document.getElementById('physResult');
  const stepsDiv = document.getElementById('physSteps');
  const emptyState = document.getElementById('physEmptyState');
  const resultContainer = document.getElementById('physResultContainer');

  if (missing.length === 0) {
    emptyState.classList.add('d-none');
    resultContainer.classList.remove('d-none');
    resultDiv.innerHTML = `<span class="text-danger"><span class="material-symbols-rounded align-middle me-1">error</span> Deja vacío el valor que quieres calcular</span>`;
    resultDiv.className = 'm3-physics-result-display fs-5';
    if(stepsDiv) stepsDiv.innerHTML = '';
    return;
  }
  
  if (missing.length > 1) {
    emptyState.classList.add('d-none');
    resultContainer.classList.remove('d-none');
    resultDiv.innerHTML = `<span class="text-danger"><span class="material-symbols-rounded align-middle me-1">error</span> Solo debes dejar vacío 1 valor a calcular. Faltan: ${missing.join(', ')}</span>`;
    resultDiv.className = 'm3-physics-result-display fs-5';
    if(stepsDiv) stepsDiv.innerHTML = '';
    return;
  }

  const targetVar = missing[0];
  if (!p.solve[targetVar]) {
    emptyState.classList.add('d-none');
    resultContainer.classList.remove('d-none');
    resultDiv.innerHTML = `<span class="text-danger"><span class="material-symbols-rounded align-middle me-1">error</span> No es posible despejar automáticamente "${p.vars[targetVar]}" con esta fórmula.</span>`;
    resultDiv.className = 'm3-physics-result-display fs-5';
    if(stepsDiv) stepsDiv.innerHTML = '';
    return;
  }

  try {
    // loading state
    const btn = document.getElementById('physBtn');
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = `<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Calculando...`;
    }

    setTimeout(() => {
      const resolver = p.solve[targetVar];
      const r = resolver.calc(vals);
      if (isNaN(r) || !isFinite(r)) throw new Error('Cálculo no válido (posible división por cero)');

      const formattedResult = typeof r === 'number' && !Number.isInteger(r) ? parseFloat(r.toFixed(6)) : r;
      
      emptyState.classList.add('d-none');
      resultContainer.classList.remove('d-none');
      
      const targetInput = document.querySelector(`.phys-input[data-var="${targetVar}"]`);
      if (targetInput) {
        targetInput.value = formattedResult;
        targetInput.style.backgroundColor = 'var(--md-sys-color-secondary-container, #E8DEF8)';
        targetInput.style.borderColor = 'var(--md-sys-color-secondary, #625B71)';
        targetInput.style.borderWidth = '2px';
      }

      resultDiv.innerHTML = `<math-field read-only style="background: transparent; border: none; outline: none; pointer-events: none; margin: 0 auto;">${targetVar} = ${formattedResult}</math-field>`;
      resultDiv.className = 'm3-physics-result-display';

      if (stepsDiv) {
        let subTex = resolver.tex;
        for (const [k, val] of Object.entries(vals).sort((x,y) => y[0].length - x[0].length)) {
          if (val !== undefined && val !== null) {
            const regex = new RegExp(`(?<![a-zA-Z\\\\\\\\\\\\\\\\])${k}(?![a-zA-Z])`, 'g');
            subTex = subTex.replace(regex, val);
          }
        }

        const stepsData = [
          { num: 1, title: 'Fórmula original', steps: [{ desc: '', tex: p.formula }] },
          { num: 2, title: `Despejar ${p.vars[targetVar]}`, steps: [{ desc: 'Fórmula reestructurada:', tex: resolver.tex }] },
          { num: 3, title: 'Sustitución y cálculo', steps: [
              { desc: `Valores: ${Object.entries(vals).filter(([k, v]) => v !== undefined).map(([k, v]) => `${k} = ${v}`).join(', ')}`, tex: subTex },
              { desc: 'Resultado final:', tex: `${targetVar} = ${formattedResult}` }
          ]}
        ];

        stepsDiv.innerHTML = '<h6 class="fw-semibold mb-2 step-section-title"><span class="material-symbols-rounded me-1" style="color: var(--primary-color);">format_list_numbered</span>Paso a paso</h6>';
        const container = document.createElement('div');
        container.className = 'steps-container';
        stepsData.forEach(s => container.appendChild(renderStep(s)));
        stepsDiv.appendChild(container);
      }
      
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = `<span class="material-symbols-rounded" style="font-size: 1.2rem;">calculate</span> Calcular`;
      }
    }, 300);
  } catch(e) {
    emptyState.classList.add('d-none');
    resultContainer.classList.remove('d-none');
    resultDiv.innerHTML = `<span class="text-danger"><span class="material-symbols-rounded align-middle me-1">error</span> Error en el cálculo: ${e.message}</span>`;
    resultDiv.className = 'm3-physics-result-display fs-5';
    if(stepsDiv) stepsDiv.innerHTML = '';
    
    const btn = document.getElementById('physBtn');
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = `<span class="material-symbols-rounded" style="font-size: 1.2rem;">calculate</span> Calcular`;
    }
  }
}

function renderCalcPanel() {
  const layout = [['(',')','C','⌫'],['7','8','9','÷'],['4','5','6','×'],['1','2','3','-'],['0','.','π','+'],['sin','cos','tan','='],['sqrt','log','ln','^']];
  return `
    <div class="math-display" id="mathExpr"></div>
    <div class="math-display math-result" id="mathDisplay">0</div>
    <input type="text" id="mathInput" class="form-control form-control-sm mb-3" placeholder="Escribe una expresión (ej: 2+2*5)" />
    <div class="math-grid">
      ${layout.map(r => r.map(k => `<button class="math-grid-btn ${k === '=' ? 'math-eq' : k === 'C' || k === '⌫' ? 'math-clear' : ''}" data-key="${k}">${k}</button>`).join('')).join('')}
    </div>`;
}

function handlePhysicsNLP() {
  const text = document.getElementById('physTextInput').value.trim().toLowerCase();
  if (!text) return;

  const extracted = {};
  
  // 1. Extraer números con unidades
  const regexNum = /(-?[\d.]+)\s*(m\/s\^?2|m\/s|s|segundos|m|metros|kg|kilos|n|newtons|j|joules|v|voltios|a|amperios|ohm|ohmios|hz|w|watts)\b/g;
  let match;
  while ((match = regexNum.exec(text)) !== null) {
    const val = parseFloat(match[1]);
    const unit = match[2];
    
    if (unit.includes('m/s2') || unit.includes('m/s^2')) extracted.a = val;
    else if (unit === 'm/s') {
      const context = text.substring(Math.max(0, match.index - 25), match.index);
      if (context.includes('inicial') || context.includes('de ') || context.includes('arranca')) extracted.u = val;
      else if (context.includes('final') || context.includes('a ') || context.includes('alcanza')) extracted.v = val;
      else if (!extracted.u) extracted.u = val; 
      else extracted.v = val;
    }
    else if (unit === 's' || unit === 'segundos') extracted.t = val;
    else if (unit === 'm' || unit === 'metros') {
      if (text.includes('altura')) extracted.h = val;
      else if (text.includes('distancia')) extracted.d = val;
      else extracted.s = val; // default to cinemática distancia
    }
    else if (unit === 'kg' || unit === 'kilos') extracted.m = val;
    else if (unit === 'n' || unit === 'newtons') extracted.F = val;
    else if (unit === 'j' || unit === 'joules') {
      if (text.includes('cinetica') || text.includes('cinética')) extracted.KE = val;
      else if (text.includes('potencial')) extracted.PE = val;
      else extracted.W = val; // trabajo
    }
    else if (unit === 'v' || unit === 'voltios') extracted.V = val;
    else if (unit === 'a' || unit === 'amperios') extracted.I = val;
    else if (unit === 'ohm' || unit === 'ohmios') extracted.R = val;
  }
  
  if (text.includes('reposo')) extracted.u = 0;
  if (text.includes('caida libre') || text.includes('caída libre')) { extracted.u = 0; extracted.a = 9.81; }

  // 2. Determinar la incógnita (target)
  let target = null;
  const targetWords = ['calcula', 'calcular', 'halla', 'hallar', 'cual es', 'cuál es', 'determina', 'determinar', 'que '];
  for (const w of targetWords) {
    const idx = text.indexOf(w);
    if (idx !== -1) {
      const after = text.substring(idx);
      if (after.includes('velocidad final')) target = 'v';
      else if (after.includes('velocidad inicial')) target = 'u';
      else if (after.includes('tiempo')) target = 't';
      else if (after.includes('aceleracion') || after.includes('aceleración')) target = 'a';
      else if (after.includes('distancia')) target = 's';
      else if (after.includes('fuerza')) target = 'F';
      else if (after.includes('masa')) target = 'm';
      else if (after.includes('energia') || after.includes('energía')) {
         if (after.includes('cinetica')) target = 'KE';
         else if (after.includes('potencial')) target = 'PE';
      }
      else if (after.includes('trabajo')) target = 'W';
      else if (after.includes('voltaje')) target = 'V';
      else if (after.includes('corriente')) target = 'I';
      else if (after.includes('resistencia')) target = 'R';
    }
  }

  // 3. Encontrar la mejor fórmula
  let bestFormulaIdx = -1;
  let bestScore = -1;

  for (let i = 0; i < PHYSICS.length; i++) {
    const pVars = Object.keys(PHYSICS[i].vars);
    if (target && !pVars.includes(target)) continue; // Must contain target
    
    let score = 0;
    let missingVars = 0;
    for (const pv of pVars) {
      if (extracted[pv] !== undefined) score++;
      else if (pv !== target) missingVars++;
    }
    
    // Valid formula if we have exactly 1 missing variable (the target) or exactly 1 missing overall
    if (missingVars === 0 || (missingVars === 1 && !target)) {
      if (score > bestScore) {
        bestScore = score;
        bestFormulaIdx = i;
        if (!target) {
           // guess target if not explicitly found in text
           target = pVars.find(v => extracted[v] === undefined);
        }
      }
    }
  }

  if (bestFormulaIdx !== -1) {
    document.getElementById('physSelect').value = bestFormulaIdx;
    document.getElementById('physSelect').dispatchEvent(new Event('change')); // trigger render of inputs
    
    // Fill inputs
    setTimeout(() => {
      const inputs = document.querySelectorAll('.phys-input');
      inputs.forEach(inp => {
        const v = inp.dataset.var;
        if (v === target) {
          inp.value = ''; // leave empty
        } else if (extracted[v] !== undefined) {
          inp.value = extracted[v];
        } else if (PHYSICS[bestFormulaIdx].defaultVars && PHYSICS[bestFormulaIdx].defaultVars[v] !== undefined) {
          // let default remain empty or prefilled
        }
      });
      // Auto-calculate
      document.getElementById('physBtn').click();
    }, 50);
  } else {
    const emptyState = document.getElementById('physEmptyState');
    const resultContainer = document.getElementById('physResultContainer');
    const resultDiv = document.getElementById('physResult');
    
    if (emptyState) emptyState.classList.add('d-none');
    if (resultContainer) resultContainer.classList.remove('d-none');
    
    resultDiv.innerHTML = `<span class="text-danger"><span class="material-symbols-rounded align-middle me-1">error</span> No se detectó ninguna fórmula coincidente con los datos. Intenta ser más explícito.</span>`;
    resultDiv.className = 'm3-physics-result-display fs-5';
  }
}

function renderPhysicsPanel() {
  // Construir las opciones agrupadas por categoría
  const categories = {};
  PHYSICS.forEach((p, idx) => {
    if (!categories[p.category]) categories[p.category] = [];
    categories[p.category].push({ idx, name: p.name });
  });
  
  let optionsHtml = '';
  for (const cat in categories) {
    optionsHtml += `<optgroup label="${cat}" style="color: var(--primary-color); font-weight: 600;">`;
    categories[cat].forEach(p => {
      optionsHtml += `<option value="${p.idx}">${p.name}</option>`;
    });
    optionsHtml += `</optgroup>`;
  }

  const initialFormula = PHYSICS[0];

  return `
    <!-- Lector Mágico -->
    <div class="m3-card-primary-container p-4 mb-4">
      <h6 class="fw-bold mb-2" style="color: var(--md-sys-color-on-primary-container, #21005D); font-size: 1.1rem;">
        <span class="material-symbols-rounded me-2" style="color: var(--primary-color); vertical-align: bottom;">auto_awesome</span>Lector de Problemas Mágico
      </h6>
      <p class="small mb-3" style="color: var(--md-sys-color-on-primary-container, #21005D); opacity: 0.8;">
        Escribe tu problema de física tal como viene en tu tarea. El sistema extraerá los datos y seleccionará la fórmula por ti.
      </p>
      
      <div style="position: relative; width: 100%; margin-bottom: 12px;">
        <div style="font-size: 0.75rem; color: var(--primary-color); position: absolute; top: -10px; left: 12px; background: var(--md-sys-color-primary-container, #EADDFF); padding: 0 4px; z-index: 2;">
          Escribe tu problema aquí...
        </div>
        <textarea class="form-control" id="physTextInput" rows="3" style="background: var(--md-sys-color-surface, #FFFBFE); border: 1px solid var(--md-sys-color-outline, #79747E); border-radius: 8px; padding: 12px; font-style: italic; color: var(--md-sys-color-on-surface, #1C1B1F);" onfocus="this.style.border='2px solid var(--primary-color)'; this.style.outline='none';" onblur="this.style.border='1px solid var(--md-sys-color-outline, #79747E)';" placeholder="Ej: Un auto parte del reposo y acelera a 4 m/s2 durante 10 segundos, calcula la velocidad final..."></textarea>
      </div>
      
      <div class="d-flex justify-content-end">
        <button class="btn m3-math-action-primary" id="physNlpBtn" style="border-radius: 24px; padding: 10px 24px; font-weight: 500; display: inline-flex; align-items: center; gap: 8px;">
          <span class="material-symbols-rounded" style="font-size: 1.2rem;">magic_button</span> Autocompletar y Resolver
        </button>
      </div>
    </div>

    <!-- Selector de Fórmulas -->
    <div class="mb-4">
      <label class="form-label mb-1" style="font-size: 13px; color: var(--md-sys-color-on-surface-variant, #49454F);">¿Qué fórmula necesitas?</label>
      <div style="position: relative;">
        <select class="form-select" id="physSelect" style="background-color: var(--md-sys-color-surface-container, #F3EDF7); border: none; border-bottom: 2px solid var(--md-sys-color-on-surface-variant, #49454F); border-radius: 4px 4px 0 0; padding: 12px; font-size: 1rem; color: var(--md-sys-color-on-surface, #1C1B1F); cursor: pointer;">
          ${optionsHtml}
        </select>
      </div>
      
      <div class="mt-3 p-3 text-center" style="background: var(--md-sys-color-surface-container-highest, #E6E0E9); border-radius: 12px; position: relative;">
        <span class="badge" style="position: absolute; top: 12px; left: 12px; background: var(--md-sys-color-secondary-container, #E8DEF8); color: var(--md-sys-color-on-secondary-container, #1D192B); font-weight: 500;" id="physCategoryBadge">${initialFormula.category}</span>
        <math-field id="physFormulaDisplay" style="font-size: 1.2rem; background: transparent; border: none; outline: none; pointer-events: none; margin-top: 10px;" read-only>${initialFormula.formula}</math-field>
      </div>
    </div>

    <!-- Formulario de Variables -->
    <div class="row g-3 mb-4" id="physInputs">
      ${Object.entries(initialFormula.vars).map(([k, v]) => {
        const parts = v.match(/^(.*?)\\s*\\((.*?)\\)$/);
        const name = parts ? parts[1] : v;
        const unit = parts ? parts[2] : '';
        return '<div class="col-12 col-md-6">' +
          '<div style="position: relative; width: 100%;">' +
            '<div style="font-size: 0.75rem; color: var(--md-sys-color-on-surface-variant, #49454F); position: absolute; top: -10px; left: 12px; background: var(--md-sys-color-surface, #FFFBFE); padding: 0 4px; z-index: 2;">' + name + ' (' + k + ')</div>' +
            '<input type="number" class="form-control phys-input" data-var="' + k + '" style="border: 1px solid var(--md-sys-color-outline, #79747E); border-radius: 8px; padding: 12px; padding-right: 48px; background: transparent; color: var(--md-sys-color-on-surface, #1C1B1F);" placeholder="Dejar vacío para calcular" step="any" />' +
            (unit ? '<span style="position: absolute; right: 16px; top: 12px; color: var(--md-sys-color-on-surface-variant, #49454F); font-size: 0.9rem;">' + unit + '</span>' : '') +
          '</div>' +
        '</div>';
      }).join('')}
    </div>

    <button class="btn m3-math-action-primary w-100 mb-4" id="physBtn" style="border-radius: 24px; padding: 12px; font-weight: 500; display: inline-flex; justify-content: center; align-items: center; gap: 8px; font-size: 15px;">
      <span class="material-symbols-rounded" style="font-size: 1.2rem;">calculate</span> Calcular
    </button>

    <!-- Área de Resultados -->
    <div id="physResultArea">
      <!-- Empty State -->
      <div id="physEmptyState" class="text-center py-5" style="color: var(--md-sys-color-on-surface-variant, #49454F);">
        <span class="material-symbols-rounded mb-3" style="font-size: 48px; opacity: 0.8;">functions</span>
        <h6 class="fw-medium mb-1">El resultado aparecerá aquí</h6>
        <p class="small opacity-75 mb-0">Completa las variables conocidas y presiona Calcular</p>
      </div>
      
      <!-- Result Container -->
      <div id="physResultContainer" class="m3-card-surface-container p-4 d-none">
        <div id="physSteps" class="mb-3" style="color: var(--md-sys-color-on-surface, #1C1B1F); font-family: 'Times New Roman', serif; font-size: 1.1rem;"></div>
        <div class="m3-physics-result-display" id="physResult"></div>
      </div>
    </div>`;
}

const PERIODIC_TABLE = {
  H: 1.008, He: 4.0026, Li: 6.94, Be: 9.0122, B: 10.81, C: 12.011, N: 14.007, O: 15.999, F: 18.998,
  Ne: 20.180, Na: 22.990, Mg: 24.305, Al: 26.982, Si: 28.085, P: 30.974, S: 32.06, Cl: 35.45,
  Ar: 39.95, K: 39.098, Ca: 40.078, Sc: 44.956, Ti: 47.867, V: 50.942, Cr: 51.996, Mn: 54.938,
  Fe: 55.845, Co: 58.933, Ni: 58.693, Cu: 63.546, Zn: 65.38, Ga: 69.723, Ge: 72.630, As: 74.922,
  Se: 78.971, Br: 79.904, Kr: 83.798, Rb: 85.468, Sr: 87.62, Y: 88.906, Zr: 91.224, Nb: 92.906,
  Mo: 95.95, Tc: 98, Ru: 101.07, Rh: 102.91, Pd: 106.42, Ag: 107.87, Cd: 112.41, In: 114.82,
  Sn: 118.71, Sb: 121.76, Te: 127.60, I: 126.90, Xe: 131.29, Cs: 132.91, Ba: 137.33, La: 138.91,
  Ce: 140.12, Pr: 140.91, Nd: 144.24, Pm: 145, Sm: 150.36, Eu: 151.96, Gd: 157.25, Tb: 158.93,
  Dy: 162.50, Ho: 164.93, Er: 167.26, Tm: 168.93, Yb: 173.05, Lu: 174.97, Hf: 178.49, Ta: 180.95,
  W: 183.84, Re: 186.21, Os: 190.23, Ir: 192.22, Pt: 195.08, Au: 196.97, Hg: 200.59, Tl: 204.38,
  Pb: 207.2, Bi: 208.98, Po: 209, At: 210, Rn: 222, Fr: 223, Ra: 226, Ac: 227, Th: 232.04, Pa: 231.04, U: 238.03
};

const COMMON_CHEM_NAMES = {
  "agua": "H2O",
  "sal": "NaCl",
  "sal de mesa": "NaCl",
  "glucosa": "C6H12O6",
  "azucar": "C12H22O11",
  "azúcar": "C12H22O11",
  "sacarosa": "C12H22O11",
  "aspirina": "C9H8O4",
  "bicarbonato": "NaHCO3",
  "amoniaco": "NH3",
  "amoniaco líquido": "NH3",
  "metano": "CH4",
  "dioxido de carbono": "CO2",
  "dióxido de carbono": "CO2",
  "monoxido de carbono": "CO",
  "monóxido de carbono": "CO",
  "acido sulfurico": "H2SO4",
  "ácido sulfúrico": "H2SO4",
  "acido clorhidrico": "HCl",
  "ácido clorhídrico": "HCl",
  "sosa caustica": "NaOH",
  "sosa cáustica": "NaOH",
  "hidroxido de sodio": "NaOH",
  "hidróxido de sodio": "NaOH",
  "etanol": "C2H5OH",
  "alcohol": "C2H5OH",
  "peroxido de hidrogeno": "H2O2",
  "peróxido de hidrógeno": "H2O2",
  "agua oxigenada": "H2O2",
  "ozono": "O3",
  "yeso": "CaSO4*2H2O",
  "dos hidrogenos y un oxigeno": "H2O",
  "dos hidrógenos y un oxígeno": "H2O",
  "un carbono y dos oxigenos": "CO2",
  "un carbono y dos oxígenos": "CO2"
};

function formatSubscripts(formula) {
  const map = { '0':'₀','1':'₁','2':'₂','3':'₃','4':'₄','5':'₅','6':'₆','7':'▷','8':'₈','9':'₉' };
  // Quick fix for the character 7 -> ₇
  map['7'] = '₇';
  return formula.replace(/[0-9]/g, m => map[m]);
}

function resolveChemFormula(input) {
  let cleanInput = input.trim().toLowerCase();
  if (COMMON_CHEM_NAMES[cleanInput]) {
    return COMMON_CHEM_NAMES[cleanInput];
  }
  // Remove spaces for standard formulas
  let formula = input.replace(/\s+/g, '');
  // Capitalize first letter of elements properly if typed in lowercase (basic heuristic for h2o -> H2O)
  if (/^[a-z0-9]+$/.test(formula)) {
    formula = formula.replace(/[a-z]+/g, m => m.charAt(0).toUpperCase() + m.slice(1));
  }
  return formula;
}

function parseChemicalFormula(formula) {
  let [mainPart, hydratePart] = formula.split(/\*|\./); 
  function parsePart(str) {
    let counts = {};
    let stack = [counts];
    let i = 0;
    while(i < str.length) {
      const c = str[i];
      if (c === '(' || c === '[') {
        const newObj = {};
        stack[stack.length - 1]['_group_' + i] = newObj; 
        stack.push(newObj);
        i++;
      } else if (c === ')' || c === ']') {
        const top = stack.pop();
        i++;
        let numStr = '';
        while(i < str.length && /[0-9]/.test(str[i])) { numStr += str[i]; i++; }
        top._multiplier = numStr ? parseInt(numStr) : 1; 
      } else if (/[A-Z]/.test(c)) {
        let elem = c;
        i++;
        if (i < str.length && /[a-z]/.test(str[i])) { elem += str[i]; i++; }
        let numStr = '';
        while(i < str.length && /[0-9]/.test(str[i])) { numStr += str[i]; i++; }
        stack[stack.length - 1][elem] = (stack[stack.length - 1][elem] || 0) + (numStr ? parseInt(numStr) : 1);
      } else {
        i++; 
      }
    }
    function flatten(obj, multiplier) {
      let res = {};
      for (const k in obj) {
        if (k === '_multiplier') continue;
        if (k.startsWith('_group_')) {
          const sub = flatten(obj[k], multiplier * (obj[k]._multiplier || 1));
          for (const subK in sub) res[subK] = (res[subK] || 0) + sub[subK];
        } else {
          res[k] = (res[k] || 0) + obj[k] * multiplier;
        }
      }
      return res;
    }
    return flatten(counts, 1);
  }
  const result = parsePart(mainPart);
  if (hydratePart) {
    hydratePart = hydratePart.trim();
    let numStr = '';
    let j = 0;
    while(j < hydratePart.length && /[0-9]/.test(hydratePart[j])) { numStr += hydratePart[j]; j++; }
    const mult = numStr ? parseInt(numStr) : 1;
    const hyd = parsePart(hydratePart.substring(j));
    for (const k in hyd) result[k] = (result[k] || 0) + hyd[k] * mult;
  }
  return result;
}

function renderChemistryPanel() {
  return `
    <div class="row g-4">
      <div class="col-md-6">
        <div class="card h-100 border-0 shadow-sm" style="background: linear-gradient(145deg, #f8f9fa, #ffffff);">
          <div class="card-body p-4">
            <h5 class="card-title fw-bold text-indigo mb-3"><span class="material-symbols-rounded me-2 align-text-bottom">science</span>¿De qué está hecho este compuesto?</h5>
            
            <div class="mb-4">
              <input type="text" id="chemFormulaInput" class="form-control form-control-lg border-2" placeholder="Ej: H2O, glucosa, sal..." style="font-size: 1.25rem;">
              <small class="text-secondary mt-2 d-block">Prueba: agua · sal · glucosa · aspirina</small>
              <div id="chemFormulaError" class="invalid-feedback"></div>
            </div>
            
            <button class="btn btn-indigo btn-lg w-100 fw-bold shadow-sm" id="chemMolarBtn" style="border-radius: 0.5rem;">Calcular</button>
            
            <div id="chemMolarResultContainer" class="mt-4 p-4 rounded d-none" style="background: rgba(102, 16, 242, 0.1); border-left: 4px solid var(--bs-indigo); transition: opacity 0.3s ease;">
              <div id="chemMolarResult" class="fs-4 fw-bold text-indigo mb-2"></div>
              <div id="chemMolarBreakdown" class="text-body-secondary" style="font-size: 1.1rem; line-height: 1.6;"></div>
            </div>
            
            <hr class="my-5 opacity-25">
            
            <h5 class="fw-bold text-indigo mb-4"><span class="material-symbols-rounded me-2 align-text-bottom">swap_horiz</span>¿Cuánto pesa o cuántos moles tengo?</h5>
            
            <div class="row g-3 align-items-center mb-4">
              <div class="col-12 col-sm-4">
                <label class="fw-semibold text-secondary mb-1">Masa Molar (g/mol)</label>
                <input type="number" id="chemConvMolarMass" class="form-control form-control-lg" step="any" placeholder="Masa" style="min-height: 48px;">
              </div>
              <div class="col-12 col-sm-4">
                <label class="fw-semibold text-secondary mb-1">Gramos (g)</label>
                <input type="number" id="chemConvGrams" class="form-control form-control-lg" step="any" placeholder="g" style="min-height: 48px;">
              </div>
              <div class="col-12 col-sm-4">
                <label class="fw-semibold text-secondary mb-1">Moles (mol)</label>
                <input type="number" id="chemConvMoles" class="form-control form-control-lg" step="any" placeholder="mol" style="min-height: 48px;">
              </div>
            </div>
            
            <div class="text-center p-3 rounded" style="background: var(--bs-gray-200);">
              <span id="chemConvResult" class="fs-3 fw-bold text-indigo">—</span>
            </div>
            <div class="mt-2 text-center text-secondary small" id="chemConvHelper">Llena 2 campos para calcular el tercero automáticamente.</div>
          </div>
        </div>
      </div>
      
      <div class="col-md-6">
        <div class="card h-100 border-0 shadow-sm">
          <div class="card-body p-4">
            <h5 class="card-title fw-bold text-indigo mb-3"><span class="material-symbols-rounded me-2 align-text-bottom">air</span>Gases Ideales (PV = nRT)</h5>
            <p class="text-secondary mb-4">Deja un campo vacío para despejarlo. (R = 0.08206 L·atm/(mol·K))</p>
            <div class="row g-3 mb-4">
              <div class="col-6">
                <label class="fw-semibold text-secondary mb-1">Presión (P) [atm]</label>
                <input type="number" id="chemGasP" class="form-control form-control-lg" step="any" placeholder="?">
              </div>
              <div class="col-6">
                <label class="fw-semibold text-secondary mb-1">Volumen (V) [L]</label>
                <input type="number" id="chemGasV" class="form-control form-control-lg" step="any" placeholder="?">
              </div>
              <div class="col-6">
                <label class="fw-semibold text-secondary mb-1">Moles (n) [mol]</label>
                <input type="number" id="chemGasn" class="form-control form-control-lg" step="any" placeholder="?">
              </div>
              <div class="col-6">
                <label class="fw-semibold text-secondary mb-1">Temp (T) [K]</label>
                <input type="number" id="chemGasT" class="form-control form-control-lg" step="any" placeholder="?">
              </div>
            </div>
            <button class="btn btn-indigo btn-lg w-100 fw-bold mb-3 shadow-sm" id="chemGasBtn" style="border-radius: 0.5rem;">Resolver Ecuación</button>
            <div id="chemGasResult" class="p-4 bg-body-tertiary rounded text-center fs-4 text-indigo fw-bold" style="min-height:80px; transition: opacity 0.3s ease;">—</div>
          </div>
        </div>
      </div>
    </div>
  `;
}

const MATH_TOOLBAR_HTML = `
    <div class="math-keyboard-container" style="overflow-x: auto; white-space: nowrap; padding-bottom: 8px;">
      <!-- Grupo A: Estructuras -->
      <div class="d-inline-flex flex-column align-items-center me-2">
        <div class="d-flex">
          <button class="m3-math-btn m3-math-group-a math-tb-btn" data-insert="square" title="x²">x²</button>
          <button class="m3-math-btn m3-math-group-a math-tb-btn" data-insert="cube" title="x³">x³</button>
          <button class="m3-math-btn m3-math-group-a math-tb-btn" data-insert="power" title="xⁿ">xⁿ</button>
        </div>
        <div class="d-flex">
          <button class="m3-math-btn m3-math-group-a math-tb-btn" data-insert="frac" title="a/b">a/b</button>
          <button class="m3-math-btn m3-math-group-a math-tb-btn" data-insert="sqrt" title="√">√</button>
          <button class="m3-math-btn m3-math-group-a math-tb-btn" data-insert="binom" title="binom">C(n,k)</button>
        </div>
      </div>
      
      <!-- Grupo B: Operadores -->
      <div class="d-inline-flex flex-column align-items-center me-2">
        <div class="d-flex">
          <button class="m3-math-btn m3-math-group-b math-tb-btn" data-insert="sum" title="Σ">Σ</button>
          <button class="m3-math-btn m3-math-group-b math-tb-btn" data-insert="int" title="∫">∫</button>
          <button class="m3-math-btn m3-math-group-b math-tb-btn" data-insert="lim" title="lim">lim</button>
        </div>
        <div class="d-flex">
          <button class="m3-math-btn m3-math-group-b math-tb-btn" data-insert="pm" title="±">±</button>
          <button class="m3-math-btn m3-math-group-b math-tb-btn" data-insert="infty" title="∞">∞</button>
          <button class="m3-math-btn m3-math-group-b math-tb-btn" data-insert="cdot" title="·">·</button>
        </div>
      </div>
      
      <!-- Grupo D: Variables -->
      <div class="d-inline-flex flex-column align-items-center me-2">
        <div class="d-flex">
          <button class="m3-math-btn m3-math-group-d math-tb-btn" data-insert="x" title="x">x</button>
          <button class="m3-math-btn m3-math-group-d math-tb-btn" data-insert="y" title="y">y</button>
        </div>
        <div class="d-flex">
          <button class="m3-math-btn m3-math-group-d math-tb-btn" data-insert="z" title="z">z</button>
          <button class="m3-math-btn m3-math-group-b math-tb-btn" data-insert="pi" title="π">π</button>
        </div>
      </div>
      
      <!-- Funciones Trig/Log -->
      <div class="d-inline-flex flex-column align-items-center me-2">
        <div class="d-flex">
          <button class="m3-math-btn m3-math-group-b math-tb-btn" data-insert="sin" title="sin">sin</button>
          <button class="m3-math-btn m3-math-group-b math-tb-btn" data-insert="cos" title="cos">cos</button>
          <button class="m3-math-btn m3-math-group-b math-tb-btn" data-insert="tan" title="tan">tan</button>
        </div>
        <div class="d-flex">
          <button class="m3-math-btn m3-math-group-b math-tb-btn" data-insert="log" title="log">log</button>
          <button class="m3-math-btn m3-math-group-b math-tb-btn" data-insert="ln" title="ln">ln</button>
          <button class="m3-math-btn m3-math-group-b math-tb-btn" data-insert="equal" title="=">=</button>
        </div>
      </div>
    </div>
    
    <!-- Grupo C: Griegas -->
    <div class="mt-1 mb-2 ms-1">
      <div style="font-size: 0.7rem; color: var(--md-sys-color-on-surface-variant, #49454F); margin-bottom: 2px;">Letras griegas</div>
      <div class="d-flex flex-wrap">
        <button class="m3-math-btn m3-math-group-c math-tb-btn" data-insert="alpha" title="α">α</button>
        <button class="m3-math-btn m3-math-group-c math-tb-btn" data-insert="beta" title="β">β</button>
        <button class="m3-math-btn m3-math-group-c math-tb-btn" data-insert="theta" title="θ">θ</button>
        <button class="m3-math-btn m3-math-group-c math-tb-btn" data-insert="delta" title="δ">δ</button>
        <button class="m3-math-btn m3-math-group-c math-tb-btn" data-insert="lambda" title="λ">λ</button>
        <button class="m3-math-btn m3-math-group-c math-tb-btn" data-insert="sigma" title="σ">σ</button>
      </div>
    </div>
    
    <!-- Grupo E: Delimitadores -->
    <div class="d-flex flex-wrap mb-2">
      <button class="m3-math-btn m3-math-group-e math-tb-btn" data-insert="lparen" title="(">(</button>
      <button class="m3-math-btn m3-math-group-e math-tb-btn" data-insert="rparen" title=")">)</button>
      <button class="m3-math-btn m3-math-group-e math-tb-btn" data-insert="lbracket" title="[">[</button>
      <button class="m3-math-btn m3-math-group-e math-tb-btn" data-insert="rbracket" title="]">]</button>
      <button class="m3-math-btn m3-math-group-e math-tb-btn" data-insert="lbrace" title="{">{</button>
      <button class="m3-math-btn m3-math-group-e math-tb-btn" data-insert="rbrace" title="}">}</button>
    </div>
  `;

export function renderMathPanel() {
  const section = document.getElementById('mathSection');
  if (!section) return;

  section.innerHTML = `
    <div>
      <h2 class="fw-bold mb-3"><span class="material-symbols-rounded me-2 text-indigo">calculate</span>Matemáticas</h2>
      
      <!-- M3 Secondary Navigation Tabs -->
      <div class="math-tabs-container">
        <button class="math-subtab active" data-tab="calc"><span class="material-symbols-rounded me-2">calculate</span>Calculadora</button>
        <button class="math-subtab" data-tab="algebra"><span class="material-symbols-rounded me-2">function</span>Álgebra</button>
        <button class="math-subtab" data-tab="graph"><span class="material-symbols-rounded me-2">show_chart</span>Graficar</button>
      </div>

      <div id="mathPanelCalc" class="math-panel"><div class="row g-4"><div class="col-md-7"><div class="card border-0 shadow-sm"><div class="card-body p-4">${renderCalcPanel()}</div></div></div><div class="col-md-5"><div class="card h-100 border-0 shadow-sm"><div class="card-body p-4"><h6 class="fw-semibold mb-3"><span class="material-symbols-rounded me-2">history</span>Historial</h6><div id="mathHistory"></div></div></div></div></div></div>

      <div id="mathPanelAlgebra" class="math-panel d-none">
        <div class="card border-0 shadow-sm"><div class="card-body p-4">
          
          <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
            <select class="form-select w-auto bg-light border-0 fw-bold" id="algMode" style="color: var(--primary-color);">
              <option value="solve">Resolver ecuación</option>
              <option value="simplify">Simplificar</option>
              <option value="expand">Expandir</option>
              <option value="factor">Factorizar</option>
              <option value="derive">Derivar</option>
              <option value="integrate">Integrar</option>
              <option value="eval">Evaluar</option>
            </select>
            
            <div class="d-flex gap-2 justify-content-end">
              <button class="m3-math-btn m3-math-btn-pill m3-math-action-wolfram d-none" id="wolframBadge" style="height: 40px;"><span class="material-symbols-rounded me-1" style="font-size: 1.1rem;">smart_toy</span>Wolfram</button>
              <button class="m3-math-btn m3-math-btn-pill m3-math-action-primary" id="algBtn" style="height: 40px;"><span class="material-symbols-rounded me-1" style="font-size: 1.1rem;">calculate</span>Calcular</button>
              <button class="m3-math-btn m3-math-action-clear" id="algClearBtn" title="Limpiar" style="height: 40px; border-radius: 50%; padding: 0 10px;"><span class="material-symbols-rounded">ink_eraser</span></button>
            </div>
          </div>

          <div class="mb-4">
            <div style="position: relative; width: 100%;">
              <div style="font-size: 0.75rem; color: var(--primary-color); position: absolute; top: -10px; left: 12px; background: var(--md-sys-color-surface, #FFFBFE); padding: 0 4px; z-index: 2;">Expresión algebraica</div>
              <math-field id="algMathField" style="font-size: 1.5rem; width: 100%; border-radius: 8px; border: 2px solid var(--primary-color); padding: 0.75rem 1rem; background: transparent; color: var(--md-sys-color-on-surface, #1C1B1F); outline: none;">
              </math-field>
            </div>
          </div>

          ${MATH_TOOLBAR_HTML}

          <div class="small text-body-secondary mb-2 mt-3" id="algHelp">${ALG_EXAMPLES.solve}</div>

          <div id="algSteps" class="d-none mt-3">
            <h6 class="fw-semibold mb-2 step-section-title"><span class="material-symbols-rounded me-1 text-indigo">format_list_numbered</span>Paso a paso</h6>
            <div id="algStepsContent"></div>
          </div>

          <div class="math-result-display mt-2" id="algResult"></div>
        </div></div>
      </div>

      <div id="mathPanelGraph" class="math-panel d-none">
        <div class="card border-0 shadow-sm"><div class="card-body p-4">
          <div class="input-group mb-3 d-flex flex-column flex-md-row gap-3 align-items-stretch">
            <div style="flex: 1; position: relative; width: 100%;">
              <div style="font-size: 0.75rem; color: var(--primary-color); position: absolute; top: -10px; left: 12px; background: var(--md-sys-color-surface, #FFFBFE); padding: 0 4px; z-index: 2;">Escribe una función (ej. x², sin(x), x³−2x)</div>
              <math-field id="graphInput" style="font-size: 1.25rem; width: 100%; border-radius: 8px; border: 2px solid var(--primary-color); padding: 0.75rem 1rem; background: transparent; color: var(--md-sys-color-on-surface, #1C1B1F); outline: none;">x^2</math-field>
            </div>
            <button class="m3-math-btn m3-math-btn-pill m3-math-action-primary m-0" id="graphBtn" style="height: auto; min-height: 56px;"><span class="material-symbols-rounded me-2">show_chart</span>Graficar</button>
          </div>
          ${MATH_TOOLBAR_HTML}
          <div style="position:relative;width:100%;background:var(--md-sys-color-surface, #FFFBFE);border: 1px solid var(--md-sys-color-outline, #79747E); border-radius:0.5rem;" class="mt-4">
            <canvas id="graphCanvas" style="width:100%;height:350px;display:block;border-radius:0.5rem;"></canvas>
          </div>
        </div></div>
      </div>
    </div>
  `;

  const badge = document.getElementById('wolframBadge');
  if (badge && hasWolframKey()) badge.classList.remove('d-none');

  renderHistory();
  setupMathEvents();

  window.addEventListener('resize', () => {
    if (currentTab === 'graph') {
      drawGraph();
    }
  });
}

function setupMathEvents() {
  document.querySelectorAll('.math-subtab').forEach(el => {
    el.addEventListener('click', () => setActiveSubTab(el.dataset.tab));
  });

  document.querySelectorAll('#mathSection .math-grid-btn').forEach(btn => {
    btn.addEventListener('click', () => handleCalc(btn.dataset.key));
  });

  document.getElementById('mathInput')?.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
      const val = this.value.trim();
      if (val) {
        document.getElementById('mathDisplay').textContent = val;
        handleCalc('=');
        this.value = '';
      }
    }
  });

  document.querySelectorAll('#mathSection .math-tb-btn').forEach(btn => {
    btn.addEventListener('click', () => insertMathSymbol(btn.dataset.insert));
  });

  document.getElementById('algBtn')?.addEventListener('click', doAlgebra);
  document.getElementById('algMathField')?.addEventListener('keydown', e => { if (e.key === 'Enter') doAlgebra(); });
  document.getElementById('algClearBtn')?.addEventListener('click', () => {
    const mf = document.getElementById('algMathField');
    if (mf) mf.setValue('');
    document.getElementById('algResult').textContent = '';
    document.getElementById('algSteps').classList.add('d-none');
    document.getElementById('algStepsContent').innerHTML = '';
  });
  document.getElementById('algMode')?.addEventListener('change', function () {
    const help = document.getElementById('algHelp');
    if (help) help.textContent = ALG_EXAMPLES[this.value] || '';
  });
  document.getElementById('graphBtn')?.addEventListener('click', drawGraph);
  document.getElementById('graphInput')?.addEventListener('keydown', e => { if (e.key === 'Enter') drawGraph(); });
}

function setupPhysicsEvents() {
  document.getElementById('physSelect')?.addEventListener('change', function () {
    const p = PHYSICS[this.value];
    
    // Update category badge and formula display
    const badge = document.getElementById('physCategoryBadge');
    if (badge) badge.textContent = p.category;
    
    const mathField = document.getElementById('physFormulaDisplay');
    if (mathField) mathField.setValue(p.formula);
    
    // Render variables
    document.getElementById('physInputs').innerHTML = Object.entries(p.vars).map(([k, v]) => {
      const parts = v.match(/^(.*?)\\s*\\((.*?)\\)$/);
      const name = parts ? parts[1] : v;
      const unit = parts ? parts[2] : '';
      return '<div class="col-12 col-md-6">' +
          '<div style="position: relative; width: 100%;">' +
            '<div style="font-size: 0.75rem; color: var(--md-sys-color-on-surface-variant, #49454F); position: absolute; top: -10px; left: 12px; background: var(--md-sys-color-surface, #FFFBFE); padding: 0 4px; z-index: 2;">' + name + ' (' + k + ')</div>' +
            '<input type="number" class="form-control phys-input" data-var="' + k + '" style="border: 1px solid var(--md-sys-color-outline, #79747E); border-radius: 8px; padding: 12px; padding-right: 48px; background: transparent; color: var(--md-sys-color-on-surface, #1C1B1F);" placeholder="Dejar vacío para calcular" step="any" />' +
            (unit ? '<span style="position: absolute; right: 16px; top: 12px; color: var(--md-sys-color-on-surface-variant, #49454F); font-size: 0.9rem;">' + unit + '</span>' : '') +
          '</div>' +
        '</div>';
    }).join('');
    
    // Reset states
    const resultDiv = document.getElementById('physResult');
    if (resultDiv) resultDiv.innerHTML = '';
    
    const stepsDiv = document.getElementById('physSteps');
    if(stepsDiv) stepsDiv.innerHTML = '';
    
    const emptyState = document.getElementById('physEmptyState');
    if (emptyState) emptyState.classList.remove('d-none');
    
    const resultContainer = document.getElementById('physResultContainer');
    if (resultContainer) resultContainer.classList.add('d-none');
  });
  
  document.getElementById('physBtn')?.addEventListener('click', doPhysics);
  document.getElementById('physNlpBtn')?.addEventListener('click', handlePhysicsNLP);
}

function setupChemistryEvents() {
  document.getElementById('chemMolarBtn')?.addEventListener('click', () => {
    const inputEl = document.getElementById('chemFormulaInput');
    const errorEl = document.getElementById('chemFormulaError');
    const resultContainer = document.getElementById('chemMolarResultContainer');
    const resultDiv = document.getElementById('chemMolarResult');
    const breakdownDiv = document.getElementById('chemMolarBreakdown');
    
    inputEl.classList.remove('is-invalid');
    errorEl.textContent = '';
    
    const rawInput = inputEl.value.trim();
    if (!rawInput) return;
    
    const formula = resolveChemFormula(rawInput);
    
    try {
      const parsed = parseChemicalFormula(formula);
      
      let mm = 0;
      let textBreakdown = [];
      
      const elementsMap = {
        H: 'hidrógenos', He: 'helios', Li: 'litios', Be: 'berilios', B: 'boros', C: 'carbonos', N: 'nitrógenos', O: 'oxígenos', F: 'flúores',
        Na: 'sodios', Mg: 'magnesios', Al: 'aluminios', Si: 'silicios', P: 'fósforos', S: 'azufres', Cl: 'cloros', K: 'potasios', Ca: 'calcios',
        Fe: 'hierros', Cu: 'cobres', Zn: 'zinc', Ag: 'platas', Au: 'oros', Hg: 'mercurios', Pb: 'plomos', U: 'uranios'
      };
      
      let unknownElement = null;
      
      for (const k in parsed) {
        if (!PERIODIC_TABLE[k]) {
          unknownElement = k;
          break;
        }
        const w = parsed[k] * PERIODIC_TABLE[k];
        mm += w;
        
        let elName = elementsMap[k] || k;
        if (parsed[k] === 1 && elName.endsWith('s') && elName !== 'fósforos') elName = elName.slice(0, -1);
        if (parsed[k] === 1 && k === 'P') elName = 'fósforo';
        if (parsed[k] === 1 && k === 'F') elName = 'flúor';
        
        textBreakdown.push(`<b>${parsed[k]}</b> ${elName} (${PERIODIC_TABLE[k]} c/u)`);
      }
      
      if (unknownElement) {
        throw new Error(`Elemento no reconocido: ${unknownElement}`);
      }
      
      const prettyFormula = formatSubscripts(formula);
      const isCommonName = rawInput.toLowerCase() !== formula.toLowerCase() && COMMON_CHEM_NAMES[rawInput.toLowerCase()];
      const displayName = isCommonName ? `${rawInput} (${prettyFormula})` : prettyFormula;
      
      resultDiv.innerHTML = `El ${displayName} pesa <span class="text-primary">${mm.toFixed(3)} g</span> por cada mol`;
      breakdownDiv.innerHTML = textBreakdown.join(' <br> <span class="text-muted">+</span> ');
      
      resultContainer.classList.remove('d-none');
      resultContainer.style.opacity = '0';
      setTimeout(() => resultContainer.style.opacity = '1', 50);
      
      // Auto-fill converter
      const convMolarMass = document.getElementById('chemConvMolarMass');
      if (convMolarMass) {
        convMolarMass.value = mm.toFixed(3);
        document.getElementById('chemConvMolarMass').dispatchEvent(new Event('input'));
      }
      
    } catch (e) {
      resultContainer.classList.add('d-none');
      inputEl.classList.add('is-invalid');
      errorEl.textContent = 'No reconozco esa fórmula. Prueba con H2O o escribe el nombre del compuesto.';
    }
  });

  const calcConv = () => {
    const mmInput = document.getElementById('chemConvMolarMass');
    const gInput = document.getElementById('chemConvGrams');
    const nInput = document.getElementById('chemConvMoles');
    const res = document.getElementById('chemConvResult');
    
    if (!mmInput || !gInput || !nInput) return;
    
    const mm = parseFloat(mmInput.value);
    const g = parseFloat(gInput.value);
    const n = parseFloat(nInput.value);
    
    let resultText = "—";
    
    if (!isNaN(mm) && !isNaN(g) && isNaN(n)) {
      resultText = `Tienes ${(g/mm).toFixed(4)} moles`;
    } else if (!isNaN(mm) && isNaN(g) && !isNaN(n)) {
      resultText = `Pesa ${(n*mm).toFixed(4)} gramos`;
    } else if (isNaN(mm) && !isNaN(g) && !isNaN(n)) {
      resultText = `Masa Molar: ${(g/n).toFixed(4)} g/mol`;
    }
    
    res.textContent = resultText;
  };
  document.getElementById('chemConvMolarMass')?.addEventListener('input', calcConv);
  document.getElementById('chemConvGrams')?.addEventListener('input', calcConv);
  document.getElementById('chemConvMoles')?.addEventListener('input', calcConv);

  document.getElementById('chemFormulaInput')?.addEventListener('keydown', e => {
    if (e.key === 'Enter') document.getElementById('chemMolarBtn').click();
  });

  document.getElementById('chemGasBtn')?.addEventListener('click', () => {
    const P = parseFloat(document.getElementById('chemGasP').value);
    const V = parseFloat(document.getElementById('chemGasV').value);
    const n = parseFloat(document.getElementById('chemGasn').value);
    const T = parseFloat(document.getElementById('chemGasT').value);
    
    const R = 0.08206;
    const resultDiv = document.getElementById('chemGasResult');
    
    const pNaN = isNaN(P), vNaN = isNaN(V), nNaN = isNaN(n), tNaN = isNaN(T);
    const missingCount = pNaN + vNaN + nNaN + tNaN;
    
    if (missingCount !== 1) {
      resultDiv.innerHTML = '<span class="text-danger">Deja exactamente un campo en blanco para resolver.</span>';
      return;
    }
    
    let resText = '';
    if (pNaN) {
      const calc = (n * R * T) / V;
      resText = `P = \\frac{nRT}{V} = \\frac{(${n})(${R})(${T})}{${V}} = ${calc.toFixed(4)} \\text{ atm}`;
    } else if (vNaN) {
      const calc = (n * R * T) / P;
      resText = `V = \\frac{nRT}{P} = \\frac{(${n})(${R})(${T})}{${P}} = ${calc.toFixed(4)} \\text{ L}`;
    } else if (nNaN) {
      const calc = (P * V) / (R * T);
      resText = `n = \\frac{PV}{RT} = \\frac{(${P})(${V})}{(${R})(${T})} = ${calc.toFixed(4)} \\text{ mol}`;
    } else if (tNaN) {
      const calc = (P * V) / (n * R);
      resText = `T = \\frac{PV}{nR} = \\frac{(${P})(${V})}{(${n})(${R})} = ${calc.toFixed(4)} \\text{ K}`;
    }
    const resEl = document.getElementById('chemGasResult');
    resEl.innerHTML = `\\(${resText}\\)`;
    resEl.style.opacity = '0';
    setTimeout(() => resEl.style.opacity = '1', 50);
    if (window.renderMathInElement) window.renderMathInElement(resEl);
  });
}

export function renderPhysicsSection() {
  const section = document.getElementById('physicsSection');
  if (!section) return;
  section.innerHTML = `
    <div>
      <h2 class="fw-bold mb-3"><span class="material-symbols-rounded me-2 text-indigo">rocket_launch</span>Física</h2>
      <div class="card"><div class="card-body">
        ${renderPhysicsPanel()}
      </div></div>
    </div>
  `;
  setupPhysicsEvents();
}

export function renderChemistrySection() {
  const section = document.getElementById('chemistrySection');
  if (!section) return;
  section.innerHTML = `
    <div>
      <h2 class="fw-bold mb-3"><span class="material-symbols-rounded me-2 text-indigo">science</span>Química</h2>
      ${renderChemistryPanel()}
    </div>
  `;
  setupChemistryEvents();
}
