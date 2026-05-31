const math = require('mathjs');

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

function parseInput(exprRaw) {
  const items = splitExpressions(exprRaw);
  const parsed = [];
  
  for (let item of items) {
    if (!item) continue;
    // Check if point
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
    
    // Check if equation
    if (item.includes('=')) {
      // Is it explicit? y = ... or f(x) = ...
      const explicitMatch = item.match(/^(?:y|f\s*\(\s*x\s*\))\s*=\s*(.*)$/i);
      if (explicitMatch) {
         parsed.push({ type: 'explicit', expr: explicitMatch[1] });
      } else {
         // Implicit
         const parts = item.split('=');
         if (parts.length === 2) {
           const impExpr = `(${parts[0].trim()}) - (${parts[1].trim()})`;
           parsed.push({ type: 'implicit', expr: impExpr });
         }
      }
    } else {
      // Explicit by default
      parsed.push({ type: 'explicit', expr: item });
    }
  }
  return parsed;
}

console.log(parseInput("x^2 + y^2 = 25, (2, 5), y = 2x, f(x)=sin(x), x=3"));
