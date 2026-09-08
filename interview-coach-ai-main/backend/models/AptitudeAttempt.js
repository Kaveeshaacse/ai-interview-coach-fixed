import mongoose from 'mongoose';

const userAnswerSchema = new mongoose.Schema(
  {
    questionId:     { type: Number },
    question:       { type: String, default: '' },
    category:       { type: String, default: '' },
    options:        [String],
    selectedAnswer: { type: String, default: null },
    correctAnswer:  { type: String, default: '' },
    isCorrect:      { type: Boolean, default: false },
    status: {
      type: String,
      enum: ['correct', 'wrong', 'unanswered'],
      default: 'unanswered',
    },
    explanation: { type: String, default: '' },
  },
  { _id: false }
);

const categoryBreakdownSchema = new mongoose.Schema(
  {
    label: String,
    value: Number,
    color: String,
  },
  { _id: false }
);

const aptitudeAttemptSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    category:       { type: String, default: 'quantitative', index: true },
    totalQuestions: { type: Number, required: true, default: 10 },
    correctAnswers: { type: Number, required: true, default: 0 },
    wrongAnswers:   { type: Number, required: true, default: 0 },
    unanswered:     { type: Number, required: true, default: 0 },
    score:          { type: Number, required: true, default: 0, index: true },
    accuracy:       { type: Number, required: true, default: 0 },
    timeTaken:      { type: String, default: '08:45' },

    categoryScores: {
      type: Map,
      of: Number,
      default: {},
    },
    weakAreas:         [String],
    categoryBreakdown: [categoryBreakdownSchema],
    userAnswers:       [userAnswerSchema],

    submittedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

// ── Indexes ──────────────────────────────────────────────────────────────────
aptitudeAttemptSchema.index({ userId: 1, createdAt: -1 });
aptitudeAttemptSchema.index({ userId: 1, category: 1, createdAt: -1 });

const AptitudeAttempt = mongoose.model('AptitudeAttempt', aptitudeAttemptSchema);
export default AptitudeAttempt;
