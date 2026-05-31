async function test() {
  const url = 'https://newton.vercel.app/api/v2/zeroes/2^{2}%2B3x-22';
  try {
    const res = await fetch(url);
    const text = await res.text();
    console.log(text);
  } catch (e) {
    console.error(e);
  }
}
test();
