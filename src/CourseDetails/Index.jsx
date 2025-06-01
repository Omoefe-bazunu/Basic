import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { db } from "../services/Firebase";
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import LessonModal from "../components/LessonModal";

const CourseDetails = () => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const { slug } = useParams();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("modules");
  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [resources, setResources] = useState([]);
  const [whatsappLink, setWhatsappLink] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [isEditLinkOpen, setIsEditLinkOpen] = useState(false);
  const [newLink, setNewLink] = useState("");
  const [activeVideo, setActiveVideo] = useState(null);
  const [videoLoading, setVideoLoading] = useState(false);
  // New state for lesson video modal
  const [isLessonModalOpen, setIsLessonModalOpen] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState(null);

  useEffect(() => {
    const fetchCourseData = async () => {
      if (!currentUser) {
        navigate("/signin");
        return;
      }

      if (!slug) {
        setError("Invalid course slug");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setVideoLoading(true);

        // Fetch course data
        const courseQuery = query(collection(db, "courses"), where("slug", "==", slug));
        const courseSnapshot = await getDocs(courseQuery);

        if (courseSnapshot.empty) {
          throw new Error("Course not found");
        }

        const courseDoc = courseSnapshot.docs[0];
        const courseData = courseDoc.data();
        setCourse({
          id: courseDoc.id,
          ...courseData,
        });
        setActiveVideo(courseData.previewLink || null);
        setWhatsappLink(courseData.whatsappLink || "");

        // Check admin status
        const userDocRef = doc(db, "users", currentUser.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists() && userDoc.data().isAdmin) {
          setIsAdmin(true);
        }

        // Fetch modules
        const modulesQuery = query(
          collection(db, "modules"),
          where("courseId", "==", courseDoc.id)
        );
        const modulesSnapshot = await getDocs(modulesQuery);
        const modulesData = modulesSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        console.log("Fetched modules:", modulesData);
        modulesData.sort((a, b) => a.order - b.order || a.title?.localeCompare(b.title));
        setModules(modulesData);

        // Fetch lessons for each module
        const lessonPromises = modulesData.map(async (module) => {
          const lessonsQuery = query(
            collection(db, "lessons"),
            where("moduleId", "==", module.id)
          );
          const lessonsSnapshot = await getDocs(lessonsQuery);
          return lessonsSnapshot.docs.map((doc) => ({
            id: doc.id,
            moduleId: module.id,
            ...doc.data(),
          }));
        });

        const allLessons = (await Promise.all(lessonPromises)).flat();
        console.log("Fetched lessons:", allLessons);
        allLessons.sort((a, b) => (a.order - b.order) || (a.createdAt?.toDate() || 0) - (b.createdAt?.toDate() || 0));
        setLessons(allLessons);

        // Fetch resources
        const resourcesQuery = query(
          collection(db, "resources"),
          where("courseId", "==", courseDoc.id)
        );
        const resourcesSnapshot = await getDocs(resourcesQuery);
        setResources(
          resourcesSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
        );
      } catch (err) {
        console.error("Error fetching course data:", err);
        setError(err.message);
      } finally {
        setLoading(false);
        setVideoLoading(false);
      }
    };

    fetchCourseData();
  }, [slug, currentUser, navigate, db]);

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape" && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isFullscreen]);

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const handleWatch = (link) => {
    console.log("handleWatch called with link:", link);
    setVideoLoading(true);
    setActiveVideo(link);
  };

  const handleLessonPreviewClick = (lesson) => {
    setSelectedLesson(lesson);
    setIsLessonModalOpen(true);
  };

  const handleUpdateWhatsappLink = async (e) => {
    e.preventDefault();
    if (!course || !isAdmin) return;

    try {
      const courseRef = doc(db, "courses", course.id);
      await updateDoc(courseRef, { whatsappLink: newLink });
      setWhatsappLink(newLink);
      setIsEditLinkOpen(false);
      setNewLink("");
      alert("WhatsApp link updated successfully!");
    } catch (err) {
      console.error("Error updating WhatsApp link:", err);
      setError("Failed to update WhatsApp link: " + err.message);
    }
  };

  if (!currentUser) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen py-12 p-4 flex justify-center items-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-xl text-gray-600">Loading course details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen py-12 p-4 flex justify-center items-center">
        <div className="text-center">
          <p className="text-xl text-red-500">{error}</p>
          <Link to="/" className="text-blue-500 hover:underline mt-4 inline-block">
            Return to courses
          </Link>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen py-12 p-4 flex justify-center items-center">
        <div className="text-center">
          <p className="text-xl text-gray-600">Course not found</p>
          <Link to="/" className="text-blue-500 hover:underline mt-4 inline-block">
            Return to courses
          </Link>
        </div>
      </div>
    );
  }

  const groupedLessons = modules.map((module) => ({
    ...module,
    lessons: lessons
      .filter((lesson) => lesson?.moduleId === module.id)
      .sort((a, b) => (a.order - b.order) || (a.createdAt?.toDate() || 0) - (b.createdAt?.toDate() || 0)),
  }));
  console.log("Grouped Lessons:", groupedLessons);

  return (
    <div className={`min-h-screen py-12 p-4 ${isFullscreen ? "fixed inset-0 bg-black z-50 p-0" : ""}`}>
      <div className={`py-12 ${isFullscreen ? "h-full" : ""}`}>
        {!isFullscreen && (
          <h1 className="text-3xl font-bold text-center text-blue-500 mb-6">
            {course.title}
          </h1>
        )}
        
        <div className={`max-w-5xl mx-auto ${isFullscreen ? "h-full" : ""}`}>
          {/* Video Player Section */}
          <div className={`relative mb-8 ${isFullscreen ? "h-full" : ""}`}>
            {videoLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
              </div>
            )}
            {activeVideo ? (
              <video
                key={activeVideo}
                src={activeVideo}
                          controls
                controlsList="nodownload"
                muted
                className={`w-full ${isFullscreen ? "h-full" : "h-auto max-h-[70vh]"} cursor-pointer bg-black`}
                onClick={toggleFullscreen}
                onLoadStart={() => setVideoLoading(false)}
                onError={() => {
                  setVideoLoading(false);
                  setError("Failed to load video");
                }}
              />
            ) : (
              <div className="w-full bg-gray-200 h-64 flex items-center justify-center">
                <p className="text-gray-500">No video selected</p>
              </div>
            )}
          </div>

          {!isFullscreen && (
            <>
              {/* Course Description */}
              <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  About This Course
                </h3>
                <p className="text-gray-600">{course.description}</p>
              </div>

              {/* Tabs Navigation */}
              <div className="flex justify-around mb-6 border-b">
                <button
                  className={`px-4 py-2 cursor-pointer font-medium ${
                    activeTab === "modules"
                      ? "text-blue-600 border-b-2 border-blue-600"
                      : "text-gray-600 hover:text-gray-800"
                  }`}
                  onClick={() => setActiveTab("modules")}
                >
                  Course Modules
                </button>
                <button
                  className={`px-4 py-2 cursor-pointer font-medium ${
                    activeTab === "resources"
                      ? "text-blue-600 border-b-2 border-blue-600"
                      : "text-gray-600 hover:text-gray-800"
                  }`}
                  onClick={() => setActiveTab("resources")}
                >
                  Resources
                </button>
                <button
                  className={`px-4 py-2 cursor-pointer font-medium ${
                    activeTab === "community"
                      ? "text-blue-600 border-b-2 border-blue-600"
                      : "text-gray-600 hover:text-gray-800"
                  }`}
                  onClick={() => setActiveTab("community")}
                >
                  Community
                </button>
              </div>

              {/* Tab Content */}
              {activeTab === "modules" && (
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">
                    Course Modules
                  </h3>
                  {groupedLessons.length > 0 ? (
                    groupedLessons.map((module) => (
                      module && (
                        <LessonModal
                          key={module.id}
                          modal={module}
                          lessons={module.lessons}
                          onWatch={handleLessonPreviewClick} // Changed to open modal
                        />
                      )
                    ))
                  ) : (
                    <p className="text-gray-400">No modules available yet</p>
                  )}
                </div>
              )}

              {activeTab === "resources" && (
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">
                    Course Resources
                  </h3>
                  {resources.length > 0 ? (
                    <ul className="space-y-3">
                      {resources.map((resource) => (
                        <li key={resource.id}>
                          <a
                            href={resource.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center p-2 rounded hover:bg-gray-100"
                          >
                            <span className="text-blue-500 hover:underline flex-1">
                              {resource.title}
                            </span>
                            <span className="text-sm text-gray-500">
                              {resource.fileType || "Resource"}
                            </span>
                          </a>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-400">No resources available yet</p>
                  )}
                </div>
              )}

              {activeTab === "community" && (
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">
                    Community
                  </h3>
                  {whatsappLink ? (
                    <a
                      href={whatsappLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center bg-green-500 text-white px-4 py-2 rounded-full hover:bg-green-600 transition mb-4"
                    >
                      <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                      </svg>
                      Join WhatsApp Group
                    </a>
                  ) : (
                    <p className="text-gray-400 mb-4">No WhatsApp group link available yet.</p>
                  )}
                  
                  {isAdmin && (
                    <div className="mt-4">
                      <button
                        onClick={() => {
                          setIsEditLinkOpen(!isEditLinkOpen);
                          setNewLink(whatsappLink);
                        }}
                        className="bg-blue-500 text-white px-4 py-2 rounded-full hover:bg-blue-600 transition"
                      >
                        {isEditLinkOpen ? "Cancel" : "Edit WhatsApp Link"}
                      </button>
                      
                      {isEditLinkOpen && (
                        <form
                          onSubmit={handleUpdateWhatsappLink}
                          className="mt-4 space-y-3"
                        >
                          <input
                            type="url"
                            value={newLink}
                            onChange={(e) => setNewLink(e.target.value)}
                            placeholder="https://chat.whatsapp.com/..."
                            className="w-full p-2 border rounded text-gray-800"
                            required
                          />
                          <div className="flex space-x-2">
                            <button
                              type="submit"
                              className="bg-green-500 text-white px-4 py-2 rounded-full hover:bg-green-600 transition"
                            >
                              Save Link
                            </button>
                            <button
                              type="button"
                              onClick={() => setIsEditLinkOpen(false)}
                              className="bg-gray-500 text-white px-4 py-2 rounded-full hover:bg-gray-600 transition"
                            >
                              Cancel
                            </button>
                          </div>
                        </form>
                      )}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
      {/* Render LessonModal for lesson video playback */}
      {isLessonModalOpen && selectedLesson && (
        <LessonModal
          lesson={selectedLesson}
          onClose={() => setIsLessonModalOpen(false)}
          isVideoModal={true}
        />
      )}
    </div>
  );
};

export default CourseDetails;