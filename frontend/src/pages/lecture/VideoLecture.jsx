import { server } from '../../main';
import './LectureContent.css';

const VideoLecture = ({ lecture, onComplete }) => {
  return (
    <div className="video-lecture">
      <h1>{lecture.title}</h1>
      <video
        src={`${server}/${lecture.video}`}
        controls
        controlsList="nodownload noremoteplayback"
        disablePictureInPicture
        disableRemotePlayback
        autoPlay
        onEnded={() => onComplete(lecture._id)}
      />
      <div className="video-description">
        <h3>{lecture.description}</h3>
      </div>
    </div>
  );
};

export default VideoLecture;
