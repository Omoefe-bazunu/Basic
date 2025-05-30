import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const NavBar = () => {
  const [scrolled, setScrolled] = useState(false);
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY;
      setScrolled(offset > 50); // Change background when scrolled past 50px
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 w-full transition-all duration-300 z-10 ${
        scrolled ? "bg-white shadow-md" : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4 py-3 flex justify-center space-x-6">
        <Link to="/" className="text-gray-800 hover:text-blue-400 transition">
          Home
        </Link>
        {currentUser ? (
          <Link
            to="/dashboard"
            className="text-gray-800 hover:text-blue-400 transition"
          >
            Dashboard
          </Link>
        ) : (
          <Link
            to="/signin"
            className="text-gray-800 hover:text-blue-400 transition"
          >
            Login
          </Link>
        )}
        <Link
          to="/about"
          className="text-gray-800 hover:text-blue-400 transition"
        >
          About
        </Link>
        <Link
          to="/contact"
          className="text-gray-800 hover:text-blue-400 transition"
        >
          Contact
        </Link>
      </div>
    </nav>
  );
};

export default NavBar;
