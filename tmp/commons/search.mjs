import { writeFileSync } from 'node:fs';

const searchQueries = [
  { placeId: 'quilox', query: 'Quilox Lagos nightclub entrance party' },
  { placeId: 'vaniti', query: 'Vaniti Lagos club' },
  { placeId: 'club-57', query: 'Club 57 Ikoyi Lagos' },
  { placeId: 'boho', query: 'Boho Lagos speakeasy' },
  { placeId: 'mercury-rooftop', query: 'Mercury Rooftop Lagos' },
  { placeId: 'sugar-52', query: 'Sugar 52 Lagos rooftop pool' },
  { placeId: 'truth-beach-club', query: 'Truth Beach Club Lekki' },
  { placeId: 'tarkwa-bay', query: 'Tarkwa Bay beach Lagos' },
  { placeId: 'oniru-beach', query: 'Oniru beach Lagos' },
  { placeId: 'la-campagne', query: 'La Campagne Tropicana Eleko Lagos' },
  { placeId: 'terra-kulture', query: 'Terra Kulture Victoria Island Lagos' },
  { placeId: 'nok-by-alara', query: 'Nok by Alara Ikoyi' },
  { placeId: 'the-ona', query: 'The Ona Victoria Island Lagos' },
  { placeId: 'rsvp', query: 'RSVP Lagos restaurant Victoria Island' },
  { placeId: 'shiro', query: 'Shiro Lagos sushi rooftop' },
  { placeId: 'mood-lagos', query: 'Mood Lagos restaurant Lekki Admiralty' },
  { placeId: 'norma', query: 'Norma suya Lagos' },
  { placeId: 'nobs-and-berries', query: 'Nobs and Berries Lekki brunch' },
  { placeId: 'vortex', query: 'Vortex EbonyLife Place VR arcade Lagos' },
  { placeId: 'rufus-and-bee', query: 'Rufus and Bee bowling Lekki Lagos' },
  { placeId: 'lekki-bowling-grand', query: 'Lekki Bowling Grand Atlantic Centre' },
  { placeId: 'fun-factory', query: 'Fun Factory Lekki rides pool' },
  { placeId: 'dream-park', query: 'Dream Park Ikorodu VR cinema' },
  { placeId: 'ebonylife-cinemas', query: 'EbonyLife Cinemas Victoria Island' },
  { placeId: 'silverbird-galleria', query: 'Silverbird Galleria VI cinema' },
  { placeId: 'ozone-cinemas', query: 'Ozone Cinemas Yaba E Centre' },
  { placeId: 'purple-maryland', query: 'Purple Maryland ice rink cinema' },
  { placeId: 'bukka-hut-yaba', query: 'Bukka Hut Yaba amala' },
  { placeId: 'ilashe-beach', query: 'Ilashe Beach Lagos' },
];

async function fetchWithBackoff(url, retries = 4) {
  for (let i = 0; i < retries; i++) {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'EkoSeason/1.0 (places photo sourcing)' },
    });
    if (res.ok) return res.json();
    const text = await res.text().catch(() => '');
    if (res.status === 429) {
      await new Promise((r) => setTimeout(r, 5000 * (i + 1)));
      continue;
    }
    throw new Error(`${res.status} ${text.slice(0, 300)}`);
  }
  throw new Error('Gave up after retries');
}

const out = [];
for (const q of searchQueries) {
  const enc = encodeURIComponent(q.query);
  const url = `https://commons.wikimedia.org/w/api.php?action=query&format=json&generator=search&gsrsearch=${enc}&gsrnamespace=6&gsrlimit=15&prop=imageinfo&iiprop=url|extmetadata&iiurlwidth=1400`;
  let json;
  try {
    json = await fetchWithBackoff(url);
  } catch (err) {
    console.warn(`SEARCH FAILED ${q.placeId}:`, err.message);
    out.push({ ...q, error: err.message });
    continue;
  }
  const pages = json.query?.pages ?? {};
  const matches = Object.values(pages)
    .filter((p) => p.title && typeof p.title === 'string')
    .map((p) => ({
      title: p.title,
      thumburl: p.imageinfo?.[0]?.thumburl,
      url: p.imageinfo?.[0]?.url,
      extmetadata: p.imageinfo?.[0]?.extmetadata,
      mime: p.imageinfo?.[0]?.mime,
    }))
    .filter((m) => m.title && m.thumburl);
  out.push({ placeId: q.placeId, query: q.query, matches });
}

writeFileSync('./tmp/commons/search.json', '\n' + JSON.stringify(out, null, 2) + '\n');
console.log('WROTE tmp/commons/search.json with', out.length, 'queries');
