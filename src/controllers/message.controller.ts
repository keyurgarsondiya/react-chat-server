import asyncHandler from 'express-async-handler';
import { AuthRequest } from '../types/auth-request';
import User from '../models/user.model';
import Message from '../models/message.model';
import cloudinary from '../utils/cloudinary';

export const getUsersForSidebar = asyncHandler(async (req, res) => {
  try {
    const loggedInUser = (req as AuthRequest).user._id;
    const filteredUsers = await User.find({
      _id: { $ne: loggedInUser },
    }).select('-password');
    res.status(200).json(filteredUsers);
  } catch (error: unknown) {
    console.log('Error in getUsersForSidebar: ', (error as Error).message);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

export const getMessages = asyncHandler(async (req, res) => {
  try {
    const { id: receiverId } = req.params;
    const senderId = (req as AuthRequest).user._id;

    const messages = await Message.find({
      $or: [
        { senderId: senderId, receiverId: receiverId },
        { senderId: receiverId, receiverId: senderId },
      ],
    });

    res.status(200).json(messages);
  } catch (error: unknown) {
    console.log('Error in getMessages: ', (error as Error).message);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

export const sendMessage = asyncHandler(async (req, res) => {
  try {
    const { text, image } = req.body;
    const { id: receiverId } = req.params;
    const senderId = (req as AuthRequest).user._id;

    let imageUrl;
    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      image: imageUrl,
    });

    await newMessage.save();

    res.status(201).json(newMessage);
  } catch (error: unknown) {
    console.log('Error in sendMessage: ', (error as Error).message);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});
