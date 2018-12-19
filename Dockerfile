FROM node:10.14.2-slim

RUN useradd -ms /bin/bash cblocks

WORKDIR /app

COPY . .

RUN chown -R cblocks:cblocks .

USER cblocks:cblocks

VOLUME [ "./src" ]

RUN npm install

EXPOSE 3000

CMD ["npm", "start"]
