import { Request, Response } from 'express';
import User from '../models/user.model';
import bcrypt from 'bcryptjs';
import asyncHandler from 'express-async-handler';
import { generateToken } from '../utils/generate-token';
import { UserModel } from '../types/user-model';
import { AuthRequest } from '../types/auth-request';
import cloudinary from '../utils/cloudinary';

export const signup = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { fullName, email, password } = req.body;
    try {
      if (!fullName || !email || !password) {
        res.status(400).json({ message: 'All mandatory fields are required' });
        return;
      }
      if (password.length < 6) {
        res
          .status(400)
          .json({ message: 'Password must be atleast 6 characters long' });
        return;
      }

      const user = await User.findOne({ email });
      if (user) {
        res.status(400).json({ message: 'User already exists' });
        return;
      }

      const salt = await bcrypt.genSalt(10);
      const hashPassword = await bcrypt.hash(password, salt);

      const newUser = new User({
        fullName,
        email,
        password: hashPassword,
      });

      if (newUser) {
        await newUser.save();

        //   generate JWT token
        generateToken(newUser._id, res);

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

export const login = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user: UserModel | null = await User.findOne({ email });
    if (!user) {
      res.status(400).json({ message: 'Invalide Credentials' });
      return;
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      res.status(400).json({ message: 'Invalid Credentials' });
      return;
    }

    generateToken(user._id, res);

    res.status(200).json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      profilePic: user.profilePic,
    });
  } catch (error: unknown) {
    console.log('Error in login controller ', (error as Error).message);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

export const logout = asyncHandler((req: Request, res: Response) => {
  try {
    res.cookie('jwt', '', {
      maxAge: 0,
    });
    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error: unknown) {
    console.log('Error in logout controller ', (error as Error).message);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

export const updateProfile = asyncHandler(async (req, res) => {
  try {
    const { profilePic } = req.body;
    const userId = (req as AuthRequest).user._id;

    if (!profilePic) {
      res.status(400).json({ message: 'Profile pic is required' });
    }

    const uploadResponse = await cloudinary.uploader.upload(profilePic);
    const updateUser = await User.findByIdAndUpdate(
      userId,
      { profilePic: uploadResponse.secure_url },
      { new: true },
    );

    res.status(200).json(updateUser);
  } catch (error: unknown) {
    console.log('Error in update profile: ', (error as Error).message);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

export const checkAuth = asyncHandler(async (req, res) => {
  try {
    const user = (req as AuthRequest).user;
    console.log('User: ', user);
    res.status(200).json(user);
  } catch (error) {
    console.log('Error in chec auth: ', (error as Error).message);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});
