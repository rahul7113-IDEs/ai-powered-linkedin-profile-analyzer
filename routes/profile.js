import express from 'express';
import multer from 'multer';
import { analyzeProfile, uploadResume, getAnalysisHistory, getProfile, generateSuggestions, getDashboardStats, extractTextFromImage, deleteProfile } from '../controllers/profile.js';

const router = express.Router();

// Memory storage for multer
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post('/analyze-profile', analyzeProfile);
router.post('/upload-resume', upload.single('resume'), uploadResume);
router.post('/extract-text', upload.single('image'), extractTextFromImage);
router.get('/analysis', getAnalysisHistory);
router.get('/analysis/:id', getProfile);
router.delete('/analysis/:id', deleteProfile);
router.get('/stats', getDashboardStats);
router.post('/generate-suggestions', generateSuggestions);

export default router;
