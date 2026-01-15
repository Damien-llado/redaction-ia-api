import { Request, Response } from 'express';
import { pool } from '../config/database';
import { generateToken } from '../utils/jwt';

/**
 * POST /api/auth/login
 * Authentification avec APP_PASSWORD
 */
export async function login(req: Request, res: Response) {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ error: 'Mot de passe requis' });
    }

    // Vérifier APP_PASSWORD
    if (password !== process.env.APP_PASSWORD) {
      return res.status(401).json({ error: 'Mot de passe incorrect' });
    }

    // Récupérer l'utilisateur unique
    const result = await pool.query('SELECT * FROM users LIMIT 1');

    if (!result.rows || result.rows.length === 0) {
      return res.status(500).json({ error: 'Utilisateur introuvable' });
    }

    const user = result.rows[0];

    // Générer le JWT
    const token = generateToken(user.id, user.email, user.name);

    return res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    });
  } catch (error) {
    console.error('Erreur login:', error);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}
