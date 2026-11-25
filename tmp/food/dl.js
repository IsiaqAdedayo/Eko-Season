const fs = require('fs');
const meta = JSON.parse(fs.readFileSync('tmp/food/meta2.json', 'utf8'));
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
const want = ['efo', 'ofada', 'peppersoup'];
(async () => {
  for (let round = 0; round < 5; round++) {
    for (const k of want) {
      const f = `tmp/food/${k}.jpg`;
      if (fs.existsSync(f) && fs.statSync(f).size > 20000) continue;
      try {
        const res = await fetch(meta[k].thumb, { headers: { 'User-Agent': 'EkoSeason/1.0' } });
        if (!res.ok) throw new Error('http ' + res.status);
        fs.writeFileSync(f, Buffer.from(await res.arrayBuffer()));
        console.log('ok', k, fs.statSync(f).size);
      } catch (e) { console.log('fail', k, String(e).slice(0, 30)); }
      await sleep(45000);
    }
    if (want.every(k => fs.existsSync(`tmp/food/${k}.jpg`) && fs.statSync(`tmp/food/${k}.jpg`).size > 20000)) break;
  }
  console.log('DONE');
})();
