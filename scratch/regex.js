const text = '\\rho = \\frac{m}{v} + c \\cdot a';
const vars = { m: 50, v: 5, c: 3, a: 10, rho: 100 };

let sub = text;
for (const [k, val] of Object.entries(vars).sort((a,b) => b[0].length - a[0].length)) {
  const regex = new RegExp(`(?<!\\\\)\\\\b${k}\\\\b`, 'g');
  sub = sub.replace(regex, val);
}

console.log(sub);
