# API Endpoints - Rédaction IA Backend

## Base URL
- **Local** : `http://localhost:3000`
- **Production** : `https://api.redaction-ia.docploy.io`

## Authentification

Toutes les routes (sauf `/api/auth/login` et `/health`) nécessitent un JWT dans le header :
```
Authorization: Bearer {token}
```

---

## Auth

### POST /api/auth/login
Connexion avec APP_PASSWORD

**Request:**
```json
{
  "password": "7zLTt4yDdaKQAK2026"
}
```

**Response 200:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "admin@redaction-ia.local",
    "name": "Administrateur"
  }
}
```

---

## Projects

### GET /api/projects
Liste tous les projets avec leurs éléments E-E-A-T

**Response 200:**
```json
[
  {
    "id": "uuid",
    "nom_projet": "Mon Projet",
    "slug": "mon-projet",
    "domaine": "https://example.com",
    "informations_site": "...",
    "audience_cible": "...",
    "ton_redaction": "...",
    "style_ecriture": "...",
    "synthese_a_propos": "...",
    "url_page_a_propos": "...",
    "date_creation": "2026-01-15T08:00:00Z",
    "updated_at": "2026-01-15T08:00:00Z",
    "eeat_elements": [
      {
        "id": "uuid",
        "titre": "Expertise",
        "contenu": "..."
      }
    ]
  }
]
```

### GET /api/projects/:id
Détails d'un projet

**Response 200:** (même format qu'au-dessus mais un seul projet)

### POST /api/projects
Créer un nouveau projet

**Request:**
```json
{
  "nom_projet": "Nouveau Projet"
}
```

**Response 201:** (projet créé avec slug auto-généré)

### PUT /api/projects/:id
Modifier un projet (+ éléments E-E-A-T)

**Request:**
```json
{
  "nom_projet": "Projet Modifié",
  "domaine": "https://example.com",
  "ton_redaction": "...",
  "style_ecriture": "...",
  "synthese_a_propos": "...",
  "eeat_elements": [
    {
      "titre": "Expertise",
      "contenu": "..."
    }
  ]
}
```

**Response 200:** (projet mis à jour)

### DELETE /api/projects/:id
Supprimer un projet (cascade : supprime aussi redactions, briefs, etc.)

**Response 200:**
```json
{
  "success": true,
  "message": "Projet supprimé"
}
```

---

## Redactions

### GET /api/redactions?project_id={uuid}
Liste les rédactions (optionnellement filtrées par projet)

**Response 200:**
```json
[
  {
    "id": "uuid",
    "project_id": "uuid",
    "doc_id": "google-doc-id",
    "nom_article": "Mon Article",
    "mot_cle": "SEO",
    "date_redaction": "2026-01-15T08:00:00Z",
    "lien_google_doc": "https://docs.google.com/...",
    "statut": "en_cours",
    "updated_at": "2026-01-15T08:00:00Z"
  }
]
```

### POST /api/redactions
Créer une nouvelle rédaction

**Request:**
```json
{
  "project_id": "uuid",
  "doc_id": "google-doc-id",
  "nom_article": "Mon Article",
  "mot_cle": "SEO",
  "lien_google_doc": "https://docs.google.com/...",
  "statut": "en_cours"
}
```

### PUT /api/redactions/:id
Modifier une rédaction

**Request:** (n'importe quel champ à modifier)
```json
{
  "statut": "termine",
  "mot_cle": "Nouveau mot-clé"
}
```

---

## Briefs

### GET /api/briefs?project_id={uuid}
Récupérer le brief courant d'un projet

**Response 200:**
```json
{
  "id": "uuid",
  "project_id": "uuid",
  "title": "Titre du brief",
  "content": "<div>Contenu HTML...</div>",
  "doc_id": "google-doc-id",
  "lien_google_doc": "https://docs.google.com/...",
  "updated_at": "2026-01-15T08:00:00Z"
}
```

**Response 200 (si aucun brief):**
```json
null
```

### POST /api/briefs
Sauvegarder un brief (upsert : crée ou met à jour)

**Request:**
```json
{
  "project_id": "uuid",
  "title": "Titre du brief",
  "content": "<div>Contenu HTML...</div>",
  "doc_id": "google-doc-id",
  "lien_google_doc": "https://docs.google.com/..."
}
```

---

## Style Analysis

### POST /api/style
Sauvegarder une demande d'analyse de style

**Request:**
```json
{
  "project_id": "uuid",
  "urls": [
    "https://example.com/article-1",
    "https://example.com/article-2"
  ]
}
```

**Response 200:**
```json
{
  "id": "uuid",
  "project_id": "uuid",
  "urls": ["..."],
  "status": "pending",
  "created_at": "2026-01-15T08:00:00Z"
}
```

### PUT /api/style/:project_id
Mettre à jour le résultat d'une analyse de style

**Request:**
```json
{
  "ton_redaction": "Professionnel et rassurant...",
  "style_ecriture": "Phrases courtes et directes..."
}
```

**Response 200:**
```json
{
  "id": "uuid",
  "project_id": "uuid",
  "urls": ["..."],
  "status": "completed",
  "result_ton_redaction": "...",
  "result_style_ecriture": "...",
  "completed_at": "2026-01-15T08:00:00Z"
}
```

---

## Health Check

### GET /health
Vérifier que le serveur fonctionne (route publique)

**Response 200:**
```json
{
  "status": "ok",
  "timestamp": "2026-01-15T08:00:00Z",
  "service": "redaction-ia-api"
}
```

---

## Codes d'erreur

- **400** : Bad Request (paramètres manquants ou invalides)
- **401** : Unauthorized (token manquant ou invalide)
- **404** : Not Found (ressource introuvable)
- **409** : Conflict (ressource déjà existante, ex: slug de projet)
- **500** : Internal Server Error

**Format des erreurs:**
```json
{
  "error": "Message d'erreur"
}
```
