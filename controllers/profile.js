import axios from 'axios';
import Profile from '../database/models/Profile.js';
import pdfParse from 'pdf-parse';

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://127.0.0.1:8000';

export const analyzeProfile = async (req, res) => {
    try {
        const { text, targetRole } = req.body;

        if (!text) {
            return res.status(400).json({ error: 'Profile text is required' });
        }

        // Call Python AI Service
        const aiResponse = await axios.post(`${AI_SERVICE_URL}/analyze`, {
            resume_text: text || '',
            linkedin_profile_text: text || '',
            target_role: targetRole || ''
        });

        const aiData = aiResponse.data;
        console.log('--- [DEBUG] AI Response Data Structure ---');
        console.log('Keys in aiData:', Object.keys(aiData));
        if (aiData.linkedin_suggestions) {
            console.log('Keys in linkedin_suggestions:', Object.keys(aiData.linkedin_suggestions));
        }
        console.log('-----------------------------------------');

        // Robust mapping for LinkedIn suggestions
        const linkedInSugg = aiData.linkedin_suggestions || aiData.linkedinSuggestions || {};

        // Save to Database
        const newProfile = new Profile({
            originalText: text,
            atsScore: aiData.ats_score,
            skillMatchPercent: aiData.skill_match_percent,
            predictedRoles: aiData.predicted_roles,
            semanticSimilarityScore: aiData.semantic_similarity_score,
            missingKeywords: aiData.missing_skills,
            smartSuggestions: aiData.suggestions || [],
            linkedinSuggestions: {
                headline: linkedInSugg.headline || linkedInSugg.Headline || '',
                about: linkedInSugg.about || linkedInSugg.About || '',
                experience: linkedInSugg.experience || linkedInSugg.Experience || []
            },
            targetRole: targetRole || 'General',
            user: req.user.id
        });

        await newProfile.save();

        res.status(200).json({
            message: 'Analysis complete',
            data: newProfile
        });

    } catch (error) {
        console.error('Error analyzing profile:', error.message);
        res.status(500).json({ error: 'Failed to analyze profile' });
    }
};

export const uploadResume = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        // Parse PDF
        const dataBuffer = req.file.buffer;
        const pdfData = await pdfParse(dataBuffer);
        const text = pdfData.text;

        res.status(200).json({
            message: 'Resume text extracted successfully',
            text: text
        });

    } catch (error) {
        console.error('Error parsing resume:', error.message);
        res.status(500).json({ error: 'Failed to parse resume PDF' });
    }
};

export const extractTextFromImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No image uploaded' });
        }

        // Forward image to Python AI Service OCR endpoint
        const formData = new FormData();
        const blob = new Blob([req.file.buffer], { type: req.file.mimetype });
        formData.append('file', blob, req.file.originalname);

        const ocrResponse = await axios.post(`${AI_SERVICE_URL}/ocr`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });

        res.status(200).json({
            message: 'Text extracted successfully',
            text: ocrResponse.data.text
        });

    } catch (error) {
        console.error('Error extracting text from image:', error.message);
        res.status(500).json({ error: 'Failed to extract text from image' });
    }
};

export const getAnalysisHistory = async (req, res) => {
    try {
        const history = await Profile.find({ user: req.user.id }).sort({ createdAt: -1 });
        res.status(200).json({
            status: 'success',
            data: history
        });
    } catch (error) {
        console.error('Error fetching history:', error.message);
        res.status(500).json({ error: 'Failed to fetch history' });
    }
};

export const getProfile = async (req, res) => {
    try {
        const profile = await Profile.findOne({ _id: req.params.id, user: req.user.id });
        
        if (!profile) {
            return res.status(404).json({
                status: 'fail',
                message: 'Analysis profile not found'
            });
        }

        res.status(200).json({
            status: 'success',
            data: profile
        });
    } catch (error) {
        console.error('Error fetching profile:', error.message);
        res.status(500).json({ error: 'Failed to fetch analysis details' });
    }
};

export const generateSuggestions = async (req, res) => {
    // For MVP/without OpenAI API Key, we will just return mock data or basic suggestions
    res.status(200).json({
        message: 'Suggestions generated',
        suggestions: {
            headline: "Senior Software Engineer | Building scalable cloud solutions with React & Node.js",
            about: "I am a passionate software engineer with 5+ years of experience in building modern web applications...",
            experience: [
                "Led a team of 4 to deliver a microservices architecture that reduced latency by 40%.",
                "Implemented CI/CD pipelines using GitHub actions, increasing deployment frequency by 2x."
            ]
        }
    });
};

export const getDashboardStats = async (req, res) => {
    try {
        const userId = req.user._id;

        const stats = await Profile.aggregate([
            { $match: { user: userId } },
            {
                $group: {
                    _id: null,
                    avgAtsScore: { $avg: "$atsScore" },
                    totalChecks: { $sum: 1 },
                    roles: { $push: "$targetRole" }
                }
            }
        ]);

        if (!stats || stats.length === 0) {
            return res.status(200).json({
                status: 'success',
                data: {
                    avgScore: 0,
                    totalChecks: 0,
                    targetFocus: 0,
                    topCategory: 'N/A'
                }
            });
        }

        // Calculate top category from roles
        const roleCounts = stats[0].roles.reduce((acc, role) => {
            if (role) {
                acc[role] = (acc[role] || 0) + 1;
            }
            return acc;
        }, {});

        const topCategoryEntry = Object.entries(roleCounts).sort((a, b) => b[1] - a[1])[0];
        const topCategory = topCategoryEntry ? topCategoryEntry[0] : 'General';

        res.status(200).json({
            status: 'success',
            data: {
                avgScore: Math.round(stats[0].avgAtsScore || 0),
                totalChecks: stats[0].totalChecks || 0,
                targetFocus: Math.round(stats[0].avgAtsScore || 0),
                topCategory
            }
        });

    } catch (error) {
        console.error('Error fetching stats:', error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const deleteProfile = async (req, res) => {
    try {
        const profile = await Profile.findOneAndDelete({ _id: req.params.id, user: req.user.id });
        
        if (!profile) {
            return res.status(404).json({
                status: 'fail',
                message: 'Analysis profile not found'
            });
        }

        res.status(200).json({
            status: 'success',
            message: 'Analysis profile deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting profile:', error.message);
        res.status(500).json({ error: 'Failed to delete analysis details' });
    }
};
