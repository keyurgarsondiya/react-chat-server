import { Request, Response, NextFunction } from 'express';
import asyncHandler from 'express-async-handler';
import jwt, {
  JsonWebTokenError,
  JwtPayload,
  TokenExpiredError,
} from 'jsonwebtoken';
import User from '../models/user.model';
import { AuthRequest } from '../types/auth-request';

export const protectRoute = asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const token = req.cookies.jwt;
      console.log('Token: ', token);
      if (!token) {
        res.status(401).json({
          message: 'Unauthorized user - Token does not exist',
          unauthorized: true,
        });
        return;
      }
      const JWT_SECRET = process.env.JWT_SECRET || '';
      const userDecoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
      const user = await User.findById(userDecoded.userId).select('-password');

      if (!user) {
        res.status(404).json({ message: 'User not found', unauthorized: true });
        return;
      }

      (req as AuthRequest).user = user.toObject();
      next();
    } catch (error) {
      console.log('Error in protect route', (error as Error).message);
      if (
        error instanceof JsonWebTokenError ||
        error instanceof TokenExpiredError
      ) {
        res.status(401).json({
          message: 'Unauthorized user - Invalid or expired token',
          unauthorized: true,
        });
      } else {
        res.status(500).json({ message: 'Internal Server Error' });
      }
    }
  },
);
