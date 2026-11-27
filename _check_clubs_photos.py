import json

places = json.load(open('data/places.json'))
clubs_in_places = [p for p in places if p.get('category') == 'clubs']
print('clubs in places.json:', len(clubs_in_places))
for p in clubs_in_places:
    print(p['id'], '| name:', p['name'], '| imageNote:', p.get('imageNote'), '| gallery[0]:', p.get('gallery',[None])[0])
print('clubs with imageNote:', sum(1 for p in clubs_in_places if p.get('imageNote')))
print('clubs with empty/no gallery:', sum(1 for p in clubs_in_places if not p.get('gallery')))
