import mongoose from 'mongoose';

const mistakeSchema = new mongoose.Schema(
  {
    text:  { type: String, default: '' },
    type:  { type: String, default: 'Grammar' },
    severity: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
  },
  { _id: false }
);

const communicationAttemptSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    inputText:       { type: String, required: true },
    wordCount:       { type: Number, default: 0 },
    grammarScore:    { type: Number, default: 0, min: 0, max: 100 },
    clarityScore:    { type: Number, default: 0, min: 0, max: 100 },
    vocabularyScore: { type: Number, default: 0, min: 0, max: 100 },
    confidenceScore: { type: Number, default: 0, min: 0, max: 100 },
    relevanceScore:  { type: Number, default: 0, min: 0, max: 100 },
    overallScore:    { type: Number, default: 0, min: 0, max: 100, index: true },
    mistakes:        [mistakeSchema],
    improvedAnswer:  { type: String, default: '' },
  },
  {
    timestamps: true,
  }
);

// ── Indexes ──────────────────────────────────────────────────────────────────
communicationAttemptSchema.index({ userId: 1, createdAt: -1 });

const CommunicationAttempt = mongoose.model('CommunicationAttempt', communicationAttemptSchema);
export default CommunicationAttempt;
