import { Request, Response } from 'express';
import User from '../models/user.model';
import bcrypt from 'bcryptjs';
import asyncHandler from 'express-async-handler';
import { generateToken } from '../utils/generate-token';

export const signup = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { fullName, email, password } = req.body;
    try {
      if (!fullName || !email || !password) {
        res.status(400).json({ message: 'All mandatory fields are required' });
      }
      if (password.length < 6) {
        res
          .status(400)
          .json({ message: 'Password must be atleast 6 characters long' });
      }

      const user = await User.findOne({ email });
      if (user) {
        res.status(400).json({ message: 'User already exists' });
      }

      const salt = await bcrypt.genSalt(10);
      const hashPassword = await bcrypt.hash(password, salt);

      const newUser = new User({
        fullName,
        email,
        password: hashPassword,
      });

      if (newUser) {
        //   generate JWT token
        generateToken(String(newUser._id), res);
        await newUser.save();

        res.status(201).json({
          _id: newUser._id,
          fullName: newUser.fullName,
          email: newUser.email,
          profilePic: newUser.profilePic,
        });
      } else {
        res.status(400).json({ message: 'Invalid User Data' });
      }
    } catch (error: unknown) {
      console.log('Error in signup controller: ', (error as Error).message);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  },
);

export const login = asyncHandler((req: Request, res: Response) => {
  res.send({ message: 'User Login', status: 200 });
});

export const logout = asyncHandler((req: Request, res: Response) => {
  res.send({ message: 'User Logout', status: 200 });
});
