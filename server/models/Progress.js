import mongoose from "mongoose";

// Schema for quiz attempts
const QuizAttemptSchema = new mongoose.Schema({
  submittedAnswers: [{
    questionIndex: Number,
    selectedOption: Number
  }],
  score: {
    type: Number,
    required: true
  },
  passed: {
    type: Boolean,
    required: true
  },
  attemptedAt: {
    type: Date,
    default: Date.now
  }
});

// Schema for completed lectures
const CompletedLectureSchema = new mongoose.Schema({
  lecture: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Lecture",
    required: true
  },
  completedAt: {
    type: Date,
    default: Date.now
  },
  // For quiz lectures
  attempts: [QuizAttemptSchema]
});

const schema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Courses",
      required: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    completedLectures: [CompletedLectureSchema],
    currentLecture: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lecture"
    },
    lastAccessed: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true,
  }
);

// Virtual for calculating progress percentage
schema.virtual('progressPercentage').get(async function() {
  const course = await this.populate('course');
  const totalLectures = await mongoose.model('Lecture').countDocuments({ course: this.course });
  return (this.completedLectures.length / totalLectures) * 100;
});

export const Progress = mongoose.model("Progress", schema);
