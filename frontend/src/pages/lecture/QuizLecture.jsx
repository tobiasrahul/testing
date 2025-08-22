import { useState } from 'react';
import './LectureContent.css';

const QuizLecture = ({ lecture, onSubmitQuiz }) => {
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [quizResults, setQuizResults] = useState(null);

  const handleOptionSelect = (questionIndex, optionIndex) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [questionIndex]: optionIndex
    });
  };

  const handleSubmit = async () => {
    // Check if all questions are answered
    if (Object.keys(selectedAnswers).length !== lecture.questions.length) {
      alert('Please answer all questions before submitting.');
      return;
    }

    // Convert answers to array format expected by backend
    const answers = lecture.questions.map((_, index) => selectedAnswers[index]);
    
    const results = await onSubmitQuiz(lecture._id, answers);
    setQuizResults(results);
    setSubmitted(true);
  };

  return (
    <div className="quiz-lecture">
      <h1>{lecture.title}</h1>
      <div className="quiz-description">{lecture.description}</div>

      <div className="quiz-questions">
        {lecture.questions.map((question, qIndex) => (
          <div key={qIndex} className="quiz-question">
            <h3>Question {qIndex + 1}: {question.questionText}</h3>
            <div className="options">
              {question.options.map((option, oIndex) => (
                <div key={oIndex} className="option">
                  <input
                    type="radio"
                    id={`q${qIndex}-o${oIndex}`}
                    name={`question-${qIndex}`}
                    checked={selectedAnswers[qIndex] === oIndex}
                    onChange={() => handleOptionSelect(qIndex, oIndex)}
                    disabled={submitted}
                  />
                  <label htmlFor={`q${qIndex}-o${oIndex}`}>
                    {option}
                  </label>
                  {submitted && quizResults && (
                    <span className={`result-indicator ${
                      quizResults.questionResults[qIndex].correct && 
                      quizResults.questionResults[qIndex].selectedOption === oIndex
                        ? 'correct'
                        : quizResults.questionResults[qIndex].selectedOption === oIndex
                          ? 'incorrect'
                          : ''
                    }`}>
                      {quizResults.questionResults[qIndex].correct && 
                       quizResults.questionResults[qIndex].selectedOption === oIndex && '✓'}
                      {!quizResults.questionResults[qIndex].correct && 
                       quizResults.questionResults[qIndex].selectedOption === oIndex && '✗'}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {!submitted ? (
        <button 
          onClick={handleSubmit}
          className="common-btn submit-quiz-btn"
        >
          Submit Quiz
        </button>
      ) : (
        <div className="quiz-results">
          <h2>Quiz Results</h2>
          <div className="score">Score: {quizResults.score}%</div>
          {quizResults.passed ? (
            <div className="pass-message">
              Congratulations! You passed the quiz!
            </div>
          ) : (
            <div className="fail-message">
              You didn't pass this time. Required score: {lecture.passingGrade}%. 
              Feel free to review the material and try again!
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default QuizLecture;
