import React, { useState, useEffect } from "react";
import CourseList from "../../pages/CourseList/Index.jsx";
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
  const [enrolledCourseDetails, setEnrolledCourseDetails] = useState([]);
  const [availableCourses, setAvailableCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState("");
  const { signout } = useAuth();
  const navigate = useNavigate();

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
        console.log("Available Courses:", coursesData);
        setAvailableCourses(coursesData);

        // Fetch the current user's document
        const userDocRef = doc(db, "users", currentUser.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setUserData(userData.fullName || "");
          const enrolled = userData.enrolledCourses || [];
          console.log("Enrolled Courses Data:", enrolled); // Debug: Check enrolled courses data
          setEnrolledCourses(enrolled);

          // Extract ids and fetch details for each enrolled course
          const courseIds = enrolled.map((course) => course.id); // Extract id from each object
          const courseDetailsPromises = courseIds.map(async (courseId) => {
            const courseDocRef = doc(db, "courses", courseId);
            const courseDoc = await getDoc(courseDocRef);
            return courseDoc.exists() ? { id: courseDoc.id, ...courseDoc.data() } : null;
          });
          const details = (await Promise.all(courseDetailsPromises)).filter(
            (course) => course !== null
          );
          setEnrolledCourseDetails(details);
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

  const handleEnroll = async (courseId) => {
    if (!currentUser) return;

    try {
      const userDocRef = doc(db, "users", currentUser.uid);
      await updateDoc(userDocRef, {
        enrolledCourses: arrayUnion({ id: courseId }), // Enroll with { id: courseId }
      });
      setEnrolledCourses((prev) => [...prev, { id: courseId }]);

      // Fetch the new course details
      const courseDocRef = doc(db, "courses", courseId);
      const courseDoc = await getDoc(courseDocRef);
      if (courseDoc.exists()) {
        setEnrolledCourseDetails((prev) => [...prev, { id: courseDoc.id, ...courseDoc.data() }]);
      }
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
          <div className="bg-white p-6 rounded-lg shadow-md mb-8 flex flex-col items-center">
            <h2 className="text-xl text-center font-semibold text-gray-800">
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
          {enrolledCourses.length === 0 ? (
            <>
              <CourseList />
            </>
          ) : (
            <section className="mb-8 flex flex-col items-center justify-center">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Your Enrolled Courses
              </h2>
              <p className="text-gray-600 mb-6">
                Continue your learning journey with these courses.
              </p>
              {loading ? (
                <p className="text-center text-gray-600">Loading courses...</p>
              ) : enrolledCourseDetails.length === 0 ? (
                <p className="text-center text-gray-600">
                  No matching enrolled courses found.
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {enrolledCourseDetails.map((course) => (
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
                        <Link
                          to={`/course/${course.slug}`}
                          className="mt-4 inline-block bg-blue-500 text-white px-4 py-2 rounded-full hover:bg-blue-600 transition"
                        >
                          Continue
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;