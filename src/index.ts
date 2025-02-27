import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { connectDB } from './config/db';
import authRoutes from './routes/auth.route';
import messageRoutes from './routes/message.route';

const app = express();

dotenv.config();

app.use(
  cors({
    origin: 'http://localhost:3000',
    credentials: true,
  }),
);
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb' }));
app.use(cookieParser());

const PORT = process.env.PORT || 5000;

app.use('/api/auth', authRoutes);
app.use('/api/message', messageRoutes);

app.listen(PORT, () => {
  console.log('Server running on port ' + PORT);
  connectDB();
});
