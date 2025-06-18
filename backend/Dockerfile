FROM node:18-alpine

# Install canvas dependencies
RUN apk add --no-cache \
    build-base \
    cairo-dev \
    jpeg-dev \
    pango-dev \
    giflib-dev \
    pixman-dev \
    pangomm-dev \
    libjpeg-turbo-dev \
    freetype-dev

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

# Build the TypeScript code
RUN npm run build

EXPOSE 3001

CMD ["npm", "run", "start"]