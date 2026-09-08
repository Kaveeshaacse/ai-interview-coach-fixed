import mongoose from 'mongoose';

const codingAttemptSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    problemId:    { type: Number, required: true, index: true },
    problemTitle: { type: String, required: true },
    difficulty: {
      type: String,
      enum: ['Easy', 'Medium', 'Hard'],
      default: 'Easy',
    },
    category: { type: String, default: 'Arrays' },
    language: {
      type: String,
      enum: ['Java', 'Python', 'C++', 'JavaScript'],
      default: 'Java',
    },
    code: { type: String, required: true },
    status: {
      type: String,
      enum: ['Accepted', 'PASSED', 'FAILED', 'Wrong Answer', 'Time Limit Exceeded', 'Runtime Error', 'Compilation Error'],
      default: 'FAILED',
      index: true,
    },
    score:           { type: Number, default: 0, min: 0, max: 100 },
    passedTestCases: { type: Number, default: 0 },
    totalTestCases:  { type: Number, default: 0 },
    executionTimeMs: { type: Number, default: 0 },
    memoryUsedMb:    { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

// ── Indexes ──────────────────────────────────────────────────────────────────
codingAttemptSchema.index({ userId: 1, createdAt: -1 });
codingAttemptSchema.index({ userId: 1, problemId: 1, createdAt: -1 });
codingAttemptSchema.index({ userId: 1, status: 1 });

const CodingAttempt = mongoose.model('CodingAttempt', codingAttemptSchema);
export default CodingAttempt;
