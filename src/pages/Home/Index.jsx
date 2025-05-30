import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { db } from "../../services/Firebase";
import { collection, getDocs } from "firebase/firestore";
import { useAuth } from "../../context/AuthContext";
import Testimonials from "../../components/Testimonials";

function Home() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { currentUser } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const coursesQuerySnapshot = await getDocs(collection(db, "courses"));
        const coursesData = coursesQuerySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setCourses(coursesData);
      } catch (error) {
        console.error("Error fetching courses:", error.message, error.code);
        setError("Failed to load courses. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentUser]);

  return (
    <div className="min-h-screen bg-gray-100 text-gray-800 mt-8">
      {/* Banner Section */}
      <section className="text-center py-12 px-4">
        <h1 className="text-5xl font-bold text-blue-500 mb-2">Basic</h1>
        <p className="text-2xl text-gray-600 mb-6">
          Learn like a beginner, build like an expert. <br />
          One step at a time.
        </p>
        <button className="bg-red-500 text-white px-6 py-2 rounded-full hover:bg-red-600 transition">
          START NOW
        </button>
        <div
          className="mt-8 w-full h-62 max-w-md mx-auto rounded-lg bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url('/banner.jpeg')` }}
        >
          <div className="w-full h-2 bg-blue-500 rounded-t-lg"></div>
        </div>
      </section>

      {/* Available Courses Section */}
      <section className="py-12 px-4" id="courses">
        <h2 className="text-2xl font-semibold text-center text-blue-500 mb-2">
          Available Courses
        </h2>
        <p className="text-center text-xl text-gray-600 mb-8">
          Explore the amazing courses available to you and start learning today!
        </p>
        {loading ? (
          <p className="text-center text-gray-600">Loading courses...</p>
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
                  <button className="mt-4 bg-red-500 text-white px-6 py-2 rounded-full hover:bg-red-600 transition">
                    START
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
      <Testimonials />
    </div>
  );
}

export default Home;
