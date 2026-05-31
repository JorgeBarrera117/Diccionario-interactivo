const PHYSICS = [
  { 
    name: 'Cinemática: Velocidad final (MRUV)', 
    vars: { v: 'Velocidad final', u: 'Velocidad inicial', a: 'Aceleración', t: 'Tiempo' },
    keywords: {
      v: ['velocidad final'],
      u: ['velocidad inicial', 'parte del reposo', 'arranca'],
      a: ['aceleracion', 'aceleración', 'm/s2', 'm/s^2'],
      t: ['tiempo', 'segundos', ' s ']
    }
  }
];

function parsePhysicsProblem(text) {
  text = text.toLowerCase();
  
  const extracted = {};
  
  // Extract explicit numbers with units
  const regexNum = /(-?[\d.]+)\s*(m\/s\^?2|m\/s|s|segundos|m|metros|kg|kilos|n|newtons|j|joules|v|voltios|a|amperios|ohm|ohmios|hz|w|watts)\b/g;
  
  let match;
  while ((match = regexNum.exec(text)) !== null) {
    const val = parseFloat(match[1]);
    const unit = match[2];
    
    if (unit.includes('m/s2') || unit.includes('m/s^2')) extracted.a = val;
    else if (unit === 'm/s') {
      // is it u or v?
      // check context before
      const context = text.substring(Math.max(0, match.index - 20), match.index);
      if (context.includes('inicial') || context.includes('de')) extracted.u = val; // very naive
      else if (context.includes('final') || context.includes('a')) extracted.v = val;
      else if (!extracted.u) extracted.u = val; 
      else extracted.v = val;
    }
    else if (unit === 's' || unit === 'segundos') extracted.t = val;
  }
  
  // Reposo = 0 inicial
  if (text.includes('reposo')) extracted.u = 0;

  // Find target
  let target = null;
  const targetWords = ['calcula', 'calcular', 'halla', 'hallar', 'cual es', 'cuál es', 'determina', 'determinar'];
  for (const w of targetWords) {
    const idx = text.indexOf(w);
    if (idx !== -1) {
      const after = text.substring(idx);
      if (after.includes('velocidad final')) target = 'v';
      else if (after.includes('tiempo')) target = 't';
      else if (after.includes('aceleracion') || after.includes('aceleración')) target = 'a';
      else if (after.includes('velocidad inicial')) target = 'u';
    }
  }

  return { extracted, target };
}

console.log(parsePhysicsProblem('Calcula la velocidad final de un coche que parte del reposo y tiene una aceleración de 4 m/s2 durante 10 s.'));
console.log(parsePhysicsProblem('Un auto va a 45 m/s, tiene una aceleración de 4 m/s2. Cual es la velocidad final despues de 4 segundos?'));
