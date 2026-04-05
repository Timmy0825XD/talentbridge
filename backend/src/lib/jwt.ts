import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET as string;

export interface JwtPayload {
  userId: string;
  role: string;
}

// Genera un token JWT firmado con el userId y role
export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, SECRET, { expiresIn: '7d' });
}

// Verifica y decodifica un token JWT
export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, SECRET) as JwtPayload;
}