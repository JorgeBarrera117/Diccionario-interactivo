const text = String.raw`\rho = \frac{m}{v} + c \cdot a`;
const vars = { m: 50, v: 5, c: 3, a: 10, rho: 100 };

let sub = text;
for (const [k, val] of Object.entries(vars).sort((x,y) => y[0].length - x[0].length)) {
  const regex = new RegExp(`(?<![a-zA-Z\\\\])${k}(?![a-zA-Z])`, 'g');
  sub = sub.replace(regex, val);
}

console.log(sub);
