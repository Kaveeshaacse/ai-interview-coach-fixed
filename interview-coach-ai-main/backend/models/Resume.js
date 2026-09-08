import mongoose from 'mongoose';

const resumeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    fileName: {
      type: String,
      required: true,
    },
    fileUrl: {
      type: String,
    },
    fileSize: {
      type: Number,
    },
    mimeType: {
      type: String,
    },
    extractedText: {
      type: String,
      default: '',
    },
    // Overall blended resume score
    resumeScore: {
      type: Number,
      default: 0,
    },
    // Granular section breakdown scores
    sectionBreakdown: {
      atsCompatibility: { type: Number, default: 0 },
      skills: { type: Number, default: 0 },
      keywords: { type: Number, default: 0 },
      education: { type: Number, default: 0 },
      experience: { type: Number, default: 0 },
      projects: { type: Number, default: 0 },
      certifications: { type: Number, default: 0 },
      formatting: { type: Number, default: 0 },
      contentQuality: { type: Number, default: 0 },
      jobRelevance: { type: Number, default: 0 },
    },
    // Extracted personal information
    extractedInfo: {
      name: String,
      email: String,
      phone: String,
      location: String,
      linkedIn: String,
      gitHub: String,
      education: [String],
      experience: [String],
      certifications: [String],
      projects: [String],
      skills: [String],
      languages: [String],
      wordCount: Number,
      estimatedPages: Number,
    },
    // Keyword analysis results
    keywordAnalysis: {
      keywordsFound: [
        {
          keyword: String,
          frequency: Number,
          importance: String,
        },
      ],
      missingKeywords: [
        {
          keyword: String,
          importance: String,
          suggestion: String,
        },
      ],
      keywordsToImprove: [
        {
          keyword: String,
          frequency: Number,
          found: Boolean,
          recommendation: String,
          importance: String,
        },
      ],
    },
    // Improvement suggestions
    improvementSuggestions: [
      {
        section: String,
        type: String,
        current: String,
        improved: String,
        reason: String,
      },
    ],
    // General resume health analysis
    resumeAnalysis: {
      good: [String],
      improvements: [String],
      missing: [String],
      recommendations: [String],
    },
    // Skills extracted
    skills: [String],
    // ATS score
    atsScore: {
      type: Number,
      default: 0,
    },
    targetRole: {
      type: String,
      default: 'Software Engineer',
    },
    atsDetails: {
      score: Number,
      targetRole: String,
      statusLabel: String,
      roleMatchedKeywords: [String],
      missingKeywords: [String],
      roleImprovements: [String],
      scoringBreakdown: {
        keywordMatchScore:       Number,
        experienceProjectScore:  Number,
        sectionScore:            Number,
        structureScore:          Number,
        terminologyScore:        Number,
        contactScore:            Number,
      },
    },

    // Raw scoring breakdown stored separately for ATS page display
    rawScoringBreakdown: {
      keywordMatchScore:       { type: Number, default: 0 },
      experienceProjectScore:  { type: Number, default: 0 },
      sectionScore:            { type: Number, default: 0 },
      structureScore:          { type: Number, default: 0 },
      terminologyScore:        { type: Number, default: 0 },
      contactScore:            { type: Number, default: 0 },
      totalScore:              { type: Number, default: 0 },
    },
    // Job description match (stored if JD was provided)
    jobMatch: {
      matchScore: Number,
      matchingSkills: [String],
      missingSkills: [String],
      matchingKeywords: [String],
      missingKeywords: [String],
      recommendations: [String],
      summary: String,
      jobDescriptionText: String,
    },
    // Version tracking
    version: {
      type: Number,
      default: 1,
    },
  },
  {
    timestamps: true,
  }
);

// ── Indexes ──────────────────────────────────────────────────────────────────
resumeSchema.index({ userId: 1, createdAt: -1 });
resumeSchema.index({ userId: 1, atsScore: -1 });
resumeSchema.index({ userId: 1, targetRole: 1 });

// Auto-increment version when a user uploads a new resume
resumeSchema.pre('save', async function () {
  if (this.isNew) {
    const count = await this.constructor.countDocuments({ userId: this.userId });
    this.version = count + 1;
  }
});

const Resume = mongoose.model('Resume', resumeSchema);
export default Resume;
