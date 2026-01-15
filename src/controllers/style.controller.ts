import { Request, Response } from 'express';
import { pool } from '../config/database';

/**
 * POST /api/style
 * Sauvegarder une demande d'analyse de style
 */
export async function saveStyleRequest(req: Request, res: Response) {
  try {
    const { project_id, urls } = req.body;

    if (!project_id || !urls || !Array.isArray(urls)) {
      return res.status(400).json({ error: 'project_id et urls (array) requis' });
    }

    // Upsert
    const result = await pool.query(
      `INSERT INTO style_analysis_requests (project_id, urls, status, created_at)
       VALUES ($1, $2, 'pending', NOW())
       ON CONFLICT (project_id)
       DO UPDATE SET
         urls = EXCLUDED.urls,
         status = 'pending',
         created_at = NOW(),
         completed_at = NULL,
         result_ton_redaction = NULL,
         result_style_ecriture = NULL
       RETURNING *`,
      [project_id, urls]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erreur saveStyleRequest:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
}

/**
 * PUT /api/style/:project_id
 * Mettre à jour le résultat d'une analyse de style
 */
export async function updateStyleResult(req: Request, res: Response) {
  try {
    const { project_id } = req.params;
    const { ton_redaction, style_ecriture } = req.body;

    if (!ton_redaction || !style_ecriture) {
      return res.status(400).json({ error: 'ton_redaction et style_ecriture requis' });
    }

    const result = await pool.query(
      `UPDATE style_analysis_requests
       SET status = 'completed',
           result_ton_redaction = $1,
           result_style_ecriture = $2,
           completed_at = NOW()
       WHERE project_id = $3
       RETURNING *`,
      [ton_redaction, style_ecriture, project_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Demande d\'analyse introuvable' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erreur updateStyleResult:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
}
