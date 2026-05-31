const math = require('mathjs');

function getVars(expr) {
  const node = math.parse(expr);
  const vars = new Set();
  node.traverse(n => {
    if (n.isSymbolNode && !math[n.name] && n.name !== 'pi' && n.name !== 'e') {
      vars.add(n.name);
    }
  });
  return Array.from(vars);
}

console.log(getVars("33x - 15y"));
console.log(getVars("x^2 + 3y"));
