import React, { useState, useEffect } from "react";
import { storage, db } from "../services/Firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { collection, addDoc, getDoc, doc } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";

const SubscriptionModal = ({ course, onClose }) => {
  const { currentUser } = useAuth();
  const [receiptFile, setReceiptFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUserDetails = async () => {
      if (currentUser) {
        try {
          const userDoc = await getDoc(doc(db, "users", currentUser.uid));
          if (userDoc.exists()) {
            setUserData(userDoc.data());
          }
        } catch (err) {
          console.error("Failed to fetch user data:", err);
        }
      }
    };

    fetchUserDetails();
  }, [currentUser]);

  const handleFileChange = (e) => {
    setReceiptFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!receiptFile || !userData || !currentUser) {
      setError("Please upload a receipt and ensure you're logged in.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      // Upload to Storage
      const storageRef = ref(storage, `subscriptions/receipts/${Date.now()}_${receiptFile.name}`);
      await uploadBytes(storageRef, receiptFile);
      const downloadURL = await getDownloadURL(storageRef);

      // Save to Firestore with userId
      await addDoc(collection(db, "subscriptions"), {
        userId: currentUser.uid, // Add the user ID
        courseId: course.id,
        courseTitle: course.title,
        price: course.price,
        receiptUrl: downloadURL,
        name: userData.fullName || "Unnamed",
        email: userData.email || currentUser.email,
        status: "pending", // Add initial status
        createdAt: new Date(),
        submittedAt: new Date() // Timestamp for submission
      });

      onClose(); // Close modal after submission
    } catch (err) {
      console.error("Error submitting subscription:", err);
      setError("Failed to submit. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!course) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-4 text-gray-600 hover:text-red-500 text-xl"
        >
          &times;
        </button>

        <h2 className="text-2xl font-bold mb-4 text-center text-blue-600">Subscription Required</h2>
        <p className="text-gray-800 text-center mb-4">
          Pay <span className="font-semibold text-green-600">${course.price}</span> monthly fee to access this course.
        </p>

        <div className="text-sm mb-4">
          <h3 className="font-semibold text-gray-700">Nigerian Account Details</h3>
          <p>Bank: Sterling Bank PLC</p>
          <p>Account Name: Omoefe Bazunu</p>
          <p>Account Number: 8522691895</p>

          <h3 className="mt-4 font-semibold text-gray-700">International Users</h3>
          <p>Account Number: 217577556883</p>
          <p>Account Name: Omoefe Bazunu</p>
          <p>Account Type: Checking</p>
          <p>Routing Number (Wire): 101019644</p>
          <p>SWIFT Code: LEAEUS33</p>
          <p>Address: 1801 Main St., Kansas City, MO 64108</p>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          <label className="block">
            <span className="text-gray-700 text-sm">Upload Payment Receipt (Image or PDF)</span>
            <input
              type="file"
              accept="image/*,.pdf"
              onChange={handleFileChange}
              className="mt-1 block w-full text-sm border border-gray-300 rounded-md p-1"
              required
            />
          </label>

          {error && <p className="text-red-600 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={submitting || !receiptFile}
            className={`w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition ${
              submitting || !receiptFile ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {submitting ? "Submitting..." : "Submit Receipt"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SubscriptionModal;