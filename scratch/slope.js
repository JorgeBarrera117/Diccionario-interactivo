function gcd(a, b) {
  a = Math.abs(a); b = Math.abs(b);
  while (b) { const t = b; b = a % b; a = t; }
  return a;
}

function formatFraction(num, den) {
  if (num === 0) return '0';
  const g = gcd(num, den);
  const n = num / g;
  const d = Math.abs(den / g);
  const sign = Math.sign(num) * Math.sign(den) < 0 ? '-' : '';
  const absN = Math.abs(n);
  if (d === 1) return `${sign}${absN}`;
  return `${sign}\\frac{${absN}}{${d}}`;
}

function getSlopeInterceptForm(vName, otherVName, nOther, nC, d) {
  // We have: vName = (nOther * otherVName + nC) / d
  // We want to split it: (nOther / d) * otherVName + (nC / d)
  if (nOther === 0 && nC === 0) return `${vName} = 0`;
  
  let p1 = '';
  if (nOther !== 0) {
    const frac = formatFraction(nOther, d);
    if (frac === '1') p1 = otherVName;
    else if (frac === '-1') p1 = `-${otherVName}`;
    else p1 = `${frac}${otherVName}`;
  }
  
  let p2 = '';
  if (nC !== 0) {
    const frac = formatFraction(nC, d);
    if (p1 === '') {
      p2 = frac;
    } else {
      if (frac.startsWith('-')) p2 = ` - ${frac.substring(1)}`;
      else p2 = ` + ${frac}`;
    }
  }
  
  return `${vName} = ${p1}${p2}`;
}

console.log(getSlopeInterceptForm('y', 'x', 3, 44, 23));
console.log(getSlopeInterceptForm('x', 'y', 23, -44, 3));
console.log(getSlopeInterceptForm('y', 'x', 4, -8, 2)); // 2x - 4
console.log(getSlopeInterceptForm('y', 'x', -4, 8, 2)); // -2x + 4
