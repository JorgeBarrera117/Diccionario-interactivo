const math = require('mathjs');

function extractCoeffs(exprStr, varName, degree) {
  if (degree === 1) {
    const f0 = math.evaluate(exprStr, { [varName]: 0 });
    const f1 = math.evaluate(exprStr, { [varName]: 1 });
    if (isNaN(f0) || isNaN(f1) || !isFinite(f0) || !isFinite(f1)) return null;
    return { a: f1 - f0, b: f0 };
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

  const hasSquare = /x\^2|x\*\*2/.test(s);
  const hasHigher = /x\^[3-9]|x\*\*[3-9]/.test(s);

  if (!hasSquare && !hasHigher) {
    const leftExpr = lRaw;
    const coeffs = extractCoeffs(leftExpr, 'x', 1);
    console.log('Coeffs:', coeffs);
    if (!coeffs || coeffs.a === 0) {
      steps.push({ num: 1, title: 'Error', steps: [{ desc: 'Ecuación demasiado compleja para el resolutor básico.', tex: s }] });
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
          { desc: 'Simplificamos:', tex: `x = ${(rhs / a).toFixed(6).replace(/\.?0+$/, '')}` }
        ]
      });
    } else {
      steps.push({
        num: 3, title: 'Solución', steps: [{ desc: 'Resultado:', tex: `x = ${rhs}` }]
      });
    }
    return steps;
  }
  return [];
}

const input = "2^(2)+3*x=22";
console.log('Input:', input);
const steps = generateSolveSteps(input);
console.log(JSON.stringify(steps, null, 2));

const lastStep = steps[steps.length - 1];
if (lastStep.title === 'Solución') {
   const finalStepTex = lastStep.steps[lastStep.steps.length - 1].tex;
   console.log('FinalStepTex:', finalStepTex);
   const out = finalStepTex.replace(/x_?\d?\s*=\s*/g, '');
   console.log('Out:', out);
}
