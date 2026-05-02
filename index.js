import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Routes
import profileRoutes from './routes/profile.js';
import authRoutes from './routes/auth.js';
import { protect } from './middleware/auth.js';

app.use('/api/auth', authRoutes);
app.use('/api', protect, profileRoutes);

app.get('/', (req, res) => {
  res.send('AI LinkedIn Analyzer Backend is running');
});

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ai-linkedin-analyzer', {
  tls: true,
  tlsAllowInvalidCertificates: true,
})
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => console.error('MongoDB connection error:', error));
