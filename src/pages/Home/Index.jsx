
import Testimonials from "../../components/Testimonials";
import CourseList from "../../pages/CourseList/Index.jsx"


function Home() {
  
  return (
    <div className="min-h-screen bg-gray-100 text-gray-800 mt-8">
      {/* Banner Section */}
      <section className="text-center py-12 px-4">
        <h1 className="text-5xl font-bold text-blue-500 mb-2">Basic</h1>
        <p className="text-2xl text-gray-600 mb-6">
          Learn like a beginner, build like an expert. <br/> One step at a time.
        </p>
        <a href='#courses' className="bg-red-500 text-white px-6 py-2 rounded-full hover:bg-red-600 transition">
          START NOW
        </a>
        <div
          className="mt-8 w-full h-62 max-w-md mx-auto rounded-lg bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url('/banner.jpeg')` }} // This seems to be the correct syntax
        >
          <div className="w-full h-2 bg-blue-500 rounded-t-lg"></div>
        </div>
      </section>

     <CourseList/>
      <Testimonials />

    </div>
  ); // Ensure this div is properly closed
}
export default Home;
