FROM node:22-alpine
WORKDIR /app
COPY . .
ENV FRONTEND_URL=http://localhost:5173
ENV MONGO_URI=
ENV JWT_SECRET=
RUN npm install
RUN apk add --no-cache curl
EXPOSE 5000
CMD ["node","server.js"]