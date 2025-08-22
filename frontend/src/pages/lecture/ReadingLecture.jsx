import ReactMarkdown from 'react-markdown';
import './LectureContent.css';

const ReadingLecture = ({ lecture, onComplete }) => {
  const handleComplete = () => {
    // Mark reading as complete when user reaches bottom of content
    onComplete(lecture._id);
  };

  return (
    <div className="reading-lecture">
      <h1>{lecture.title}</h1>
      <div className="reading-content">
        <ReactMarkdown>{lecture.content}</ReactMarkdown>
      </div>
      <button 
        onClick={handleComplete}
        className="common-btn mark-complete-btn"
      >
        Mark as Complete
      </button>
    </div>
  );
};

export default ReadingLecture;
