const math = require('mathjs');

function marchingSquares(expr, xMin, xMax, yMin, yMax, res) {
  const node = math.parse(expr);
  const code = node.compile();
  
  const dx = (xMax - xMin) / res;
  const dy = (yMax - yMin) / res;
  
  const vals = new Float32Array((res + 1) * (res + 1));
  
  const start = Date.now();
  for (let i = 0; i <= res; i++) {
    const x = xMin + i * dx;
    for (let j = 0; j <= res; j++) {
      const y = yMin + j * dy;
      try {
        vals[j * (res + 1) + i] = code.evaluate({ x, y });
      } catch (e) {
        vals[j * (res + 1) + i] = NaN;
      }
    }
  }
  const end = Date.now();
  console.log(`Evaluated ${res*res} cells in ${end - start}ms`);
  
  // Just testing if we can evaluate quickly
  return vals;
}

marchingSquares('x^2 + y^2 - 25', -10, 10, -10, 10, 150);
