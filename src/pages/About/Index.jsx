import React from "react";

const About = () => {
  return (
    <div className=" py-12">
      <section className="text-center py-12 px-4 max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-blue-500 mb-2">About Us</h1>
        <p className=" text-gray-600 mb-6 mx-auto max-w-md">
          At Basic, we help you get into the tech space with Courses that have
          been carfefully wired to provide you with a beginner-friendly
          introduction and a simplified learning process. We have also made the
          courses very affordable to make sure you’re not hindered by the cost.
        </p>

        <div
          className="mt-8 w-full h-62 max-w-md mx-auto rounded-lg bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url('/banner.jpeg')` }}
        >
          <div className=" w-full h-2 bg-blue-500 rounded-t-lg"></div>
        </div>
      </section>
    </div>
  );
};

export default About;
