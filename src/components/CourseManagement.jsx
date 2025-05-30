import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { db, storage } from "../services/Firebase";
import { collection, getDocs, addDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

function CourseManagement() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [moduleFormOpen, setModuleFormOpen] = useState(false);
  const [resourceFormOpen, setResourceFormOpen] = useState(false);
  const [courseFormOpen, setCourseFormOpen] = useState(false);
  const [moduleData, setModuleData] = useState({
    lessonTitle: "",
    videoLink: "",
    courseId: "",
  });
  const [resourceData, setResourceData] = useState({
    title: "",
    file: null,
    courseId: "",
  });
  const [courseData, setCourseData] = useState({
    image: null,
    title: "",
    description: "",
    price: "",
    slug: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Redirect if not authenticated
  if (!currentUser) {
    navigate("/signin");
    return null;
  }

  // Fetch courses for the select element
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "courses"));
        const coursesData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setCourses(coursesData);
      } catch (error) {
        console.error("Error fetching courses:", error);
      }
    };
    fetchCourses();
  }, []);

  const handleModuleChange = (e) => {
    const { name, value } = e.target;
    setModuleData((prev) => ({ ...prev, [name]: value }));
  };

  const handleResourceChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "file") {
      setResourceData((prev) => ({ ...prev, [name]: files[0] }));
    } else {
      setResourceData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleCourseChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "image") {
      setCourseData((prev) => ({ ...prev, [name]: files[0] }));
    } else {
      setCourseData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleModuleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await addDoc(collection(db, "modules"), {
        lessonTitle: moduleData.lessonTitle,
        videoLink: moduleData.videoLink,
        courseId: moduleData.courseId,
        createdAt: new Date(),
      });
      setModuleFormOpen(false);
      setModuleData({ lessonTitle: "", videoLink: "", courseId: "" });
    } catch (err) {
      setError("Failed to add module: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResourceSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      let fileUrl = "";
      if (resourceData.file) {
        const storageRef = ref(storage, `resources/${resourceData.file.name}`);
        await uploadBytes(storageRef, resourceData.file);
        fileUrl = await getDownloadURL(storageRef);
      }

      await addDoc(collection(db, "resources"), {
        title: resourceData.title,
        fileUrl: fileUrl,
        courseId: resourceData.courseId,
        createdAt: new Date(),
      });
      setResourceFormOpen(false);
      setResourceData({ title: "", file: null, courseId: "" });
    } catch (err) {
      setError("Failed to add resource: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCourseSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      let imageUrl = "";
      if (courseData.image) {
        const storageRef = ref(
          storage,
          `course-images/${courseData.image.name}`
        );
        await uploadBytes(storageRef, courseData.image);
        imageUrl = await getDownloadURL(storageRef);
      }

      await addDoc(collection(db, "courses"), {
        imageUrl: imageUrl,
        title: courseData.title,
        description: courseData.description,
        price: courseData.price,
        slug: courseData.slug,
        createdAt: new Date(),
      });
      setCourseFormOpen(false);
      setCourseData({
        image: null,
        title: "",
        description: "",
        price: "",
        slug: "",
      });
      navigate("/"); // Redirect to Home after adding the course
    } catch (err) {
      setError("Failed to add course: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-3xl font-bold text-center text-blue-500 mb-6">
          Course Management
        </h1>

        {/* Module Form */}
        <div className="mb-6">
          <button
            onClick={() => setModuleFormOpen(!moduleFormOpen)}
            className="w-full bg-blue-500 text-white p-2 rounded-lg cursor-pointer hover:bg-blue-600 transition"
          >
            {moduleFormOpen ? "Close Module Form" : "Add New Module"}
          </button>
          {moduleFormOpen && (
            <form onSubmit={handleModuleSubmit} className="mt-4 space-y-4">
              {error && <p className="text-red-500 text-center">{error}</p>}
              <input
                type="text"
                name="lessonTitle"
                placeholder="Lesson Title"
                className="w-full p-2 border rounded text-gray-800"
                value={moduleData.lessonTitle}
                onChange={handleModuleChange}
                required
              />
              <input
                type="url"
                name="videoLink"
                placeholder="Lesson Video Link"
                className="w-full p-2 border rounded text-gray-800"
                value={moduleData.videoLink}
                onChange={handleModuleChange}
                required
              />
              <select
                name="courseId"
                className="w-full p-2 border rounded text-gray-800"
                value={moduleData.courseId}
                onChange={handleModuleChange}
                required
              >
                <option value="">Select a Course</option>
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.title}
                  </option>
                ))}
              </select>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 transition disabled:bg-blue-300"
              >
                {loading ? "Adding Module..." : "Add Module"}
              </button>
            </form>
          )}
        </div>

        {/* Resource Form */}
        <div className="mb-6">
          <button
            onClick={() => setResourceFormOpen(!resourceFormOpen)}
            className="w-full bg-blue-500 text-white p-2 rounded-lg cursor-pointer hover:bg-blue-600 transition"
          >
            {resourceFormOpen ? "Close Resource Form" : "Add New Resource"}
          </button>
          {resourceFormOpen && (
            <form onSubmit={handleResourceSubmit} className="mt-4 space-y-4">
              {error && <p className="text-red-500 text-center">{error}</p>}
              <input
                type="text"
                name="title"
                placeholder="Resource Title"
                className="w-full p-2 border rounded text-gray-800"
                value={resourceData.title}
                onChange={handleResourceChange}
                required
              />
              <input
                type="file"
                name="file"
                accept="image/*,application/pdf"
                className="w-full p-2 border rounded text-gray-800"
                onChange={handleResourceChange}
                required
              />
              <select
                name="courseId"
                className="w-full p-2 border rounded text-gray-800"
                value={resourceData.courseId}
                onChange={handleResourceChange}
                required
              >
                <option value="">Select a Course</option>
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.title}
                  </option>
                ))}
              </select>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 transition disabled:bg-blue-300"
              >
                {loading ? "Adding Resource..." : "Add Resource"}
              </button>
            </form>
          )}
        </div>

        {/* Course Form */}
        <div className="mb-6">
          <button
            onClick={() => setCourseFormOpen(!courseFormOpen)}
            className="w-full bg-blue-500 text-white p-2 rounded-lg cursor-pointer hover:bg-blue-600 transition"
          >
            {courseFormOpen ? "Close Course Form" : "Create New Course"}
          </button>
          {courseFormOpen && (
            <form onSubmit={handleCourseSubmit} className="mt-4 space-y-4">
              {error && <p className="text-red-500 text-center">{error}</p>}
              <input
                type="file"
                name="image"
                accept="image/*"
                className="w-full p-2 border rounded text-gray-800"
                onChange={handleCourseChange}
                required
              />
              <input
                type="text"
                name="title"
                placeholder="Course Title"
                className="w-full p-2 border rounded text-gray-800"
                value={courseData.title}
                onChange={handleCourseChange}
                required
              />
              <textarea
                name="description"
                placeholder="Course Description"
                className="w-full p-2 border rounded text-gray-800"
                value={courseData.description}
                onChange={handleCourseChange}
                required
              />
              <input
                type="number"
                name="price"
                placeholder="Price (e.g., 5)"
                className="w-full p-2 border rounded text-gray-800"
                value={courseData.price}
                onChange={handleCourseChange}
                required
              />
              <input
                type="text"
                name="slug"
                placeholder="Slug (e.g., web-development)"
                className="w-full p-2 border rounded text-gray-800"
                value={courseData.slug}
                onChange={handleCourseChange}
                required
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 transition disabled:bg-blue-300"
              >
                {loading ? "Adding Course..." : "Add Course"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default CourseManagement;
