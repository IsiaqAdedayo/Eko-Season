import places from '../data/places.json' with { type: 'json' };

const MAINLAND = ["Yaba","Ikeja","Maryland","Bariga","Ebute Metta","Iganmu"];
const LEKKI_CORRIDOR = ["Oniru","Eleko","Chevron Drive"];
const ISLAND_WATER = ["Lagos Island","Lagos Harbour"];

function matchesArea(place, area) {
  if (area === "Anywhere") return true;
  if (area === "Mainland") return MAINLAND.includes(place.area);
  if (area === "Lekki") return place.area.startsWith("Lekki") || LEKKI_CORRIDOR.includes(place.area);
  if (area === "Lagos Island") return ISLAND_WATER.includes(place.area);
  return place.area === area;
}

function dump(corridor, label) {
  const matched = places.filter(p => matchesArea(p, corridor));
  console.log('\n### ' + label + ' (' + corridor + ') — ' + matched.length + ' places');
  const cats = {};
  for (const p of matched) cats[p.category] = (cats[p.category] || 0) + 1;
  console.log('  by category:', JSON.stringify(cats));
  for (const p of matched) {
    console.log('   - ' + p.id + ' | ' + p.category + ' | ' + p.area + ' | ' + p.name + ' | ' + p.price + (p.nights && p.nights.length ? ' | nights:'+p.nights.join(',') : '') + (p.status === 'closed' ? ' | CLOSED' : ''));
  }
}
dump('Lekki', 'Lekki');
dump('Lagos Island', 'Lagos Island');
dump('Mainland', 'Mainland');
