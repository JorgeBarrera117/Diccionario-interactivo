const math = require('mathjs');

function getVars(expr) {
  const node = math.parse(expr);
  const vars = new Set();
  node.traverse(n => {
    if (n.isSymbolNode && !math[n.name] && n.name !== 'pi' && n.name !== 'e') {
      vars.add(n.name);
    }
  });
  return Array.from(vars).sort();
}

function gcd(a, b) {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) {
    const t = b;
    b = a % b;
    a = t;
  }
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
    
    const coeffs = { [v1]: c1, [v2]: c2, c: c };
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
    
    // Isolate v1
    if (simC1 !== 0) {
      let signV1 = Math.sign(simC1);
      let denom = Math.abs(simC1);
      let numC2 = -simC2 * signV1;
      let numC = -simC * signV1;
      let numTex = `${formatTerm(numC2, v2, true)}${formatTerm(numC, '', numC2 === 0)}`;
      if (numTex === '') numTex = '0';
      
      let ansTex = denom === 1 ? numTex : `\\frac{${numTex}}{${denom}}`;
      solutions.push(`\\text{Despejando } ${v1}:\\quad ${v1} = ${ansTex}`);
    }

    // Isolate v2
    if (simC2 !== 0) {
      let signV2 = Math.sign(simC2);
      let denom = Math.abs(simC2);
      let numC1 = -simC1 * signV2;
      let numC = -simC * signV2;
      let numTex = `${formatTerm(numC1, v1, true)}${formatTerm(numC, '', numC1 === 0)}`;
      if (numTex === '') numTex = '0';
      
      let ansTex = denom === 1 ? numTex : `\\frac{${numTex}}{${denom}}`;
      solutions.push(`\\text{Despejando } ${v2}:\\quad ${v2} = ${ansTex}`);
    }

    steps.push({
      num: 3, title: 'Despejes posibles (Solución)',
      steps: solutions.map(sol => ({ desc: '', tex: sol }))
    });

    return steps;
  } catch (e) {
    return null;
  }
}

console.log(JSON.stringify(solveMultivariableLinear('33x - 15y = 24'), null, 2));
