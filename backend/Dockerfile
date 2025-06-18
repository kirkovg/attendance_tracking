FROM node:18-alpine

# Install minimal dependencies for Sharp
RUN apk add --no-cache \
    vips-dev

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

# Build the TypeScript code
RUN npm run build

EXPOSE 3001

CMD ["npm", "run", "start"]