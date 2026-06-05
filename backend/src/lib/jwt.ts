import jwt from 'jsonwebtoken';

export interface JwtPayload {
  userId: string;
  role: string;
}

// Genera un token JWT firmado con el userId y role
export function signToken(payload: JwtPayload): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET no está definido en las variables de entorno');
  return jwt.sign(payload, secret, { expiresIn: '7d' });
}

// Verifica y decodifica un token JWT
export function verifyToken(token: string): JwtPayload {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET no está definido en las variables de entorno');
  return jwt.verify(token, secret) as JwtPayload;
}