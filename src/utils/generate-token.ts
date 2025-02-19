import { Response } from 'express';
import jwt from 'jsonwebtoken';

export const generateToken = (userId: string, res: Response) => {
  const JWT_SECRET = process.env.JWT_SECRET || '';
  const token = jwt.sign({ userId }, JWT_SECRET, {
    expiresIn: '7d',
  });
  res.cookie('jwt', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV !== 'development',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};
