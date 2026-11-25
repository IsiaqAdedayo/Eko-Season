import places from './data/places.json' with { type: 'json' };
import dishes from './data/dishes.json' with { type: 'json' };
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
function placesInCorridor(id) { return places.filter(p => matchesArea(p, id)); }
function dishesInCorridor(id) {
  const ids = new Set(placesInCorridor(id).map(p => p.id));
  return dishes.filter(d => d.place && ids.has(d.place));
}
console.log('lekki place ids:', placesInCorridor('lekki').map(p => p.id));
console.log('lekki dish ids:', dishesInCorridor('lekki').map(d => d.id));
