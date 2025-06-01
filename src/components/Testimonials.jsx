import React, { useEffect, useState, useCallback } from "react"; // Import useCallback
import { collection, getDocs, addDoc, getDoc, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
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
  const [editingTestimonial, setEditingTestimonial] = useState(null);
  const [newTestimonial, setNewTestimonial] = useState({
    name: "",
    image: null,
    content: "",
    course: "",
  });
  const [editFormData, setEditFormData] = useState({
    name: "",
    image: null,
    content: "",
    course: "",
  });

  const { currentUser } = useAuth();

  // Move fetchTestimonials outside useEffect and wrap in useCallback
  const fetchTestimonials = useCallback(async () => {
    try {
      const testimonialsQuerySnapshot = await getDocs(
        collection(db, "testimonials")
      );
      const testimonialsData = testimonialsQuerySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setTestimonials(testimonialsData);
      setError("");
    } catch (error) {
      console.error("Error fetching testimonials:", error);
      setError("Failed to load testimonials. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []); // Empty dependency array as fetchTestimonials doesn't depend on any state/props

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
  }, [currentUser]); // Re-run when currentUser changes

  // Initial fetch of testimonials
  useEffect(() => {
    fetchTestimonials();
  }, [fetchTestimonials]); // Add fetchTestimonials as a dependency

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

      // Re-fetch testimonials after adding
      fetchTestimonials();

    } catch (err) {
      console.error("Add error:", err);
      setError("Failed to add testimonial.");
    }
  };

  const handleEditTestimonial = async (e) => {
    e.preventDefault();
    if (!editingTestimonial || !isAdmin) return;

    try {
      setError("");
      const testimonialRef = doc(db, "testimonials", editingTestimonial.id);

      let imageUrl = editingTestimonial.imageUrl;

      if (editFormData.image) {
        if (editingTestimonial.imageUrl) {
          const oldImageRef = ref(storage, editingTestimonial.imageUrl);
          try {
            await deleteObject(oldImageRef);
          } catch (storageError) {
            console.warn("Could not delete old image:", storageError);
          }
        }
        const newImageRef = ref(
          storage,
          `testimonials-images/${editFormData.image.name}`
        );
        await uploadBytes(newImageRef, editFormData.image);
        imageUrl = await getDownloadURL(newImageRef);
      } else if (editingTestimonial.imageUrl && !editFormData.imageUrl) {
          const oldImageRef = ref(storage, editingTestimonial.imageUrl);
          try {
            await deleteObject(oldImageRef);
          } catch (storageError) {
            console.warn("Could not delete old image:", storageError);
          }
          imageUrl = "";
      }


      await updateDoc(testimonialRef, {
        name: editFormData.name,
        imageUrl,
        content: editFormData.content,
        course: editFormData.course,
      });

      setEditingTestimonial(null);

      // Re-fetch testimonials after editing
      fetchTestimonials();

    } catch (err) {
      console.error("Edit error:", err);
      setError("Failed to update testimonial.");
    }
  };

  const handleDeleteTestimonial = async (testimonialId, imageUrl) => {
      if (!isAdmin || !window.confirm("Are you sure you want to delete this testimonial?")) return;

    try {
        setError("");
        const testimonialRef = doc(db, "testimonials", testimonialId);
        await deleteDoc(testimonialRef);

        if (imageUrl) {
             const imageRef = ref(storage, imageUrl);
             try {
                await deleteObject(imageRef);
             } catch (storageError) {
                 console.warn("Could not delete testimonial image from storage:", storageError);
             }
        }

      // Re-fetch testimonials after deleting
      fetchTestimonials();

    } catch (err) {
      console.error("Delete error:", err);
      setError("Failed to delete testimonial.");
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
          onClick={() => {setIsAdding(true); setEditingTestimonial(null);}}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 block mx-auto mb-4"
        >
          Add Testimonial
        </button>
      )}

      {(isAdding || editingTestimonial) && (
        <form
          onSubmit={editingTestimonial ? handleEditTestimonial : handleAddTestimonial}
          className="max-w-md mx-auto mb-8 bg-white p-4 rounded-lg shadow-md"
        >
            <h3 className="text-xl font-semibold mb-4">{editingTestimonial ? "Edit Testimonial" : "Add New Testimonial"}</h3>
          <input
            type="text"
            placeholder="Name"
            value={editingTestimonial ? editFormData.name : newTestimonial.name}
            onChange={(e) =>
                editingTestimonial
                ? setEditFormData({ ...editFormData, name: e.target.value })
                : setNewTestimonial({ ...newTestimonial, name: e.target.value })
            }
            className="w-full p-2 mb-2 border rounded"
            required
          />
          <input
            type="file"
            accept="image/*"
            onChange={(e) =>
                 editingTestimonial
                ? setEditFormData({ ...editFormData, image: e.target.files[0] })
                : setNewTestimonial({ ...newTestimonial, image: e.target.files[0] })
            }
            className="w-full p-2 mb-2 border rounded"
          />
            {editingTestimonial && editingTestimonial.imageUrl && !editFormData.image && (
                <img src={editingTestimonial.imageUrl} alt="Current" className="w-20 h-20 object-cover rounded-full mb-2" />
            )}
            {editingTestimonial && editingTestimonial.imageUrl && (
                 <button
                     type="button"
                     onClick={() => setEditFormData({...editFormData, image: null, imageUrl: ''})}
                     className="text-red-500 text-sm mb-2"
                 >
                     Remove Image
                 </button>
             )}

          <textarea
            placeholder="Content"
             value={editingTestimonial ? editFormData.content : newTestimonial.content}
            onChange={(e) =>
                editingTestimonial
                ? setEditFormData({ ...editFormData, content: e.target.value })
                : setNewTestimonial({ ...newTestimonial, content: e.target.value })
            }
            className="w-full p-2 mb-2 border rounded"
            required
          />
          <input
            type="text"
            placeholder="Course"
            value={editingTestimonial ? editFormData.course : newTestimonial.course}
            onChange={(e) =>
                editingTestimonial
                ? setEditFormData({ ...editFormData, course: e.target.value })
                : setNewTestimonial({ ...newTestimonial, course: e.target.value })
            }
            className="w-full p-2 mb-4 border rounded"
            required
          />
          <button
            type="submit"
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 mr-2"
          >
            {editingTestimonial ? "Save Changes" : "Submit"}
          </button>
            <button
                type="button"
                onClick={() => {setIsAdding(false); setEditingTestimonial(null);}}
                className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
            >
                Cancel
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
                className="bg-white p-8 rounded-lg shadow-md text-center relative"
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

                {isAdmin && (
                    <div className="absolute top-2 right-2">
                        <button
                            onClick={() => {
                                setEditingTestimonial(t);
                                setEditFormData({
                                     name: t.name,
                                     image: null,
                                     content: t.content,
                                     course: t.course,
                                     imageUrl: t.imageUrl
                                });
                                setIsAdding(false);
                            }}
                            className="text-blue-500 hover:text-blue-700 mr-2"
                        >
                            Edit
                        </button>
                        <button
                            onClick={() => handleDeleteTestimonial(t.id, t.imageUrl)}
                            className="text-red-500 hover:text-red-700"
                        >
                            Delete
                        </button>
                    </div>
                )}

              </div>
            ))}
          </Slider>
        </div>
      )}
    </section>
  );
}

export default Testimonials;
