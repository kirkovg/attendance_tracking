FROM node:18-alpine

WORKDIR /app

# Install wget
RUN apk add --no-cache wget

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"] 