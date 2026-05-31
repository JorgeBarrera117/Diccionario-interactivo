async function test() {
  const url = 'https://newton.vercel.app/api/v2/zeroes/33x-15y-24';
  try {
    const res = await fetch(url);
    const data = await res.json();
    console.log(data);
  } catch (e) {
    console.error(e);
  }
}
test();
