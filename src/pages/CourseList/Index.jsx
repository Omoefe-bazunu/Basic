import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../../services/Firebase";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { useAuth } from "../../context/AuthContext";
import EditCourseModal from "../../components/EditCourseModal";
import PreviewModal from "../../components/PreviewModal";
import SubscriptionModal from "../../components/SubscriptionModal";

const CourseList = () => {
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [previewingCourse, setPreviewingCourse] = useState(null);
  const { currentUser } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const navigate = useNavigate();
  const [enrolledCourses, setEnrolledCourses] = useState([]); // State for enrolled courses

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch all courses
        const coursesQuerySnapshot = await getDocs(collection(db, "courses"));
        const coursesData = coursesQuerySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setCourses(coursesData);

        // Fetch enrolled courses if user is authenticated
        if (currentUser) {
          const userDocRef = doc(db, "users", currentUser.uid);
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            const userData = userDoc.data();
            const enrolled = userData.enrolledCourses || [];
            setEnrolledCourses(enrolled.map((course) => course.id)); // Extract id from objects
          }
        }
        setError("");
      } catch (error) {
        console.error("Error fetching courses:", error.message, error.code);
        setError("Failed to load courses. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentUser]);

  const handleEditClick = (course) => {
    setEditingCourse(course);
    setIsModalOpen(true);
  };

  const handlePreviewClick = (course) => {
    setPreviewingCourse(course);
    setIsPreviewModalOpen(true);
  };

  const handleContinueClick = (course) => {
    navigate(`/course/${course.slug}`);
  };

  const handleStartClick = (course) => {
    setSelectedCourse(course);
    setIsSubscriptionModalOpen(true);
  };

  return (
    <div>
      <section className="py-12 px-4" id="courses">
        <h2 className="text-2xl font-semibold text-center text-blue-500 mb-2">
          Available Courses
        </h2>
        <p className="text-center text-xl text-gray-600 mb-8">
          Explore the amazing courses available to you and start learning today!
        </p>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        {loading ? (
          <p className="text-center text-gray-600">Loading courses...</p>
        ) : courses.length === 0 ? (
          <p className="text-center text-gray-600">No courses available yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {courses.map((course) => (
              <div
                key={course.id}
                className="bg-gray-500 rounded-lg shadow-md text-center relative bg-cover bg-no-repeat bg-center"
                style={{ backgroundImage: `url(${course.imageUrl})` }}
              >
                <div className="absolute inset-0 bg-gray-800 opacity-80 rounded-lg"></div>
                <div className="relative w-full h-full py-12 px-10">
                  <h1 className="text-xl font-semibold text-white">
                    {course.title}
                  </h1>
                  <h3 className="text-gray-300 mt-2 max-w-7xl">
                    {course.description}
                  </h3>
                  <div className="rounded-full my-2 w-6 h-6 p-6 mx-auto bg-blue-500 flex items-center justify-center text-white">
                    ${course.price}
                  </div>
                  <div className="flex flex-col lg:flex-row justify-center items-center">
                    <button
                      onClick={() =>
                        enrolledCourses.includes(course.id)
                          ? handleContinueClick(course)
                          : handleStartClick(course)
                      }
                      className="mt-4 bg-red-500 text-white px-6 py-2 rounded-full hover:bg-red-600 transition"
                    >
                      {enrolledCourses.includes(course.id) ? "Continue" : "START"}
                    </button>
                    <button
                      className="mt-4 mx-4 border border-white text-white px-6 py-2 rounded-full hover:text-blue-300 transition"
                      onClick={() => handlePreviewClick(course)}
                    >
                      PREVIEW
                    </button>
                    {currentUser && (
                      <button
                        className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-full hover:bg-blue-600 transition"
                        onClick={() => handleEditClick(course)}
                      >
                        Edit
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
      {isModalOpen && currentUser && (
        <EditCourseModal course={editingCourse} onClose={() => setIsModalOpen(false)} />
      )}
      {isPreviewModalOpen && (
        <PreviewModal course={previewingCourse} onClose={() => setIsPreviewModalOpen(false)} />
      )}
      {isSubscriptionModalOpen && (
        <SubscriptionModal
          course={selectedCourse}
          onClose={() => setIsSubscriptionModalOpen(false)}
        />
      )}
    </div>
  );
};

export default CourseList;