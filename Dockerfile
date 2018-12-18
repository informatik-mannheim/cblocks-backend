FROM node:10.14.2-slim

RUN useradd -ms /bin/bash cblocks

USER cblocks:cblocks

COPY . /app/

WORKDIR /app

RUN npm install

EXPOSE 3000

CMD ["node", "index.js"]