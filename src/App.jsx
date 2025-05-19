// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import ScanArtwork from "./pages/ScanArtwork";
import Exhibitions from "./pages/Exhibitions"; // ← NEW
import Artworks from "./pages/Artworks";
import './index.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/scan" element={<ScanArtwork />} />
        <Route path="/exhibitions" element={<Exhibitions />} />
         <Route path="/exhibitions/:id" element={<Artworks />} />
 {/* NEW */}
      </Routes>
    </Router>
  );
}

export default App;
