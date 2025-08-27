// src/pages/Artwork3DView.jsx
import React, { useEffect, useState, Suspense } from "react";
import { useParams } from "react-router-dom";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import { PlayCircle, PauseCircle, Square, ArrowUpCircle, ArrowDownCircle } from "lucide-react";

const Model = ({ url }) => {
  const { scene } = useGLTF(url);
  return <primitive object={scene} scale={1.5} />;
};

const Artwork3DView = () => {
  const { id } = useParams();
  const [artwork, setArtwork] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // description-related states
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [description, setDescription] = useState("");
  const [showDescription, setShowDescription] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const baseUrl =
    import.meta.env.VITE_API_URL || process.env.REACT_APP_API_URL || "";

  const getFileUrl = (file) => {
    const url = file?.url || file?.data?.attributes?.url;
    if (!url) return null;
    if (url.startsWith("http")) return url;
    return `${baseUrl}${url}`;
  };

  /* ---------- Voice utilities ---------- */
  const speak = (txt) => {
    if (!txt) return;
    const synth = window.speechSynthesis;
    synth.cancel(); // clear any ongoing speech
    const utterance = new SpeechSynthesisUtterance(txt);
    utterance.lang = "en-US";
    utterance.onend = () => {
      setIsPaused(false);
      setIsPlaying(false);
    };
    synth.speak(utterance);
    setIsPlaying(true);
    setIsPaused(false);
  };

  const toggleVoice = () => {
    const synth = window.speechSynthesis;
    if (synth.speaking && !synth.paused) {
      synth.pause();
      setIsPaused(true);
    } else if (synth.paused) {
      synth.resume();
      setIsPaused(false);
    } else if (!synth.speaking) {
      speak(description);
    }
  };

  const stopVoice = () => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setIsPaused(false);
  };

  /* ---------- Fetch Artwork ---------- */
  useEffect(() => {
    const fetchArtwork = async () => {
      try {
        const response = await fetch(
          `https://puluyanartgallery.onrender.com/api/artworks?filters[id][$eq]=${id}&populate=*`
        );

        if (!response.ok) throw new Error("Failed to fetch artwork");

        const json = await response.json();
        const item = json.data[0];

        if (!item) throw new Error("Artwork not found");

        const modelUrl = getFileUrl(item.model3D);
        const imageUrl = getFileUrl(item.art_image);

        setArtwork({
          id: item.id,
          title: item.art_title || "Untitled",
          artist: item.artist || "Unknown artist",
          description: item.art_description || "No description available.",
          modelUrl,
          imageUrl,
        });

        // set description values (no auto-play)
        setTitle(item.art_title || "Untitled");
        setArtist(item.artist || "Unknown artist");
        setDescription(item.art_description || "No description available.");
        setShowDescription(false);
      } catch (err) {
        console.error(err);
        setError("Could not load 3D model.");
      } finally {
        setLoading(false);
      }
    };

    fetchArtwork();
  }, [id]);

  /* ---------- UI ---------- */
  if (loading) return <p style={{ textAlign: "center" }}>Loading 3D model...</p>;
  if (error) return <p style={{ color: "red", textAlign: "center" }}>{error}</p>;

  return (
    <div style={{ padding: "16px", textAlign: "center" }}>
      <h1 style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "12px" }}>
        {artwork.title} — 3D View
      </h1>

      <div style={{ height: "500px", width: "100%", background: "#111", marginBottom: "16px" }}>
        <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
          <ambientLight intensity={0.5} />
          <directionalLight position={[5, 5, 5]} />
          <Suspense fallback={null}>
            {artwork.modelUrl ? (
              <Model url={artwork.modelUrl} />
            ) : (
              <mesh>
                <boxGeometry />
                <meshStandardMaterial color="hotpink" />
              </mesh>
            )}
          </Suspense>
          <OrbitControls />
        </Canvas>
      </div>

      {/* Control buttons (when description hidden) */}
      {description && !showDescription && (
        <div style={{ marginTop: "16px" }}>
          <div style={{ display: "flex", gap: "16px", justifyContent: "center" }}>
            <div onClick={toggleVoice} style={{ cursor: "pointer" }}>
              {isPaused || !isPlaying ? <PlayCircle size={32} /> : <PauseCircle size={32} />}
            </div>
            {isPlaying && (
              <div onClick={stopVoice} style={{ cursor: "pointer" }} title="Stop narration">
                <Square size={32} />
              </div>
            )}
            <div
              onClick={() => setShowDescription(true)}
              title="Show description"
              style={{ cursor: "pointer" }}
            >
              <ArrowUpCircle size={32} />
            </div>
          </div>
        </div>
      )}

      {/* Description card */}
      {showDescription && (
        <div
          style={{
            marginTop: "16px",
            border: "1px solid #ccc",
            borderRadius: "12px",
            padding: "16px",
            textAlign: "left",
            maxWidth: "600px",
            marginInline: "auto",
          }}
        >
          <div style={{ display: "flex", gap: "16px", justifyContent: "flex-end" }}>
            <div onClick={toggleVoice} style={{ cursor: "pointer" }}>
              {isPaused || !isPlaying ? <PlayCircle size={32} /> : <PauseCircle size={32} />}
            </div>
            {isPlaying && (
              <div onClick={stopVoice} style={{ cursor: "pointer" }} title="Stop narration">
                <Square size={32} />
              </div>
            )}
            <div
              onClick={() => setShowDescription(false)}
              title="Hide description"
              style={{ cursor: "pointer" }}
            >
              <ArrowDownCircle size={32} />
            </div>
          </div>
          <h3>{title}</h3>
          <h4>{artist}</h4>
          <p>{description}</p>
        </div>
      )}
    </div>
  );
};

export default Artwork3DView;
