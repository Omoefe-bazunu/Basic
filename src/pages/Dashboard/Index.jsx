import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { db } from "../../services/Firebase";
import {
  collection,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
} from "firebase/firestore";

const Dashboard = () => {
  const { currentUser } = useAuth();
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [availableCourses, setAvailableCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(""); // Changed to store the user's name
  const { signout } = useAuth();
  const navigate = useNavigate(); // Fixed destructuring

  // Fetch available courses and enrolled courses
  useEffect(() => {
    const fetchCourses = async () => {
      if (!currentUser) {
        setLoading(false);
        return;
      }

      try {
        // Fetch available courses
        const querySnapshot = await getDocs(collection(db, "courses"));
        const coursesData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setAvailableCourses(coursesData);

        // Fetch the current user's document
        const userDocRef = doc(db, "users", currentUser.uid);
        const userDoc = await getDoc(userDocRef); // Use getDoc for a single document
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setUserData(userData.fullName); // Use email as a fallback for name
          setEnrolledCourses(userData.enrolledCourses || []);
        } else {
          console.error("User document not found");
        }
      } catch (error) {
        console.error("Error fetching courses:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [currentUser]);

  const handleSignOut = async () => {
    try {
      await signout();
      navigate("/signin");
    } catch (error) {
      console.error("Failed to sign out:", error);
    }
  };

  // Handle course enrollment
  const handleEnroll = async (courseId) => {
    if (!currentUser) return;

    try {
      const userDocRef = doc(db, "users", currentUser.uid);
      await updateDoc(userDocRef, {
        enrolledCourses: arrayUnion(courseId),
      });
      setEnrolledCourses((prev) => [...prev, courseId]);
    } catch (error) {
      console.error("Error enrolling in course:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-12">
      <div className="py-12">
        <h1 className="text-3xl font-bold text-center text-blue-500 mb-6">
          Dashboard
        </h1>
        <div className="max-w-4xl mx-auto">
          {/* Welcome Section */}
          <div className="bg-white p-6 rounded-lg shadow-md mb-8 text-center">
            <h2 className="text-xl font-semibold text-gray-800">
              Welcome {userData || "User"}!
            </h2>
            <button
              onClick={handleSignOut}
              className="bg-red-400 hover:bg-red-500 text-white cursor-pointer my-4 px-6 py-2 rounded-full transition"
            >
              Sign Out
            </button>
            {enrolledCourses.length === 0 ? (
              <p className="text-gray-600 mt-2">No course enrolled yet</p>
            ) : (
              <p className="text-gray-600 mt-2">
                You are enrolled in {enrolledCourses.length} course
                {enrolledCourses.length > 1 ? "s" : ""}.
              </p>
            )}
          </div>

          {/* Available/Enrolled Courses Section */}
          <section className="mb-8 flex flex-col items-center justify-center">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              {enrolledCourses.length === 0
                ? "Available Courses"
                : "Your Enrolled Courses"}
            </h2>
            <p className="text-gray-600 mb-6">
              {enrolledCourses.length === 0
                ? "Explore the amazing courses available to you and start learning today!"
                : "Continue your learning journey with these courses."}
            </p>
            {loading ? (
              <p className="text-center text-gray-600">Loading courses...</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {(enrolledCourses.length === 0
                  ? availableCourses
                  : availableCourses.filter((course) =>
                      enrolledCourses.includes(course.id)
                    )
                ).map((course) => (
                  <div
                    key={course.id}
                    className="bg-white p-4 rounded-lg shadow-md text-center hover:shadow-lg transition relative overflow-hidden"
                  >
                    <img
                      src={course.imageUrl}
                      alt={course.title}
                      className="w-full h-40 object-cover rounded-t-lg"
                    />
                    <div className="p-4">
                      <h3 className="text-lg font-medium text-gray-800">
                        {course.title}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {course.description}
                      </p>
                      {enrolledCourses.length === 0 && (
                        <button
                          onClick={() => handleEnroll(course.id)}
                          className="mt-4 bg-red-500 text-white px-4 py-2 rounded-full hover:bg-red-600 transition"
                        >
                          START
                        </button>
                      )}
                      <div className="flex items-center justify-center mt-2">
                        <span className="text-blue-500 font-medium">
                          ${course.price}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {enrolledCourses.length === 0 && (
              <div className="text-center mt-6">
                <Link
                  to="/#courses"
                  className="bg-blue-400 text-white px-6 py-2 rounded-full hover:bg-blue-500 transition"
                >
                  SEE MORE
                </Link>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
