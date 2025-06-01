import React, { useState, useEffect } from 'react';

const PreviewModal = ({ course, onClose }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isFullscreen]);

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  if (!course) {
    return null; // Don't render if no course is provided
  }

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center bg-gray-200 bg-opacity-75 ${isFullscreen ? 'p-0' : 'p-4'}`}>
      <div className={`bg-white rounded-lg shadow-xl relative overflow-hidden ${isFullscreen ? 'w-full h-full' : 'w-full max-w-2xl'}`}>
        <button
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-2xl z-10"
          onClick={onClose}
        >
          &times;
        </button>
        <video
          src={course.previewLink}
 autoPlay
          controls controlsList="nodownload"
          className={`w-full h-auto cursor-pointer ${isFullscreen ? 'h-full' : ''}`}
          onClick={toggleFullscreen}
        />
        <h1 className="text-xl font-semibold text-gray-800 p-4">{course.title}</h1>
      </div>
    </div>
  );
};

export default PreviewModal;