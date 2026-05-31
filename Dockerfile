FROM nginx:1.27-alpine

ENV PORT=8080

COPY foodhub360-frontend/nginx.conf.template /etc/nginx/templates/default.conf.template
COPY foodhub360-frontend/index.html /usr/share/nginx/html/index.html
COPY foodhub360-frontend/styles.css /usr/share/nginx/html/styles.css
COPY foodhub360-frontend/app.js /usr/share/nginx/html/app.js
COPY foodhub360-frontend/backend.js /usr/share/nginx/html/backend.js
COPY foodhub360-frontend/assets /usr/share/nginx/html/assets

EXPOSE 8080

CMD ["/bin/sh", "-c", "envsubst '$PORT' < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"]