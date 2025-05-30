import React, { useState } from "react";
import { Link } from "react-router-dom";

const CourseDetails = () => {
  const [activeTab, setActiveTab] = useState("modules");

  // Dummy data for the course
  const course = {
    title: "Web Development",
    banner: "/assets/placeholder-banner.jpg",
    modules: [
      {
        id: 1,
        title: "Introduction",
        lessons: [
          { id: 1, title: "What is a Website?" },
          { id: 2, title: "History of Web Development" },
          { id: 3, title: "Tools and Technologies" },
        ],
      },
      {
        id: 2,
        title: "HTML Basics",
        lessons: [
          { id: 4, title: "Structure of an HTML Document" },
          { id: 5, title: "Semantic HTML" },
          { id: 6, title: "Forms and Inputs" },
        ],
      },
      {
        id: 3,
        title: "CSS Fundamentals",
        lessons: [
          { id: 7, title: "Styling with CSS" },
          { id: 8, title: "Responsive Design" },
          { id: 9, title: "CSS Flexbox" },
        ],
      },
    ],
    resources: [
      {
        id: 1,
        title: "HTML Cheat Sheet",
        url: "https://example.com/html-cheat",
      },
      { id: 2, title: "CSS Tutorial PDF", url: "https://example.com/css-pdf" },
      { id: 3, title: "Web Dev Glossary", url: "https://example.com/glossary" },
    ],
    community: [
      { id: 1, title: "Introduction Q&A", posts: 15 },
      { id: 2, title: "HTML Help Thread", posts: 23 },
      { id: 3, title: "CSS Tips and Tricks", posts: 8 },
    ],
  };

  return (
    <div className="min-h-screen py-12 p-4">
      <div className=" py-12">
        <h1 className="text-3xl font-bold text-center text-blue-500 mb-6">
          Dashboard
        </h1>
        <div className="max-w-5xl mx-auto">
          {/* Banner Section */}
          <div className="relative mb-8">
            <img
              src={course.banner}
              alt={`${course.title} Banner`}
              className="w-full h-48 object-cover rounded-lg shadow-md"
            />
            <div className="absolute inset-0 bg-black bg-opacity-30 rounded-lg flex items-center justify-center">
              <h2 className="text-2xl font-semibold text-white">
                {course.title}
              </h2>
            </div>
          </div>

          {/* Tabs Navigation */}
          <div className="flex justify-around mb-6 border-b">
            <button
              className={`px-4 py-2 font-medium ${
                activeTab === "modules"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-600 hover:text-gray-800"
              }`}
              onClick={() => setActiveTab("modules")}
            >
              Course Modules
            </button>
            <button
              className={`px-4 py-2 font-medium ${
                activeTab === "resources"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-600 hover:text-gray-800"
              }`}
              onClick={() => setActiveTab("resources")}
            >
              Resources
            </button>
            <button
              className={`px-4 py-2 font-medium ${
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
                Course Overview
              </h3>
              {course.modules.map((module) => (
                <div key={module.id} className="mb-6">
                  <h4 className="text-lg font-medium text-gray-700">
                    Module {module.id}: {module.title}
                  </h4>
                  <ul className="list-disc list-inside mt-2 text-gray-600">
                    {module.lessons.map((lesson) => (
                      <li key={lesson.id}>{lesson.title}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}

          {activeTab === "resources" && (
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                Available Resources
              </h3>
              <ul className="space-y-4">
                {course.resources.map((resource) => (
                  <li key={resource.id} className="text-gray-600">
                    <a
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline"
                    >
                      {resource.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {activeTab === "community" && (
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                Community Discussions
              </h3>
              <ul className="space-y-4">
                {course.community.map((topic) => (
                  <li key={topic.id} className="text-gray-600">
                    {topic.title}{" "}
                    <span className="text-gray-400">({topic.posts} posts)</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseDetails;
