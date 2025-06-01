import React from "react";

const LessonModal = ({ modal, lessons, onWatch, lesson, onClose, isVideoModal = false }) => {
  // Video modal mode: Display the lesson video
  if (isVideoModal && lesson) {
    return (
      <div className="fixed inset-0 bg-gray-200 bg-opacity-75 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-3xl">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-gray-800">
              {lesson.lessonTitle || "Untitled Lesson"}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 cursor-pointer"
            >
              ✕
            </button>
          </div>
          {lesson.videoLink ? (
            <video
              src={lesson.videoLink}
       
              controls
              controlsList="nodownload"
              muted
              className="w-full h-auto max-h-[60vh] bg-black"
              onError={() => alert("Failed to load video")}
            />
          ) : (
            <p className="text-gray-500">No video available for this lesson.</p>
          )}
        </div>
      </div>
    );
  }

  // List mode: Display the module and its lessons
  if (!modal) {
    return <div>Module data is missing</div>;
  }

  return (
    <div className=" border-b pb-4 last:border-b-0">
      <h4 className="text-lg font-medium text-gray-700 mb-2">
        {modal.title || "Untitled Module"}
      </h4>
      {lessons && lessons.length > 0 ? (
        <ul className="space-y-2">
          {lessons.map((lessonItem) => (
            <li key={lessonItem.id} className="flex items-center">
              <button
                onClick={() => onWatch(lessonItem)} // Pass the entire lesson object
                className={`text-left w-full p-2 rounded hover:bg-gray-200 text-gray-600 bg-blue-50 cursor-pointer`}
                disabled={!lessonItem?.videoLink}
              >
                {lessonItem.lessonTitle || "Untitled Lesson"}
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-400 mt-2">No lessons available yet</p>
      )}
    </div>
  );
};

export default LessonModal;