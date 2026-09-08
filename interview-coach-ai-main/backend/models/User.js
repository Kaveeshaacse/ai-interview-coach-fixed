import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const currentSkillSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    level: { type: Number, default: 0, min: 0, max: 100 },
    category: { type: String, default: 'General' },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    // ── Core Auth ──────────────────────────────────────────────────────────
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email address',
      ],
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },

    // ── Academic Profile ───────────────────────────────────────────────────
    college:        { type: String, default: '', trim: true },
    degree:         { type: String, default: '', trim: true },
    branch:         { type: String, default: '', trim: true },
    graduationYear: { type: String, default: '', trim: true },

    // ── Contact Info ───────────────────────────────────────────────────────
    phone:    { type: String, default: '' },
    location: { type: String, default: '' },
    bio:      { type: String, default: '', maxlength: 500 },

    // ── Professional Links ─────────────────────────────────────────────────
    linkedIn:  { type: String, default: '' },
    github:    { type: String, default: '' },
    portfolio: { type: String, default: '' },
    resumeUrl: { type: String, default: '' },

    // ── Preferences ────────────────────────────────────────────────────────
    jobPreference: { type: String, default: 'Software Engineer' },

    // ── Skills ─────────────────────────────────────────────────────────────
    skills:        [{ type: String }],
    currentSkills: [currentSkillSchema],

    // ── Analytics / Progress Tracking ─────────────────────────────────────
    totalSessions: { type: Number, default: 0 },
    lastLoginAt:   { type: Date, default: null },

    // ── Aggregated scores (kept in sync by dashboard on read) ─────────────
    averageScores: {
      resume:        { type: Number, default: 0 },
      ats:           { type: Number, default: 0 },
      interview:     { type: Number, default: 0 },
      communication: { type: Number, default: 0 },
      coding:        { type: Number, default: 0 },
      aptitude:      { type: Number, default: 0 },
      overall:       { type: Number, default: 0 },
    },

    // ── Weekly Progress snapshots (last 7 days) ───────────────────────────
    weeklyProgress: [
      {
        date:  { type: String },   // e.g. "Mon", "2026-08-25"
        score: { type: Number, default: 0 },
        _id:   false,
      },
    ],
  },
  {
    timestamps: true,
  }
);

// ── Indexes ──────────────────────────────────────────────────────────────────
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ createdAt: -1 });

// ── Hash password before saving ───────────────────────────────────────────────
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// ── Compare password ───────────────────────────────────────────────────────────
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;
