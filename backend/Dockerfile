FROM node:20-alpine

WORKDIR /app

# Install dependencies first for efficient caching
COPY package*.json ./
RUN npm install

# Copy application source code
COPY . .

# Build TypeScript to dist
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
