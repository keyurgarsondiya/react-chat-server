import { Types } from 'mongoose';

export interface MessageModel extends Document {
  _id: Types.ObjectId;
  senderId: Types.ObjectId;
  receiverId: Types.ObjectId;
  text: string;
  image: string;
  createdAt: Date;
  updatedAt: Date;
}
