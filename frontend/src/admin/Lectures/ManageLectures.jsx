import axios from 'axios';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useParams } from 'react-router-dom';
import { server } from '../../main';
import Layout from '../Utils/Layout';
import AddLecture from './AddLecture';
import './lectures.css';

const ManageLectures = ({ user }) => {
  const { courseId } = useParams();
  const [lectures, setLectures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);

  const fetchLectures = async () => {
    try {
      const { data } = await axios.get(`${server}/api/course/${courseId}/lectures`, {
        headers: {
          token: localStorage.getItem('token'),
        },
      });
      setLectures(data.lectures);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error fetching lectures');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLectures();
  }, [courseId]);

  const deleteLecture = async (lectureId) => {
    if (!window.confirm('Are you sure you want to delete this lecture?')) return;

    try {
      const { data } = await axios.delete(`${server}/api/lecture/${lectureId}`, {
        headers: {
          token: localStorage.getItem('token'),
        },
      });
      toast.success(data.message);
      fetchLectures();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error deleting lecture');
    }
  };

  const handleLectureAdded = () => {
    fetchLectures();
    setShowAddForm(false);
  };

  if (loading) return <div>Loading...</div>;

  return (
    <Layout>
      <div className="manage-lectures">
        <div className="header">
          <h1>Manage Lectures</h1>
          <button 
            className="add-btn"
            onClick={() => setShowAddForm(!showAddForm)}
          >
            {showAddForm ? 'Hide Form' : 'Add New Lecture'}
          </button>
        </div>

        {showAddForm && (
          <AddLecture 
            courseId={courseId} 
            onLectureAdded={handleLectureAdded} 
          />
        )}

        <div className="lectures-list">
          {lectures.length > 0 ? (
            lectures.map((lecture, index) => (
              <div key={lecture._id} className="lecture-item">
                <div className="lecture-info">
                  <span className="lecture-number">{index + 1}</span>
                  <div className="lecture-details">
                    <h3>{lecture.title}</h3>
                    <p>{lecture.description}</p>
                    <span className="lecture-type">
                      Type: {lecture.lectureType}
                    </span>
                  </div>
                </div>
                <div className="lecture-actions">
                  <button
                    className="delete-btn"
                    onClick={() => deleteLecture(lecture._id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="no-lectures">No lectures added yet.</p>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default ManageLectures;
