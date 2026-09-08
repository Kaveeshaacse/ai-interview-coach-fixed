import mongoose from 'mongoose';

const answerSchema = new mongoose.Schema(
  {
    questionId:     { type: mongoose.Schema.Types.Mixed },  // Number or string
    question:       { type: String, default: '' },
    userAnswer:     { type: String, default: '' },
    score:          { type: Number, default: 0 },
    clarityScore:   { type: Number, default: 0 },
    grammarScore:   { type: Number, default: 0 },
    confidenceScore:{ type: Number, default: 0 },
    technicalScore: { type: Number, default: 0 },
    feedback:       { type: String, default: '' },
    strengths:      [String],
    weaknesses:     [String],
    improvedAnswer: { type: String, default: '' },
    evaluatedAt:    { type: Date, default: Date.now },
  },
  { _id: false }
);

const questionSchema = new mongoose.Schema(
  {
    id:         { type: mongoose.Schema.Types.Mixed },
    question:   { type: String, required: true },
    topic:      { type: String, default: '' },
    category:   { type: String, default: '' },
    difficulty: { type: String, default: 'Medium' },
    technology: { type: String, default: '' },
  },
  { _id: false }
);

const interviewSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    role:       { type: String, required: true, default: 'Software Engineer' },
    type: {
      type: String,
      enum: ['Behavioral', 'Technical', 'HR', 'Case Study'],
      default: 'Behavioral',
    },
    technology: { type: String, default: '' },
    difficulty: {
      type: String,
      enum: ['Easy', 'Medium', 'Hard'],
      default: 'Medium',
    },

    questions: [questionSchema],
    answers:   [answerSchema],

    totalScore:      { type: Number, default: 0, min: 0, max: 100 },
    overallFeedback: { type: String, default: '' },
    strengths:       [String],
    weaknesses:      [String],
    recommendedTopics: [String],

    status: {
      type: String,
      enum: ['in-progress', 'completed'],
      default: 'in-progress',
      index: true,
    },
    durationMinutes: { type: Number, default: 15 },
    completedAt:     { type: Date, default: null },
  },
  {
    timestamps: true,
  }
);

// ── Indexes ──────────────────────────────────────────────────────────────────
interviewSchema.index({ userId: 1, createdAt: -1 });
interviewSchema.index({ userId: 1, type: 1, createdAt: -1 });
interviewSchema.index({ userId: 1, status: 1 });

// Auto-set completedAt when status becomes completed
interviewSchema.pre('save', function (next) {
  if (this.isModified('status') && this.status === 'completed' && !this.completedAt) {
    this.completedAt = new Date();
  }
  next();
});

const Interview = mongoose.model('Interview', interviewSchema);
export default Interview;
