import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { db, storage } from "../services/Firebase";
import { collection, getDocs, addDoc, getDoc, doc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

function CourseManagement() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [users, setUsers] = useState([]);
  const [moduleFormOpen, setModuleFormOpen] = useState(false);
  const [resourceFormOpen, setResourceFormOpen] = useState(false);
  const [courseFormOpen, setCourseFormOpen] = useState(false);
  const [moduleData, setModuleData] = useState({
    moduleTitle: "",
    lessonTitle: "",
    videoLink: "",
    courseId: "",
    moduleId: "", // Add moduleId for existing module selection
  });
  const [resourceData, setResourceData] = useState({
    title: "",
    fileUrl: "",
    courseId: "",
  });
  const [courseData, setCourseData] = useState({
    image: null,
    title: "",
    description: "",
    price: "",
    slug: "",
  });
  const [isNewModule, setIsNewModule] = useState(true);
  const [existingModules, setExistingModules] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [usersListOpen, setUsersListOpen] = useState(false);


  // Effect to check admin status
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (currentUser) {
        try {
          const userDoc = await getDoc(doc(db, "users", currentUser.uid));
          if (userDoc.exists() && userDoc.data().isAdmin) {
            setIsAdmin(true);
          } else {
            setIsAdmin(false);
          }
        } catch (error) {
          console.error("Error checking admin status:", error);
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }
    };

    checkAdminStatus();
  }, [currentUser, navigate]);

  //fetch all users
  const fetchUsers = useCallback(async () => {
    try {
      const userSnapshot = await getDocs(collection(db, "users"));
      const usersData = userSnapshot.docs.map((doc) => ({
        id: doc.id, 
        ...doc.data(),
      }));
      setUsers(usersData)
    } catch (error) {
      console.error("Error fetching users data", error);
    }

  }, []);

  // Fetch courses for the select element
  const fetchCourses = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    fetchUsers();
    fetchCourses();
  }, [fetchCourses]);

  // Fetch existing modules
  const fetchExistingModules = useCallback(async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "modules"));
      const modulesData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setExistingModules(modulesData);
    } catch (error) {
      console.error("Error fetching modules:", error);
    }
  }, []);

  useEffect(() => {
    fetchExistingModules();
  }, [fetchExistingModules]);

  const handleModuleChange = useCallback((e) => {
    const { name, value } = e.target;
    setModuleData((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleResourceChange = useCallback((e) => {
    const { name, value } = e.target;
    setResourceData((prev) => ({ ...prev, [name]: value }));
  }, []);

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

    // Admin check
    if (!isAdmin) {
      setError("You do not have permission to add modules.");
      setLoading(false);
      return;
    }

    try {
      let moduleRef;

      if (isNewModule) {
        // Create a new module document
        const newModuleDocRef = await addDoc(collection(db, "modules"), {
          title: moduleData.moduleTitle,
          courseId: moduleData.courseId,
          createdAt: new Date(),
        });
        moduleRef = newModuleDocRef.id;
      } else {
        if (!moduleData.moduleId) {
          throw new Error("Please select an existing module.");
        }
        moduleRef = moduleData.moduleId;
      }

      // Add the lesson linked to the module
      await addDoc(collection(db, "lessons"), {
        lessonTitle: moduleData.lessonTitle,
        videoLink: moduleData.videoLink,
        courseId: moduleData.courseId,
        moduleId: moduleRef,
        createdAt: new Date(),
      });

      setModuleFormOpen(false);
      setModuleData({
        moduleTitle: "",
        lessonTitle: "",
        videoLink: "",
        courseId: "",
        moduleId: "",
      });
      fetchExistingModules(); // Refresh existing modules
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

    if (!isAdmin) {
      setError("You do not have permission to add resources.");
      setLoading(false);
      return;
    }

    try {
      await addDoc(collection(db, "resources"), {
        title: resourceData.title,
        fileUrl: resourceData.fileUrl, // direct link to Google Drive
        courseId: resourceData.courseId,
        createdAt: new Date(),
      });
      setResourceFormOpen(false);
      setResourceData({ title: "", fileUrl: "", courseId: "" });
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

    if (!isAdmin) {
      setError("You do not have permission to add courses.");
      setLoading(false);
      return;
    }

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
        previewLink: courseData.previewLink,
        createdAt: new Date(),
      });
      setCourseFormOpen(false);
      setCourseData({
        image: null,
        title: "",
        description: "",
        price: "",
        slug: "",
        previewLink: "",
      });
      navigate("/");
    } catch (err) {
      setError("Failed to add course: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // If not authenticated and not an admin, show a message or redirect
  if (!currentUser || !isAdmin) {
    return (
      <div className="min-h-screen bg-gray-100 p-4 flex justify-center items-center">
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <h1 className="text-2xl font-bold text-red-500 mb-4">Access Denied</h1>
          <p className="text-gray-700">You do not have permission to view this page.</p>
        </div>
      </div>
    );
  }

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

              {/* Course Selection for Module */}
              <select
                name="courseId"
                className="w-full p-2 border rounded text-gray-800"
                value={moduleData.courseId}
                onChange={handleModuleChange}
                required
              >
                <option value="">Select a Course for Module</option>
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.title}
                  </option>
                ))}
              </select>

              {/* Module Type Selection */}
              <div className="flex items-center space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="moduleType"
                    value="new"
                    checked={isNewModule}
                    onChange={() => setIsNewModule(true)}
                    className="form-radio"
                  />
                  <span className="ml-2 text-gray-700">Create New Module</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="moduleType"
                    value="existing"
                    checked={!isNewModule}
                    onChange={() => setIsNewModule(false)}
                    className="form-radio"
                  />
                  <span className="ml-2 text-gray-700">Add to Existing Module</span>
                </label>
              </div>

              {/* New Module Title Input */}
              {isNewModule && (
                <input
                  type="text"
                  name="moduleTitle"
                  placeholder="New Module Title"
                  className="w-full p-2 border rounded text-gray-800"
                  value={moduleData.moduleTitle}
                  onChange={handleModuleChange}
                  required
                />
              )}

              {/* Existing Module Select */}
              {!isNewModule && (
                <select
                  name="moduleId"
                  className="w-full p-2 border rounded text-gray-800"
                  value={moduleData.moduleId || ""}
                  onChange={handleModuleChange}
                  required
                >
                  <option value="">Select an Existing Module</option>
                  {existingModules.map((module) => (
                    <option key={module.id} value={module.id}>
                      {module.title} ({courses.find(c => c.id === module.courseId)?.title || "Unknown Course"})
                    </option>
                  ))}
                </select>
              )}

              {/* Lesson Title Input */}
              <input
                type="text"
                name="lessonTitle"
                placeholder="Lesson Title"
                className="w-full p-2 border rounded text-gray-800"
                value={moduleData.lessonTitle}
                onChange={handleModuleChange}
                required
              />

              {/* Lesson Video Link Input */}
              <input
                type="url"
                name="videoLink"
                placeholder="Lesson Video Link"
                className="w-full p-2 border rounded text-gray-800"
                value={moduleData.videoLink}
                onChange={handleModuleChange}
                required
              />

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
  type="text"
  name="fileUrl"
  value={resourceData.fileUrl}
  onChange={handleResourceChange}
  placeholder="Paste Google Drive link here"
  className="w-full p-2 border rounded text-gray-800"
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
        {isAdmin && (
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
                <input
                  type="url"
                  name="previewLink"
                  placeholder="Preview Video Link (Optional)"
                  className="w-full p-2 border rounded text-gray-800"
                  value={courseData.previewLink}
                  onChange={handleCourseChange}
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
        )}

        {/* Users List (Collapsible) */}
        <div className="mb-6">
          <button
            onClick={() => setUsersListOpen(!usersListOpen)}
            className="w-full bg-purple-500 text-white p-2 rounded-lg cursor-pointer hover:bg-purple-600 transition"
          >
            {usersListOpen ? "Hide Users" : "View All Users"}
          </button>
          {usersListOpen && (
            <div className="mt-4 space-y-2 max-h-60 overflow-y-auto border rounded p-2 bg-gray-50">
              {users.length > 0 ? (
                users.map((user) => (
                  <p key={user.id} className="text-sm text-gray-800 truncate">
                    <strong>{user.name || "N/A"}</strong>: {user.email}
                  </p>
                ))
              ) : (
                <p className="text-gray-600 text-center">No users found.</p>
              )}
            </div>
          )}
        </div>
        
      </div>
    </div>
  );
}

export default CourseManagement;
