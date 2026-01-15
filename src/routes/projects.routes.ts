import { Router } from 'express';
import {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject
} from '../controllers/projects.controller';

const router = Router();

// GET /api/projects - Liste tous les projets
router.get('/', getProjects);

// GET /api/projects/:id - Détails d'un projet
router.get('/:id', getProject);

// POST /api/projects - Créer un projet
router.post('/', createProject);

// PUT /api/projects/:id - Modifier un projet
router.put('/:id', updateProject);

// DELETE /api/projects/:id - Supprimer un projet
router.delete('/:id', deleteProject);

export default router;
