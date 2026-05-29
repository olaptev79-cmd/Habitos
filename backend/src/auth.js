import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export function hashPassword(password) {
  return bcrypt.hashSync(password, 10);
}

export function verifyPassword(password, hash) {
  return bcrypt.compareSync(password, hash);
}

export function signToken(user) {
  return jwt.sign({ sub: user.id, email: user.email, name: user.name }, process.env.JWT_SECRET, { expiresIn: '7d' });
}
