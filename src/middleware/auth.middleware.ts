import { Request, Response, NextFunction } from 'express';
import asyncHandler from 'express-async-handler';
import jwt, { JwtPayload } from 'jsonwebtoken';
import User from '../models/user.model';
import { AuthRequest } from '../types/auth-request';

export const protectRoute = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const token = req.cookies.jwt;

      if (!token) {
        res
          .status(401)
          .json({ message: 'Unauthorized user - Token does not exist' });
        return;
      }
      const JWT_SECRET = process.env.JWT_SECRET || '';
      const userDecoded = (await jwt.verify(token, JWT_SECRET)) as JwtPayload;
      const user = await User.findById(userDecoded.userId).select('-password');

      if (!user) {
        res.status(404).json({ message: 'User not found' });
        return;
      }

      (req as AuthRequest).user = user;
      next();
    } catch (error) {
      console.log('Error in protect route', (error as Error).message);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  },
);
