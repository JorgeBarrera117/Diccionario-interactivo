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

const inputs = [
  "(2, 3), x^2 + y^2 = 25, y = x + 2",
  "sin(x, y), x=5",
  "f(x) = 2x, (1, 2)"
];

for (const inp of inputs) {
  console.log("Input:", inp);
  console.log("Output:", splitExpressions(inp));
}
