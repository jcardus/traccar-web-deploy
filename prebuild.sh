#!/bin/bash
git clone --depth 1 https://github.com/traccar/traccar-web || true
cp -vr src public traccar-web
{
  echo "import './sentry.js';"
  cat traccar-web/src/index.jsx
} > temp && mv temp traccar-web/src/index.jsx

if [ -n "${LOGO_URL}" ]; then
  curl "${LOGO_URL}" > traccar-web/public/logo.svg
fi
if [ -n "${LOGO_LARGE_URL}" ]; then
  curl "${LOGO_LARGE_URL}" > traccar-web/src/resources/images/logo.svg
fi


FILES=("traccar-web/vite.config.js" "traccar-web/index.html")
for FILE in "${FILES[@]}"; do
    sed -i "s|\${title}|$TITLE|g" "$FILE" || true
    sed -i "s|\${description}|$DESCRIPTION|g" "$FILE" || true
    sed -i "s|\${colorPrimary}|$COLOR_PRIMARY|g" "$FILE" || true
done
