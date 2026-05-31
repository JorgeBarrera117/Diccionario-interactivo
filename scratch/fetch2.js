const math = require('mathjs');
try {
  console.log(math.evaluate("2x^(2)+3", {x: 0}));
} catch (e) {
  console.error('Error:', e.message);
}
