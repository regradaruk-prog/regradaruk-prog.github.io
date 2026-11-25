#!/bin/sh
set -eu
rm -rf preview-public
mkdir -p preview-public
for page in index.html plate-care.html; do
  sed 's/RegRadar/PlateLoft/g; /rel="canonical"/d; /property="og:url"/d' "$page" > "preview-public/$page"
done
printf '%s\n' '/*' '  X-Robots-Tag: noindex, nofollow' '  Referrer-Policy: no-referrer' > preview-public/_headers
printf '%s\n' 'User-agent: *' 'Disallow: /' > preview-public/robots.txt
