import { Request, Response } from 'express';
import { pool } from '../config/database';

/**
 * GET /api/projects
 * Liste tous les projets avec leurs éléments E-E-A-T
 */
export async function getProjects(req: Request, res: Response) {
  try {
    // Récupérer tous les projets
    const projectsResult = await pool.query(
      'SELECT * FROM projects ORDER BY date_creation DESC'
    );

    // Pour chaque projet, récupérer les éléments E-E-A-T
    const projectsWithEeat = await Promise.all(
      projectsResult.rows.map(async (project) => {
        const eeaTResult = await pool.query(
          'SELECT id, titre, contenu FROM eeat_elements WHERE project_id = $1',
          [project.id]
        );

        return {
          ...project,
          eeat_elements: eeaTResult.rows
        };
      })
    );

    res.json(projectsWithEeat);
  } catch (error) {
    console.error('Erreur getProjects:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
}

/**
 * GET /api/projects/:id
 * Détails d'un projet avec ses éléments E-E-A-T
 */
export async function getProject(req: Request, res: Response) {
  try {
    const { id } = req.params;

    // Récupérer le projet
    const projectResult = await pool.query(
      'SELECT * FROM projects WHERE id = $1',
      [id]
    );

    if (projectResult.rows.length === 0) {
      return res.status(404).json({ error: 'Projet introuvable' });
    }

    const project = projectResult.rows[0];

    // Récupérer les éléments E-E-A-T
    const eeaTResult = await pool.query(
      'SELECT id, titre, contenu FROM eeat_elements WHERE project_id = $1',
      [id]
    );

    res.json({
      ...project,
      eeat_elements: eeaTResult.rows
    });
  } catch (error) {
    console.error('Erreur getProject:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
}

/**
 * POST /api/projects
 * Créer un nouveau projet
 */
export async function createProject(req: Request, res: Response) {
  try {
    const { nom_projet } = req.body;
    const userId = (req as any).user.id;

    if (!nom_projet) {
      return res.status(400).json({ error: 'nom_projet requis' });
    }

    // Générer le slug
    const slug = nom_projet
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    // Insérer le projet
    const result = await pool.query(
      `INSERT INTO projects (id, user_id, nom_projet, slug, date_creation, updated_at)
       VALUES (uuid_generate_v4(), $1, $2, $3, NOW(), NOW())
       RETURNING *`,
      [userId, nom_projet, slug]
    );

    const project = result.rows[0];

    res.status(201).json({
      ...project,
      eeat_elements: []
    });
  } catch (error: any) {
    console.error('Erreur createProject:', error);

    // Gérer le cas où le slug existe déjà
    if (error.code === '23505') {
      return res.status(409).json({ error: 'Un projet avec ce nom existe déjà' });
    }

    res.status(500).json({ error: 'Erreur serveur' });
  }
}

/**
 * PUT /api/projects/:id
 * Modifier un projet (+ ses éléments E-E-A-T)
 */
export async function updateProject(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { eeat_elements, ...projectUpdates } = req.body;

    // Construire la requête SQL dynamiquement
    const fields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    Object.entries(projectUpdates).forEach(([key, value]) => {
      if (key !== 'id' && key !== 'user_id' && key !== 'date_creation') {
        fields.push(`${key} = $${paramIndex}`);
        values.push(value);
        paramIndex++;
      }
    });

    fields.push(`updated_at = NOW()`);
    values.push(id);

    if (fields.length > 1) {
      const updateQuery = `
        UPDATE projects
        SET ${fields.join(', ')}
        WHERE id = $${paramIndex}
        RETURNING *
      `;

      const result = await pool.query(updateQuery, values);

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Projet introuvable' });
      }
    }

    // Gérer les éléments E-E-A-T si fournis
    if (eeat_elements && Array.isArray(eeat_elements)) {
      // Supprimer les anciens éléments
      await pool.query('DELETE FROM eeat_elements WHERE project_id = $1', [id]);

      // Insérer les nouveaux
      if (eeat_elements.length > 0) {
        for (const el of eeat_elements) {
          await pool.query(
            'INSERT INTO eeat_elements (project_id, titre, contenu) VALUES ($1, $2, $3)',
            [id, el.titre, el.contenu]
          );
        }
      }
    }

    // Récupérer le projet mis à jour avec ses E-E-A-T
    const projectResult = await pool.query('SELECT * FROM projects WHERE id = $1', [id]);
    const eeaTResult = await pool.query(
      'SELECT id, titre, contenu FROM eeat_elements WHERE project_id = $1',
      [id]
    );

    res.json({
      ...projectResult.rows[0],
      eeat_elements: eeaTResult.rows
    });
  } catch (error) {
    console.error('Erreur updateProject:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
}

/**
 * DELETE /api/projects/:id
 * Supprimer un projet (cascade: supprime aussi E-E-A-T, redactions, etc.)
 */
export async function deleteProject(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const result = await pool.query('DELETE FROM projects WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Projet introuvable' });
    }

    res.json({ success: true, message: 'Projet supprimé' });
  } catch (error) {
    console.error('Erreur deleteProject:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
}
