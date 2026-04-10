FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY index.html /usr/share/nginx/html/index.html
COPY app.js /usr/share/nginx/html/app.js
COPY data/ /usr/share/nginx/html/data/
COPY favicon.ico /usr/share/nginx/html/favicon.ico
COPY favicon-16x16.png /usr/share/nginx/html/favicon-16x16.png
COPY favicon-32x32.png /usr/share/nginx/html/favicon-32x32.png
COPY apple-touch-icon.png /usr/share/nginx/html/apple-touch-icon.png
COPY android-chrome-192x192.png /usr/share/nginx/html/android-chrome-192x192.png
COPY android-chrome-512x512.png /usr/share/nginx/html/android-chrome-512x512.png
COPY site.webmanifest /usr/share/nginx/html/site.webmanifest
