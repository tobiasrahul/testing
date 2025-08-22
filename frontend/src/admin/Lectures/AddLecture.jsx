import axios from 'axios';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { server } from '../../main';
import './lectures.css';

const QuizQuestion = ({ index, question, updateQuestion, removeQuestion }) => {
  return (
    <div className="quiz-question">
      <h4>Question {index + 1}</h4>
      <input
        type="text"
        value={question.questionText}
        onChange={(e) => updateQuestion(index, 'questionText', e.target.value)}
        placeholder="Question text"
        required
      />
      {question.options.map((option, optionIndex) => (
        <div key={optionIndex} className="option-row">
          <input
            type="text"
            value={option}
            onChange={(e) => {
              const newOptions = [...question.options];
              newOptions[optionIndex] = e.target.value;
              updateQuestion(index, 'options', newOptions);
            }}
            placeholder={`Option ${optionIndex + 1}`}
            required
          />
          <input
            type="radio"
            name={`correct-${index}`}
            checked={question.correctAnswer === optionIndex}
            onChange={() => updateQuestion(index, 'correctAnswer', optionIndex)}
          />
          <label>Correct</label>
        </div>
      ))}
      <button 
        type="button" 
        className="remove-btn"
        onClick={() => removeQuestion(index)}
      >
        Remove Question
      </button>
    </div>
  );
};

const AddLecture = ({ courseId, onLectureAdded }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [lectureType, setLectureType] = useState('reading');
  const [content, setContent] = useState('');
  const [questions, setQuestions] = useState([]);
  const [passingGrade, setPassingGrade] = useState(70);
  const [btnLoading, setBtnLoading] = useState(false);

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        questionText: '',
        options: ['', '', '', ''],
        correctAnswer: 0
      }
    ]);
  };

  const updateQuestion = (index, field, value) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index][field] = value;
    setQuestions(updatedQuestions);
  };

  const removeQuestion = (index) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    setBtnLoading(true);

    const lectureData = {
      title,
      description,
      lectureType,
      course: courseId,
      ...(lectureType === 'reading' ? { content } : {}),
      ...(lectureType === 'quiz' ? { 
        questions,
        passingGrade: Number(passingGrade)
      } : {})
    };

    try {
      const { data } = await axios.post(
        `${server}/api/lecture/new`,
        lectureData,
        {
          headers: {
            token: localStorage.getItem('token'),
          },
        }
      );

      toast.success(data.message);
      onLectureAdded && onLectureAdded();
      
      // Reset form
      setTitle('');
      setDescription('');
      setContent('');
      setQuestions([]);
      setPassingGrade(70);
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      setBtnLoading(false);
    }
  };

  return (
    <div className="add-lecture">
      <h2>Add New Lecture</h2>
      <form onSubmit={submitHandler}>
        <div className="form-group">
          <label>Title:</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>Description:</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>Lecture Type:</label>
          <select
            value={lectureType}
            onChange={(e) => setLectureType(e.target.value)}
          >
            <option value="reading">Reading</option>
            <option value="quiz">Quiz</option>
          </select>
        </div>

        {lectureType === 'reading' && (
          <div className="form-group">
            <label>Content:</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              rows="10"
              placeholder="Enter text content or links here..."
            />
          </div>
        )}

        {lectureType === 'quiz' && (
          <div className="quiz-section">
            <div className="form-group">
              <label>Passing Grade (%):</label>
              <input
                type="number"
                min="0"
                max="100"
                value={passingGrade}
                onChange={(e) => setPassingGrade(e.target.value)}
                required
              />
            </div>

            <div className="questions-section">
              <h3>Questions</h3>
              {questions.map((question, index) => (
                <QuizQuestion
                  key={index}
                  index={index}
                  question={question}
                  updateQuestion={updateQuestion}
                  removeQuestion={removeQuestion}
                />
              ))}
              <button 
                type="button" 
                className="add-question-btn"
                onClick={addQuestion}
              >
                Add Question
              </button>
            </div>
          </div>
        )}

        <button 
          type="submit" 
          disabled={btnLoading || (lectureType === 'quiz' && questions.length === 0)}
          className="submit-btn"
        >
          {btnLoading ? 'Adding Lecture...' : 'Add Lecture'}
        </button>
      </form>
    </div>
  );
};

export default AddLecture;
