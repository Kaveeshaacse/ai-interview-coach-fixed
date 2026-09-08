import mongoose from 'mongoose';

const skillGapSchema = new mongoose.Schema(
  {
    name:         { type: String, required: true },
    priority: {
      type: String,
      enum: ['high', 'medium', 'low'],
      default: 'medium',
    },
    reason:       { type: String, default: '' },
    currentLevel: { type: Number, default: 0, min: 0, max: 100 },
  },
  { _id: false }
);

const recommendationSchema = new mongoose.Schema(
  {
    skill:    { type: String, required: true },
    priority: {
      type: String,
      enum: ['high', 'medium', 'low'],
      default: 'medium',
    },
    reason:        { type: String, default: '' },
    topics:        [String],
    resources: [
      {
        title: String,
        url:   String,
        _id:   false,
      },
    ],
    estimatedTime: { type: String, default: '' },
  },
  { _id: false }
);

const skillAssessmentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    currentSkills: [
      {
        name:     { type: String },
        level:    { type: Number, default: 0 },
        category: { type: String, default: 'General' },
        _id:      false,
      },
    ],
    skillGaps:       [skillGapSchema],
    recommendations: [recommendationSchema],

    // Snapshot of scores that drove this assessment
    scoreSnapshot: {
      codingScore:        { type: Number, default: 0 },
      aptitudeScore:      { type: Number, default: 0 },
      interviewScore:     { type: Number, default: 0 },
      communicationScore: { type: Number, default: 0 },
      resumeScore:        { type: Number, default: 0 },
      atsScore:           { type: Number, default: 0 },
      overallScore:       { type: Number, default: 0 },
    },
  },
  {
    timestamps: true,
  }
);

// ── Indexes ──────────────────────────────────────────────────────────────────
skillAssessmentSchema.index({ userId: 1, createdAt: -1 });

const SkillAssessment = mongoose.model('SkillAssessment', skillAssessmentSchema);
export default SkillAssessment;
