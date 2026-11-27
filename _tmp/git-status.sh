#!/bin/sh
echo "=== git status ==="
git status --short || echo "(no git)"
echo
echo "=== git diff ==="
git diff -- app/sitemap.ts app/clubs app/markets data/clubs.ts data/activities.ts || echo "(no git or no diff)"
echo
echo "=== git log -1 ==="
git log -1 --oneline --decorate || echo "(no git)"
