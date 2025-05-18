// src/pages/Home.jsx
import React from "react";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="h-screen flex flex-col justify-center items-center bg-gray-100 text-center">
      <h1 className="text-3xl font-bold mb-6">Welcome to Puluy-an Art Gallery</h1>
      <div className="flex gap-4">
        <button
          onClick={() => navigate("/scan")}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow"
        >
          Scan Artwork
        </button>
        <button
          onClick={() => navigate("/exhibitions")}
          className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg shadow"
        >
          View Exhibitions
        </button>
      </div>
    </div>
  );
};

export default Home;
