// src/components/Header.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { Home } from "lucide-react"; // You can use any icon library

const Header = ({ showHomeIcon = true }) => {
  const navigate = useNavigate();

  return (
    <header className="w-full px-4 py-3 flex items-center justify-between bg-white shadow-md fixed top-0 z-50">
      {/* Home Icon (optional) */}
      {showHomeIcon ? (
        <button onClick={() => navigate("/")} className="text-gray-700 hover:text-black">
          <Home size={28} />
        </button>
      ) : <div />}

      {/* Logo (centered if no home icon) */}
      <div
        onClick={() => navigate("/")}
        className="cursor-pointer"
      >
        <img
          src="/logo.png"
          alt="Puluy-an Logo"
          className="h-8 sm:h-10"
        />
      </div>

      {/* Spacer for alignment */}
      <div style={{ width: "28px" }} /> {/* match Home icon size */}
    </header>
  );
};

export default Header;
