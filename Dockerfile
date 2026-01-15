FROM node:20-alpine

WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./
RUN npm ci --only=production

# Copier le code source
COPY . .

# Build TypeScript
RUN npm install -D typescript && npm run build

EXPOSE 3000

CMD ["npm", "start"]
