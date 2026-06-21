FROM nginx:stable-alpine
COPY ./dist /usr/share/nginx/html
ENV VITE_API_BASE_URL=http://localhost:5000
EXPOSE 80