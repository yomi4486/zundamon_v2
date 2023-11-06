# ベースイメージの読み込み
FROM node:alpine

RUN npm install
WORKDIR /usr/app
COPY .\ /usr/app
RUN apk update 
RUN apk add --no-cache ffmpeg

CMD [ "npm","start" ]

CMD [ "node","index.js" ]

EXPOSE 50021
EXPOSE 80