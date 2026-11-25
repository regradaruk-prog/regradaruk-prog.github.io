#!/bin/sh
set -eu
rm -rf preview-public
mkdir -p preview-public
for page in index.html plate-care.html; do
  sed 's/RegRadar/PlateLoft/g; s/<link rel="canonical"[^>]*>//g; s/<meta property="og:url"[^>]*>//g' "$page" > "preview-public/$page"
  test -s "preview-public/$page"
  grep -qi '</html>' "preview-public/$page"
done
grep -q 'id="calendar"' preview-public/plate-care.html
printf '%s\n' '/*' '  X-Robots-Tag: noindex, nofollow' '  Referrer-Policy: no-referrer' > preview-public/_headers
printf '%s\n' 'User-agent: *' 'Disallow: /' > preview-public/robots.txt
