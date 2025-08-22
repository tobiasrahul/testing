import TryCatch from "../middlewares/TryCatch.js";
import { Lecture } from "../models/Lecture.js";
import { Progress } from "../models/Progress.js";

// Create a new lecture (reading or quiz)
export const createLecture = TryCatch(async (req, res) => {
  const { title, description, lectureType, content, questions, passingGrade, course } = req.body;
  
  // Get the current highest order index for this course
  const highestOrder = await Lecture.findOne({ course })
    .sort({ orderIndex: -1 })
    .select('orderIndex');
  
  const orderIndex = highestOrder ? highestOrder.orderIndex + 1 : 0;

  // Validate based on lecture type
  if (lectureType === 'quiz' && (!questions || questions.length === 0)) {
    return res.status(400).json({
      message: "Quiz lectures must have at least one question"
    });
  }

  if (lectureType === 'reading' && !content) {
    return res.status(400).json({
      message: "Reading lectures must have content"
    });
  }

  const lecture = await Lecture.create({
    title,
    description,
    lectureType,
    content,
    questions,
    passingGrade,
    course,
    orderIndex
  });

  res.status(201).json({
    message: "Lecture created successfully",
    lecture
  });
});

// Submit a quiz attempt
export const submitQuiz = TryCatch(async (req, res) => {
  const { lectureId } = req.params;
  const { answers } = req.body;

  const lecture = await Lecture.findById(lectureId);
  if (!lecture || lecture.lectureType !== 'quiz') {
    return res.status(400).json({
      message: "Invalid lecture or not a quiz"
    });
  }

  // Calculate score
  let correctAnswers = 0;
  const questionResults = answers.map((answer, index) => {
    const isCorrect = lecture.questions[index].correctAnswer === answer;
    if (isCorrect) correctAnswers++;
    return {
      questionIndex: index,
      selectedOption: answer,
      correct: isCorrect
    };
  });

  const score = (correctAnswers / lecture.questions.length) * 100;
  const passed = score >= lecture.passingGrade;

  // Record the attempt and update progress
  const progress = await Progress.findOne({
    user: req.user._id,
    course: lecture.course
  });

  const completedLectureIndex = progress.completedLectures.findIndex(
    cl => cl.lecture.toString() === lectureId
  );

  if (completedLectureIndex === -1) {
    // First attempt
    progress.completedLectures.push({
      lecture: lectureId,
      attempts: [{
        submittedAnswers: questionResults,
        score,
        passed
      }]
    });
  } else {
    // Additional attempt
    progress.completedLectures[completedLectureIndex].attempts.push({
      submittedAnswers: questionResults,
      score,
      passed
    });
  }

  // If passed, mark as completed if not already
  if (passed && completedLectureIndex === -1) {
    progress.completedLectures.push({
      lecture: lectureId,
      completedAt: new Date()
    });
  }

  await progress.save();

  res.json({
    message: passed ? "Quiz passed successfully!" : "Quiz attempt recorded",
    score,
    passed,
    questionResults
  });
});

// Mark a reading lecture as complete
export const completeReadingLecture = TryCatch(async (req, res) => {
  const { lectureId } = req.params;

  const lecture = await Lecture.findById(lectureId);
  if (!lecture || lecture.lectureType !== 'reading') {
    return res.status(400).json({
      message: "Invalid lecture or not a reading type"
    });
  }

  const progress = await Progress.findOne({
    user: req.user._id,
    course: lecture.course
  });

  // Check if already completed
  if (progress.completedLectures.some(cl => cl.lecture.toString() === lectureId)) {
    return res.json({
      message: "Lecture already completed"
    });
  }

  progress.completedLectures.push({
    lecture: lectureId,
    completedAt: new Date()
  });

  await progress.save();

  res.json({
    message: "Reading lecture marked as complete"
  });
});

// Get the next available lecture
export const getNextLecture = TryCatch(async (req, res) => {
  const { courseId } = req.params;
  
  const progress = await Progress.findOne({
    user: req.user._id,
    course: courseId
  }).populate('completedLectures.lecture');

  const allLectures = await Lecture.find({ course: courseId })
    .sort('orderIndex');

  if (!allLectures.length) {
    return res.status(404).json({
      message: "No lectures found in this course"
    });
  }

  // If no lectures completed, return first lecture
  if (!progress.completedLectures.length) {
    return res.json({
      nextLecture: allLectures[0]
    });
  }

  // Find the lecture with the lowest orderIndex that hasn't been completed
  const nextLecture = allLectures.find(lecture => 
    !progress.completedLectures.some(cl => 
      cl.lecture._id.toString() === lecture._id.toString()
    )
  );

  res.json({
    nextLecture: nextLecture || null,
    allCompleted: !nextLecture
  });
});
