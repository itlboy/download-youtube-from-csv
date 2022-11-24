FROM mikenye/youtube-dl
RUN apt update && apt install -y npm
WORKDIR /app
COPY package*.json .
RUN npm install
COPY . .

ENTRYPOINT ["/bin/bash", "-c"]
CMD  ["node index.js"];