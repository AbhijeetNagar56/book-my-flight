FROM node:22-alpine

WORKDIR /app

COPY . .

ENV MONGO_URI=
ENV JWT_SECRET=

RUN npm run build

RUN apk add --no-cache curl

EXPOSE 5678

CMD ["npm","start"]