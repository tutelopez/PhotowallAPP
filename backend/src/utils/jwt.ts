import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'secret_key';
const JWT_EXPIRES_IN = '7d'; // 7 días de expiración

export const generateToken = (payload: object) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

export const verifyToken = (token: string) => {
  return jwt.verify(token, JWT_SECRET);
};
