import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';

/**
 * Middleware d'authentification JWT
 * Vérifie le token dans le header Authorization
 */
export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token manquant' });
  }

  try {
    const token = authHeader.substring(7); // Enlever "Bearer "
    const payload = verifyToken(token);

    // Ajouter les infos user à la requête
    (req as any).user = {
      id: payload.user_id,
      email: payload.email,
      name: payload.name
    };

    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token invalide ou expiré' });
  }
}
