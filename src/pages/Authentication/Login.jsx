import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa"; // Import icons for password visibility
import { toast, ToastContainer } from "react-toastify"; // Import react-toastify
import "react-toastify/dist/ReactToastify.css"; // Import toastify styles

function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false); // State to toggle password visibility
  const [loading, setLoading] = useState(false); // State for login process
  const { signin, sendPasswordResetEmail } = useAuth(); // Added sendPasswordResetEmail
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError("");
      setLoading(true);
      await signin(email, password);
      setLoading(false);
      toast.success("Successfully logged in! Redirecting...", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      setTimeout(() => navigate("/dashboard"), 3000);
    } catch (err) {
      setLoading(false);
      setError("Failed to sign in. " + err.message);
    }
  };

  const handlePasswordReset = async () => {
    try {
      setError("");
      await sendPasswordResetEmail(email);
      setError("Password reset email sent. Check your inbox.");
    } catch (err) {
      setError("Failed to send reset email. " + err.message);
    }
  };

  return (
    <div className="container mx-auto px-4 flex justify-center py-12 text-gray-700">
      <div className="py-12">
        <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
          <h1 className="text-3xl font-bold mb-6 text-center text-blue-500">
            Login
          </h1>
          {error && <p className="text-red-500 text-center mb-4">{error}</p>}
          <div className="space-y-4">
            <input
              type="email"
              placeholder="Email"
              className="w-full p-2 border border-blue-400  rounded"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                className="w-full p-2 border border-blue-400 rounded pr-10"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <span
                className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-600"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>
            <button
              onClick={handleSubmit}
              className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
              disabled={loading}
            >
              {loading ? "Logging in..." : "Sign In"}
            </button>
            <div className="text-center">
              <button
                onClick={handlePasswordReset}
                className="text-blue-500 hover:underline"
              >
                Forgot Password?
              </button>
              <p className="mt-2">
                No Account Yet In?{" "}
                <Link to="/signup" className="text-blue-500">
                  Sign Up
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
}

export default SignIn;
