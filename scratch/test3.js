const math = require('mathjs');

function extractCoeffs(exprStr, varName, degree) {
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
}

function parseLatexToAsciiMath(latex) {
  let s = latex;
  s = s.replace(/\\sqrt{([^}]+)}/g, 'sqrt($1)');
  s = s.replace(/\^{([^}]+)}/g, '^($1)');
  s = s.replace(/\^([^\s()]+)/g, '^$1');
  return s;
}

function generateSolveSteps(input) {
  const steps = [];
  const s = input.replace(/\s+/g, '');
  const [lRaw, rRaw] = s.split('=').map(x => x.trim());

  const hasSquare = /x\^2|x\*\*2|x\^\(2\)/.test(s);
  const hasHigher = /x\^[3-9]|x\*\*[3-9]|x\^\([3-9]\)/.test(s);

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
}

const input = parseLatexToAsciiMath("2x^{2}+3=22");
console.log('Input:', input);
const steps = generateSolveSteps(input);
console.log(JSON.stringify(steps, null, 2));

const lastStep = steps[steps.length - 1];
if (lastStep.title === 'Soluciones') {
   const out = lastStep.steps.map(s => s.tex.replace(/x_?\d?\s*=\s*/g, '')).join(', ');
   console.log('Out:', out);
}
