import jwt from 'jsonwebtoken';

export function generateToken(customerId) {
  return jwt.sign({ customerId }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

export const authCookieOptions = {
  httpOnly: true,
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
  maxAge: 7 * 24 * 60 * 60 * 1000
};
