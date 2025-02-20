import mongoose, { Schema } from 'mongoose';
import { UserModel } from '../types/user-model';

const userSchema = new Schema<UserModel>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    fullName: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    profilePic: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  },
);

const User = mongoose.model('User', userSchema);

export default User;
