import mongoose from 'mongoose';

const resourceSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    type:  { type: String, default: 'article' },
    url:   { type: String, required: true },
  },
  { _id: false }
);

const topicSchema = new mongoose.Schema({
  topicId:           { type: String },
  title:             { type: String, required: true },
  description:       { type: String, default: '' },
  resources:         [resourceSchema],
  practiceQuestions: [{ type: String }],
  completed:         { type: Boolean, default: false },
  completedAt:       { type: Date, default: null },
});

const learningPathSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    pathKey:     { type: String, required: true, index: true },
    title:       { type: String, required: true },
    description: { type: String, default: '' },
    reason:      { type: String, default: '' },
    icon:        { type: String, default: '📚' },
    color:       { type: String, default: '#7c3aed' },
    level: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced'],
      default: 'Beginner',
    },
    priority: {
      type: String,
      enum: ['High', 'Medium', 'Low'],
      default: 'Medium',
    },
    topics:       [topicSchema],
    triggerScore: { type: Number, default: 0 },
    triggerArea:  { type: String, default: '' },
    progress:     { type: Number, default: 0, min: 0, max: 100 },
    started:      { type: Boolean, default: false },
    startedAt:    { type: Date, default: null },
    completedAt:  { type: Date, default: null },
  },
  { timestamps: true }
);

// ── Indexes ──────────────────────────────────────────────────────────────────
// Prevent duplicate path entries for same user
learningPathSchema.index({ userId: 1, pathKey: 1 }, { unique: true });
learningPathSchema.index({ userId: 1, createdAt: -1 });

// ── Auto-compute progress on save ─────────────────────────────────────────────
learningPathSchema.pre('save', function (next) {
  if (this.topics && this.topics.length > 0) {
    const done = this.topics.filter((t) => t.completed).length;
    this.progress = Math.round((done / this.topics.length) * 100);
    if (this.progress === 100 && !this.completedAt) {
      this.completedAt = new Date();
    } else if (this.progress < 100) {
      this.completedAt = null;
    }
  }
  next();
});

const LearningPath = mongoose.model('LearningPath', learningPathSchema);
export default LearningPath;
