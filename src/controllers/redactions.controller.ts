import { Request, Response } from 'express';
import { pool } from '../config/database';

/**
 * GET /api/redactions?project_id=xxx
 * Liste les rédactions (filtrées par projet optionnel)
 */
export async function getRedactions(req: Request, res: Response) {
  try {
    const { project_id } = req.query;

    let query = 'SELECT * FROM redactions ORDER BY date_redaction DESC';
    let values: any[] = [];

    if (project_id) {
      query = 'SELECT * FROM redactions WHERE project_id = $1 ORDER BY date_redaction DESC';
      values = [project_id];
    }

    const result = await pool.query(query, values);
    res.json(result.rows);
  } catch (error) {
    console.error('Erreur getRedactions:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
}

/**
 * POST /api/redactions
 * Créer une nouvelle rédaction
 */
export async function createRedaction(req: Request, res: Response) {
  try {
    const { project_id, doc_id, nom_article, mot_cle, lien_google_doc, statut } = req.body;

    if (!project_id || !nom_article) {
      return res.status(400).json({ error: 'project_id et nom_article requis' });
    }

    const result = await pool.query(
      `INSERT INTO redactions (id, project_id, doc_id, nom_article, mot_cle, lien_google_doc, statut, date_redaction, updated_at)
       VALUES (uuid_generate_v4(), $1, $2, $3, $4, $5, $6, NOW(), NOW())
       RETURNING *`,
      [project_id, doc_id || null, nom_article, mot_cle || null, lien_google_doc || null, statut || 'en_cours']
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erreur createRedaction:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
}

/**
 * PUT /api/redactions/:id
 * Modifier une rédaction
 */
export async function updateRedaction(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const updates = req.body;

    const fields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    Object.entries(updates).forEach(([key, value]) => {
      if (key !== 'id' && key !== 'date_redaction') {
        fields.push(`${key} = $${paramIndex}`);
        values.push(value);
        paramIndex++;
      }
    });

    fields.push(`updated_at = NOW()`);
    values.push(id);

    const query = `
      UPDATE redactions
      SET ${fields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Rédaction introuvable' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erreur updateRedaction:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
}
