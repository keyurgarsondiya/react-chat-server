import { Types } from 'mongoose';

export interface UserModel extends Document {
  _id: Types.ObjectId;
  email: string;
  fullName: string;
  password: string;
  profilePic: string;
  createdAt: Date;
  updatedAt: Date;
}
