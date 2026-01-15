import { Request, Response } from 'express';
import { pool } from '../config/database';

/**
 * GET /api/briefs?project_id=xxx
 * Récupérer le brief courant d'un projet
 */
export async function getCurrentBrief(req: Request, res: Response) {
  try {
    const { project_id } = req.query;

    if (!project_id) {
      return res.status(400).json({ error: 'project_id requis' });
    }

    const result = await pool.query(
      'SELECT * FROM current_briefs WHERE project_id = $1',
      [project_id]
    );

    if (result.rows.length === 0) {
      return res.json(null);
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erreur getCurrentBrief:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
}

/**
 * POST /api/briefs
 * Sauvegarder un brief (upsert: crée ou met à jour)
 */
export async function saveBrief(req: Request, res: Response) {
  try {
    const { project_id, title, content, doc_id, lien_google_doc } = req.body;

    if (!project_id || !title || !content) {
      return res.status(400).json({ error: 'project_id, title et content requis' });
    }

    // Upsert (INSERT ... ON CONFLICT UPDATE)
    const result = await pool.query(
      `INSERT INTO current_briefs (project_id, title, content, doc_id, lien_google_doc, updated_at)
       VALUES ($1, $2, $3, $4, $5, NOW())
       ON CONFLICT (project_id)
       DO UPDATE SET
         title = EXCLUDED.title,
         content = EXCLUDED.content,
         doc_id = EXCLUDED.doc_id,
         lien_google_doc = EXCLUDED.lien_google_doc,
         updated_at = NOW()
       RETURNING *`,
      [project_id, title, content, doc_id || null, lien_google_doc || null]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erreur saveBrief:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
}
