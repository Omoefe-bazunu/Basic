import React, { useEffect, useState } from "react";
import { collection, getDocs, addDoc, getDoc, doc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import Slider from "react-slick";
import { db, storage } from "../services/Firebase";
import { useAuth } from "../context/AuthContext";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

function Testimonials() {
  const [testimonials, setTestimonials] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [newTestimonial, setNewTestimonial] = useState({
    name: "",
    image: null,
    content: "",
    course: "",
  });

  const { currentUser } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const testSnapshot = await getDocs(collection(db, "testimonials"));
        setTestimonials(
          testSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
        );

        if (currentUser) {
          const userDoc = await getDoc(doc(db, "users", currentUser.uid));
          if (userDoc.exists()) setIsAdmin(userDoc.data().isAdmin || false);
        }
      } catch (err) {
        console.error(err);
        setError("Error loading testimonials.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentUser]);

  const handleAddTestimonial = async (e) => {
    e.preventDefault();
    try {
      setError("");

      let imageUrl = "";
      if (newTestimonial.image) {
        const imageRef = ref(
          storage,
          `testimonials-images/${newTestimonial.image.name}`
        );
        await uploadBytes(imageRef, newTestimonial.image);
        imageUrl = await getDownloadURL(imageRef);
      }

      await addDoc(collection(db, "testimonials"), {
        name: newTestimonial.name,
        imageUrl,
        content: newTestimonial.content,
        course: newTestimonial.course,
        createdAt: new Date(),
      });

      setNewTestimonial({ name: "", image: null, content: "", course: "" });
      setIsAdding(false);

      const updatedSnapshot = await getDocs(collection(db, "testimonials"));
      setTestimonials(
        updatedSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      );
    } catch (err) {
      console.error("Add error:", err);
      setError("Failed to add testimonial.");
    }
  };

  const sliderSettings = {
    dots: true,
    infinite: testimonials.length > 1,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: testimonials.length > 1,
    autoplaySpeed: 3000,
    arrows: true,
  };

  return (
    <section className="py-12 px-4 bg-gray-100">
      <h2 className="text-2xl font-bold text-center text-blue-600 mb-2">
        Testimonials
      </h2>
      <p className="text-center text-lg text-gray-600 mb-6">
        See what our students are saying
      </p>

      {error && <p className="text-red-500 text-center mb-4">{error}</p>}

      {currentUser && isAdmin && (
        <button
          onClick={() => setIsAdding(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 block mx-auto mb-4"
        >
          Add Testimonial
        </button>
      )}

      {isAdding && (
        <form
          onSubmit={handleAddTestimonial}
          className="max-w-md mx-auto mb-8 bg-white p-4 rounded-lg shadow-md"
        >
          <input
            type="text"
            placeholder="Name"
            value={newTestimonial.name}
            onChange={(e) =>
              setNewTestimonial({ ...newTestimonial, name: e.target.value })
            }
            className="w-full p-2 mb-2 border rounded"
            required
          />
          <input
            type="file"
            accept="image/*"
            onChange={(e) =>
              setNewTestimonial({
                ...newTestimonial,
                image: e.target.files[0],
              })
            }
            className="w-full p-2 mb-2 border rounded"
            required
          />
          <textarea
            placeholder="Content"
            value={newTestimonial.content}
            onChange={(e) =>
              setNewTestimonial({
                ...newTestimonial,
                content: e.target.value,
              })
            }
            className="w-full p-2 mb-2 border rounded"
            required
          />
          <input
            type="text"
            placeholder="Course"
            value={newTestimonial.course}
            onChange={(e) =>
              setNewTestimonial({ ...newTestimonial, course: e.target.value })
            }
            className="w-full p-2 mb-4 border rounded"
            required
          />
          <button
            type="submit"
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Submit
          </button>
        </form>
      )}

      {loading ? (
        <p className="text-center text-gray-500">Loading testimonials...</p>
      ) : testimonials.length === 0 ? (
        <p className="text-center text-gray-500">No testimonials yet.</p>
      ) : (
        <div className="max-w-xl mx-auto">
          <Slider {...sliderSettings}>
            {testimonials.map((t) => (
              <div
                key={t.id}
                className="bg-white p-8 rounded-lg shadow-md text-center"
              >
                {t.imageUrl && (
                  <img
                    src={t.imageUrl}
                    alt={t.name}
                    className="w-20 h-20 mx-auto rounded-full mb-4 object-cover"
                  />
                )}
                <h3 className="text-lg font-semibold">{t.name}</h3>
                <p className="text-sm italic text-gray-500">{t.course}</p>
                <p className="text-gray-700 mt-2 max-w-md mx-auto">
                  {t.content}
                </p>
              </div>
            ))}
          </Slider>
        </div>
      )}
    </section>
  );
}

export default Testimonials;
