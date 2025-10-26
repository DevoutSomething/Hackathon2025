const mongoose = require('mongoose');

const PdfSchema = new mongoose.Schema({
  title: { type: String, required: true },
  filename: { type: String },
  data: { type: Buffer },
  contentType: { type: String, default: 'application/pdf' },
  createdAt: { type: Date, default: Date.now }
});

const QuizSchema = new mongoose.Schema({
  topic: { type: String },
  quiz: { type: Array, default: [] },
  createdAt: { type: Date, default: Date.now }
});

const UserSchema = new mongoose.Schema({
  // Make uid optional (we'll primarily key users by email)
  uid: { type: String, required: false }, // Firebase UID or provider id
  // Use email as the primary unique identifier for storing preferences
  email: { type: String, required: true, unique: true, index: true },
  displayName: { type: String },
  photoURL: { type: String },
  // Learning preferences (new)
  learningPreference: { type: String, default: null },
  educationLevel: { type: String, default: null },
  // Track where the user last was in the app so we can resume them on sign-in
  lastVisitedRoute: { type: String, default: '/learn' },
  lastSeenAt: { type: Date, default: Date.now },
  pdfs: { type: [PdfSchema], default: [] },
  lastQuiz: { type: QuizSchema, default: null },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

UserSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

// Ensure the model uses the exact 'users' collection name (capitalized) as requested
module.exports = mongoose.model('User', UserSchema, 'Users');