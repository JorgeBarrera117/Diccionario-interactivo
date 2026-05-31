function parseChemicalFormula(formula) {
  let [mainPart, hydratePart] = formula.split(/\*|\./); 
  
  function parsePart(str) {
    let counts = {};
    let stack = [counts];
    let i = 0;
    while(i < str.length) {
      const c = str[i];
      if (c === '(' || c === '[') {
        const newObj = {};
        stack[stack.length - 1]['_group_' + i] = newObj; 
        stack.push(newObj);
        i++;
      } else if (c === ')' || c === ']') {
        const top = stack.pop();
        i++;
        let numStr = '';
        while(i < str.length && /[0-9]/.test(str[i])) { numStr += str[i]; i++; }
        const mult = numStr ? parseInt(numStr) : 1;
        top._multiplier = mult; 
      } else if (/[A-Z]/.test(c)) {
        let elem = c;
        i++;
        if (i < str.length && /[a-z]/.test(str[i])) { elem += str[i]; i++; }
        let numStr = '';
        while(i < str.length && /[0-9]/.test(str[i])) { numStr += str[i]; i++; }
        const count = numStr ? parseInt(numStr) : 1;
        stack[stack.length - 1][elem] = (stack[stack.length - 1][elem] || 0) + count;
      } else {
        i++; 
      }
    }
    
    function flatten(obj, multiplier) {
      let res = {};
      for (const k in obj) {
        if (k === '_multiplier') continue;
        if (k.startsWith('_group_')) {
          const sub = flatten(obj[k], multiplier * (obj[k]._multiplier || 1));
          for (const subK in sub) res[subK] = (res[subK] || 0) + sub[subK];
        } else {
          res[k] = (res[k] || 0) + obj[k] * multiplier;
        }
      }
      return res;
    }
    
    return flatten(counts, 1);
  }

  const result = parsePart(mainPart);
  
  if (hydratePart) {
    hydratePart = hydratePart.trim();
    let numStr = '';
    let j = 0;
    while(j < hydratePart.length && /[0-9]/.test(hydratePart[j])) { numStr += hydratePart[j]; j++; }
    const mult = numStr ? parseInt(numStr) : 1;
    const hyd = parsePart(hydratePart.substring(j));
    for (const k in hyd) {
      result[k] = (result[k] || 0) + hyd[k] * mult;
    }
  }
  
  return result;
}

console.log(parseChemicalFormula('C6H12O6'));
console.log(parseChemicalFormula('Ca(OH)2'));
console.log(parseChemicalFormula('CuSO4*5H2O'));
console.log(parseChemicalFormula('K4[Fe(CN)6]'));
