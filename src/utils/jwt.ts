import jwt from 'jsonwebtoken';

interface JWTPayload {
  user_id: string;
  email: string;
  name: string;
}

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-minimum-32-caracteres-pour-jwt';

if (!process.env.JWT_SECRET && process.env.NODE_ENV === 'production') {
  console.warn('⚠️  JWT_SECRET non défini en production !');
}

/**
 * Génère un token JWT valide 30 jours
 */
export function generateToken(userId: string, email: string, name: string): string {
  const payload: JWTPayload = {
    user_id: userId,
    email,
    name
  };

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: '30d',
    algorithm: 'HS256'
  });
}

/**
 * Vérifie et décode un token JWT
 */
export function verifyToken(token: string): JWTPayload {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (error) {
    throw new Error('Token invalide ou expiré');
  }
}
