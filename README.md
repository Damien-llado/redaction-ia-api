# Rédaction IA - Backend API

Backend Express + PostgreSQL pour l'application de rédaction IA.

## Stack Technique

- **Express.js** - Framework web
- **PostgreSQL** - Base de données
- **TypeScript** - Typage statique
- **JWT** - Authentification
- **Docker Compose** - Conteneurisation

## Installation

```bash
# Installer les dépendances
npm install

# Copier les variables d'environnement
cp .env.example .env

# Lancer avec Docker Compose
docker-compose up -d

# Ou lancer en dev local
npm run dev
```

## Endpoints API

### Authentification
- `POST /api/auth/login` - Connexion (APP_PASSWORD)

### Projects
- `GET /api/projects` - Liste des projets
- `POST /api/projects` - Créer un projet
- `GET /api/projects/:id` - Détails d'un projet
- `PUT /api/projects/:id` - Modifier un projet
- `DELETE /api/projects/:id` - Supprimer un projet

### Redactions
- `GET /api/redactions` - Liste des rédactions
- `POST /api/redactions` - Créer une rédaction
- `PUT /api/redactions/:id` - Modifier une rédaction

### Briefs
- `GET /api/briefs?project_id=xxx` - Brief courant d'un projet
- `POST /api/briefs` - Sauvegarder un brief

### Style Analysis
- `POST /api/style` - Sauvegarder une demande d'analyse
- `PUT /api/style/:project_id` - Mettre à jour le résultat

## Déploiement

Ce projet est conçu pour être déployé sur Docploy avec Docker Compose.

```bash
# Build
npm run build

# Démarrer en production
npm start
```

## License

ISC
