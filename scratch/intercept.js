const math = require('mathjs');

function findIntercepts(expr) {
  const intercepts = [];
  try {
    const yInt = math.evaluate(expr, { x: 0 });
    if (isFinite(yInt)) intercepts.push({x: 0, y: yInt});
  } catch(e) {}

  let prev_px = null, prev_py = null;
  for (let i = 0; i <= 2000; i++) {
    const px = -100 + (i / 2000) * 200;
    try {
      const py = math.evaluate(expr, { x: px });
      if (prev_py !== null && ((prev_py > 0 && py <= 0) || (prev_py < 0 && py >= 0))) {
        if (py === 0) {
           if (px !== 0) intercepts.push({x: px, y: 0});
        }
        else if (prev_py !== 0) {
          const xRoot = px - py * (px - prev_px) / (py - prev_py);
          if (Math.abs(xRoot) > 1e-5) intercepts.push({x: xRoot, y: 0});
        }
      }
      prev_px = px; prev_py = py;
    } catch(e) { prev_py = null; }
  }
  
  // Remove duplicates
  const unique = [];
  for (const pt of intercepts) {
    if (!unique.some(u => Math.abs(u.x - pt.x) < 0.1 && Math.abs(u.y - pt.y) < 0.1)) {
      unique.push(pt);
    }
  }
  return unique;
}

console.log(findIntercepts('(--3*x - (-44)) / 22'));
console.log(findIntercepts('x^2 - 4'));
