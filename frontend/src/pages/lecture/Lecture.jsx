import axios from "axios";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FaLock, FaLockOpen } from "react-icons/fa";
import { TiTick } from "react-icons/ti";
import { useNavigate, useParams } from "react-router-dom";
import Loading from "../../components/loading/Loading";
import { server } from "../../main";
import "./lecture.css";
import "./LectureContent.css";
import QuizLecture from "./QuizLecture";
import ReadingLecture from "./ReadingLecture";

const Lecture = ({ user }) => {
  const [lectures, setLectures] = useState([]);
  const [lecture, setLecture] = useState({});
  const [loading, setLoading] = useState(true);
  const [lecLoading, setLecLoading] = useState(false);
  const [show, setShow] = useState(false);
  const [completedLectures, setCompletedLectures] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const params = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [video, setvideo] = useState("");
  const [videoPrev, setVideoPrev] = useState("");
  const [btnLoading, setBtnLoading] = useState(false);

  if (user && user.role !== "admin" && !user.subscription.includes(params.id))
    return navigate("/");

  async function fetchLectures() {
    try {
      const { data } = await axios.get(`${server}/api/lectures/${params.id}`, {
        headers: {
          token: localStorage.getItem("token"),
        },
      });
      // Sort lectures by orderIndex
      const sortedLectures = data.lectures.sort((a, b) => a.orderIndex - b.orderIndex);
      setLectures(sortedLectures);
      
      // If there are lectures, fetch the first one
      if (sortedLectures.length > 0 && !lecture._id) {
        await fetchLecture(sortedLectures[0]._id);
      }
      setLoading(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error fetching lectures');
      setLoading(false);
    }
  }

  async function fetchLecture(id) {
    setLecLoading(true);
    try {
      const { data } = await axios.get(`${server}/api/lecture/${id}`, {
        headers: {
          token: localStorage.getItem("token"),
        },
      });
      setLecture(data.lecture);
      // Find the index of this lecture
      const index = lectures.findIndex(l => l._id === id);
      if (index !== -1) {
        setCurrentIndex(index);
      }
      setLecLoading(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error fetching lecture');
      setLecLoading(false);
    }
  }

  const isLectureAccessible = (index) => {
    if (user.role === 'admin') return true;
    if (index === 0) return true;
    // Check if previous lecture is completed
    return completedLectures.includes(lectures[index - 1]._id);
  };

  const changeVideoHandler = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.readAsDataURL(file);

    reader.onloadend = () => {
      setVideoPrev(reader.result);
      setvideo(file);
    };
  };

  const submitHandler = async (e) => {
    setBtnLoading(true);
    e.preventDefault();
    const myForm = new FormData();

    myForm.append("title", title);
    myForm.append("description", description);
    myForm.append("file", video);

    try {
      const { data } = await axios.post(
        `${server}/api/course/${params.id}`,
        myForm,
        {
          headers: {
            token: localStorage.getItem("token"),
          },
        }
      );

      toast.success(data.message);
      setBtnLoading(false);
      setShow(false);
      fetchLectures();
      setTitle("");
      setDescription("");
      setvideo("");
      setVideoPrev("");
    } catch (error) {
      toast.error(error.response.data.message);
      setBtnLoading(false);
    }
  };

  const deleteHandler = async (id) => {
    if (confirm("Are you sure you want to delete this lecture")) {
      try {
        const { data } = await axios.delete(`${server}/api/lecture/${id}`, {
          headers: {
            token: localStorage.getItem("token"),
          },
        });

        toast.success(data.message);
        fetchLectures();
      } catch (error) {
        toast.error(error.response.data.message);
      }
    }
  };

  const [completed, setCompleted] = useState("");
  const [completedLec, setCompletedLec] = useState("");
  const [lectLength, setLectLength] = useState("");
  const [progress, setProgress] = useState([]);

  async function fetchProgress() {
    try {
      const { data } = await axios.get(
        `${server}/api/user/progress?course=${params.id}`,
        {
          headers: {
            token: localStorage.getItem("token"),
          },
        }
      );

      setCompleted(data.courseProgressPercentage);
      setCompletedLectures(data.progress[0]?.completedLectures.map(cl => cl.lecture) || []);
      setCompletedLec(data.completedLectures);
      setLectLength(data.allLectures);
      setProgress(data.progress);

      // If we have lectures but no current lecture, fetch the next incomplete one
      if (lectures.length > 0 && !lecture._id) {
        const nextIncompleteIndex = lectures.findIndex(
          lec => !data.progress[0]?.completedLectures.some(cl => cl.lecture === lec._id)
        );
        if (nextIncompleteIndex !== -1) {
          await fetchLecture(lectures[nextIncompleteIndex]._id);
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error fetching progress');
    }
  }

  const addProgress = async (id) => {
    try {
      const { data } = await axios.post(
        `${server}/api/user/progress?course=${params.id}&lectureId=${id}`,
        {},
        {
          headers: {
            token: localStorage.getItem("token"),
          },
        }
      );
      console.log(data.message);
      fetchProgress();
    } catch (error) {
      console.log(error);
    }
  };

  console.log(progress);

  useEffect(() => {
    fetchLectures();
    fetchProgress();
  }, []);
  return (
    <>
      {loading ? (
        <Loading />
      ) : (
        <>
          <div className="progress-container">
            <div className="progress-info">
              <div className="progress-text">
                {completedLec} of {lectLength} lectures completed
              </div>
              <div className="progress-percentage">
                {completed}%
              </div>
            </div>
            <div className="progress-bar">
              <div 
                className="progress-fill"
                style={{ width: `${completed}%` }}
              />
            </div>
          </div>
          <div className="lecture-page">
            <div className="left">
              {lecLoading ? (
                <Loading />
              ) : (
                <>
                  {!lecture._id ? (
                    <h1>Please Select a Lecture</h1>
                  ) : lecture.lectureType === 'video' ? (
                    <VideoLecture 
                      lecture={lecture} 
                      onComplete={addProgress} 
                    />
                  ) : lecture.lectureType === 'reading' ? (
                    <ReadingLecture 
                      lecture={lecture} 
                      onComplete={addProgress} 
                    />
                  ) : lecture.lectureType === 'quiz' ? (
                    <QuizLecture 
                      lecture={lecture} 
                      onSubmitQuiz={async (lectureId, answers) => {
                        try {
                          const { data } = await axios.post(
                            `${server}/api/lecture/${lectureId}/submit-quiz`,
                            { answers },
                            {
                              headers: {
                                token: localStorage.getItem("token"),
                              },
                            }
                          );
                          if (data.passed) {
                            await addProgress(lectureId);
                          }
                          toast.success(data.message);
                          return data;
                        } catch (error) {
                          toast.error(error.response?.data?.message || 'Error submitting quiz');
                          return null;
                        }
                      }}
                    />
                  ) : (
                    <h1>Unsupported lecture type</h1>
                  )}
                </>
              )}
            </div>
            <div className="right">
              {user && user.role === "admin" && (
                <button className="common-btn" onClick={() => setShow(!show)}>
                  {show ? "Close" : "Add Lecture +"}
                </button>
              )}

              {show && (
                <div className="lecture-form">
                  <h2>Add Lecture</h2>
                  <form onSubmit={submitHandler}>
                    <label htmlFor="text">Title</label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                    />

                    <label htmlFor="text">Description</label>
                    <input
                      type="text"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      required
                    />

                    <input
                      type="file"
                      placeholder="choose video"
                      onChange={changeVideoHandler}
                      required
                    />

                    {videoPrev && (
                      <video
                        src={videoPrev}
                        alt=""
                        width={300}
                        controls
                      ></video>
                    )}

                    <button
                      disabled={btnLoading}
                      type="submit"
                      className="common-btn"
                    >
                      {btnLoading ? "Please Wait..." : "Add"}
                    </button>
                  </form>
                </div>
              )}

              <div className="lecture-list">
                {lectures && lectures.length > 0 ? (
                  lectures.map((lec, index) => {
                    const isCompleted = completedLectures.includes(lec._id);
                    const isAccessible = isLectureAccessible(index);
                    const isActive = lecture._id === lec._id;

                    return (
                      <div key={lec._id} className="lecture-item">
                        <div
                          onClick={() => isAccessible ? fetchLecture(lec._id) : null}
                          className={`lecture-number ${isActive ? 'active' : ''} ${!isAccessible ? 'locked' : ''}`}
                        >
                          <div className="lecture-info">
                            <div className="lecture-title">
                              {index + 1}. {lec.title}
                            </div>
                            <span className="lecture-type">
                              {lec.lectureType === 'reading' ? 'Reading' : 'Quiz'}
                            </span>
                          </div>

                          <div className="completion-status">
                            {isCompleted ? (
                              <span className="completion-badge completed">
                                <TiTick /> Completed
                              </span>
                            ) : isAccessible ? (
                              <FaLockOpen className="lock-icon" />
                            ) : (
                              <div className="lock-indicator">
                                <FaLock className="lock-icon" />
                                <span className="locked-message">
                                  Complete previous lecture to unlock
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        {user && user.role === "admin" && (
                          <button
                            className="common-btn"
                            style={{ background: "red" }}
                            onClick={() => deleteHandler(lec._id)}
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <p className="no-lectures">No Lectures Yet!</p>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default Lecture;
