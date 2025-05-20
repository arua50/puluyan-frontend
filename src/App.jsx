// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Home         from "./pages/Home";
import ScanArtwork  from "./pages/ScanArtwork";
import Exhibitions  from "./pages/Exhibitions";
import Artworks     from "./pages/Artworks";
import AppLayout    from "./components/AppLayout";

import "./index.css";

export default function App() {
  return (
    <Router>
      <Routes>
        {/* ─── 1. HOME — no header ───────────────────────── */}
        <Route path="/" element={<Home />} />

        {/* ─── 2. ALL OTHER PAGES — wrapped in AppLayout ── */}
        <Route element={<AppLayout />}>
          <Route path="/scan"               element={<ScanArtwork />} />
          <Route path="/exhibitions"        element={<Exhibitions />} />
          <Route path="/exhibitions/:id"    element={<Artworks />}   />
          {/* add more header-enabled routes here */}
        </Route>
      </Routes>
    </Router>
  );
}
