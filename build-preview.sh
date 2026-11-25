#!/bin/sh
set -eu
mkdir -p preview-public
printf '%s\n' '<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>Development environment</title><h1>Development environment</h1><p>Website setup in progress.</p></html>' > preview-public/index.html
printf '%s\n' '/*' '  X-Robots-Tag: noindex, nofollow' > preview-public/_headers
