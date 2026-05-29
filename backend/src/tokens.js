import jwt from 'jsonwebtoken';

export function signAccessToken(user) {
  return jwt.sign({ sub: user.id, email: user.email, role: user.role || 'user', name: user.name }, process.env.JWT_SECRET, { expiresIn: '15m' });
}

export function signRefreshToken(user) {
  return jwt.sign({ sub: user.id, type: 'refresh' }, process.env.JWT_SECRET, { expiresIn: '14d' });
}
