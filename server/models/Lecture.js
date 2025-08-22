import mongoose from "mongoose";

// Schema for quiz questions
const QuestionSchema = new mongoose.Schema({
  questionText: {
    type: String,
    required: true
  },
  options: [{
    type: String,
    required: true
  }],
  correctAnswer: {
    type: Number,  // Index of the correct option
    required: true
  }
});

const schema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  lectureType: {
    type: String,
    enum: ['video', 'reading', 'quiz'],
    required: true,
  },
  // For video lectures
  video: {
    type: String,
    required: function() { return this.lectureType === 'video'; }
  },
  // For reading lectures
  content: {
    type: String,
    required: function() { return this.lectureType === 'reading'; }
  },
  // For quiz lectures
  questions: {
    type: [QuestionSchema],
    required: function() { return this.lectureType === 'quiz'; },
    validate: {
      validator: function(questions) {
        return this.lectureType !== 'quiz' || questions.length > 0;
      },
      message: 'Quiz must have at least one question'
    }
  },
  passingGrade: {
    type: Number,
    default: 70,
    min: 0,
    max: 100,
    required: function() { return this.lectureType === 'quiz'; }
  },
  // Common fields
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Courses",
    required: true,
  },
  orderIndex: {
    type: Number,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const Lecture = mongoose.model("Lecture", schema);
