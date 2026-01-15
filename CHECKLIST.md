# ✅ Checklist de vérification avant déploiement

## Configuration
- [x] package.json avec scripts dev/build/start
- [x] tsconfig.json configuré
- [x] .env.example créé
- [x] .gitignore configuré (node_modules, dist, .env)
- [x] README.md documenté

## Docker
- [x] Dockerfile créé et testé
- [x] docker-compose.yml avec services api + db
- [x] init.sql avec toutes les tables
- [x] Volume persistant pour PostgreSQL

## Base de données
- [x] Table users (avec admin inséré)
- [x] Table projects (avec foreign key user_id)
- [x] Table eeat_elements (avec foreign key project_id)
- [x] Table redactions (avec foreign key project_id)
- [x] Table current_briefs (avec foreign key project_id, UNIQUE)
- [x] Table style_analysis_requests (avec foreign key project_id, UNIQUE)
- [x] Index créés pour les performances

## Authentification
- [x] Utilitaires JWT (génération/vérification)
- [x] Middleware authMiddleware
- [x] Controller auth.controller.ts
- [x] Route POST /api/auth/login
- [x] Vérification APP_PASSWORD

## Endpoints CRUD Projects
- [x] GET /api/projects - Liste
- [x] GET /api/projects/:id - Détails
- [x] POST /api/projects - Créer
- [x] PUT /api/projects/:id - Modifier
- [x] DELETE /api/projects/:id - Supprimer
- [x] E-E-A-T elements gérés dans PUT

## Endpoints CRUD Redactions
- [x] GET /api/redactions?project_id=xxx - Liste
- [x] POST /api/redactions - Créer
- [x] PUT /api/redactions/:id - Modifier

## Endpoints Briefs
- [x] GET /api/briefs?project_id=xxx - Récupérer
- [x] POST /api/briefs - Sauvegarder (upsert)

## Endpoints Style Analysis
- [x] POST /api/style - Sauvegarder demande
- [x] PUT /api/style/:project_id - Mettre à jour résultat

## Serveur Express
- [x] Toutes les routes importées
- [x] Toutes les routes activées
- [x] Middleware authMiddleware appliqué
- [x] CORS configuré (FRONTEND_URL)
- [x] Helmet pour la sécurité
- [x] Gestionnaire d'erreur global
- [x] 404 handler
- [x] Health check /health

## TypeScript
- [x] Compilation sans erreurs
- [x] dist/ généré correctement
- [x] Tous les types corrects

## Documentation
- [x] README.md complet
- [x] API_ENDPOINTS.md créé
- [x] Commentaires dans le code

## Tests manuels à faire sur Docploy
- [ ] POST /api/auth/login → Récupérer JWT
- [ ] GET /api/health → Vérifier serveur
- [ ] GET /api/projects → Vérifier connexion DB
- [ ] POST /api/projects → Créer un projet test
- [ ] PUT /api/projects/:id → Modifier le projet
- [ ] DELETE /api/projects/:id → Supprimer le projet

## Variables d'environnement pour Docploy
```
PORT=3000
DATABASE_URL=postgresql://postgres:password@db:5432/redaction_ia
JWT_SECRET={générer un secret de 32+ caractères}
APP_PASSWORD=7zLTt4yDdaKQAK2026
FRONTEND_URL=https://redaction.refonte-seo.fr
NODE_ENV=production
```

## URL attendue sur Docploy
- Backend : https://api.redaction-ia.docploy.io

## Prochaines étapes après déploiement
1. Tester tous les endpoints avec Postman/curl
2. Migrer les données JSON → PostgreSQL (Phase 6)
3. Refactor Frontend pour appeler l'API (Phase 7)
