import mongoose from 'mongoose';

const profileSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        // Assuming simple auth or anonymous tracking for MVP
        default: () => new mongoose.Types.ObjectId().toString()
    },
    originalText: {
        type: String,
        required: true,
    },
    score: {
        total: { type: Number, default: 0 },
        headline: { type: Number, default: 0 },
        skills: { type: Number, default: 0 },
        experience: { type: Number, default: 0 },
        ats: { type: Number, default: 0 },
        completeness: { type: Number, default: 0 }
    },
    atsScore: { type: Number, default: 0 },
    skillMatchPercent: { type: Number, default: 0 },
    predictedRoles: [String],
    semanticSimilarityScore: { type: Number, default: 0 },
    missingKeywords: [String],
    smartSuggestions: [String],
    linkedinSuggestions: {
        headline: String,
        about: String,
        experience: [String]
    },
    targetRole: {
        type: String,
        default: 'General'
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Profile analysis must belong to a user']
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.model('Profile', profileSchema);
