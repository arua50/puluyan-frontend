// src/pages/Artwork3DView.jsx
import React, { useEffect, useState, Suspense, useRef } from "react";
import { useParams } from "react-router-dom";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import { PlayCircle, PauseCircle, ArrowUpCircle, ArrowDownCircle } from "lucide-react";

const Model = ({ url }) => {
  const { scene } = useGLTF(url);
  return <primitive object={scene} scale={1.5} />;
};

const Artwork3DView = () => {
  const { id } = useParams();
  const [artwork, setArtwork] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showDescription, setShowDescription] = useState(false);

  // AI Voice Player states
  const synthRef = useRef(window.speechSynthesis);
  const utteranceRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0); // %
  const [duration, setDuration] = useState(0); // in seconds
  const [currentTime, setCurrentTime] = useState(0); // in seconds
  const [finished, setFinished] = useState(false);

  const baseUrl =
    import.meta.env.VITE_API_URL || process.env.REACT_APP_API_URL || "";

  const getFileUrl = (file) => {
    const url = file?.url;
    if (!url) return null;
    return url.startsWith("http") ? url : `${baseUrl}${url}`;
  };

  // Fetch artwork data
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

        setArtwork({
          id: item.id,
          title: item.art_title || "Untitled",
          artist: item.artist || "Unknown Artist",
          description: item.art_description || "No description available.",
          modelUrl: getFileUrl(item.model3D),
          imageUrl: getFileUrl(item.art_image),
        });
      } catch (err) {
        console.error(err);
        setError("Could not load 3D model.");
      } finally {
        setLoading(false);
      }
    };

    fetchArtwork();
  }, [id]);

  // Estimate duration (roughly 150 words per minute)
  const estimateDuration = (text) => {
    if (!text) return 0;
    const words = text.trim().split(/\s+/).length;
    return Math.ceil((words / 150) * 60);
  };

  // Start or resume voice narration
  const startVoice = () => {
    if (!artwork?.description) return;

    // Reset if finished
    if (finished) {
      synthRef.current.cancel();
      setFinished(false);
      setProgress(0);
      setCurrentTime(0);
    }

    if (!utteranceRef.current) {
      utteranceRef.current = new SpeechSynthesisUtterance(artwork.description);
      utteranceRef.current.lang = "en-US";

      // Event listeners
      utteranceRef.current.onstart = () => {
        setIsPlaying(true);
        setFinished(false);
        setDuration(estimateDuration(artwork.description));
        setCurrentTime(0);
        setProgress(0);
      };

      utteranceRef.current.onend = () => {
        setIsPlaying(false);
        setFinished(true);
        setProgress(100);
      };

      utteranceRef.current.onboundary = (event) => {
        if (duration > 0) {
          const approxTime = Math.min(
            ((event.charIndex / artwork.description.length) * duration),
            duration
          );
          setCurrentTime(approxTime);
          setProgress(Math.min((approxTime / duration) * 100, 100));
        }
      };

      synthRef.current.speak(utteranceRef.current);
    } else {
      synthRef.current.resume();
      setIsPlaying(true);
    }
  };

  // Pause voice narration
  const pauseVoice = () => {
    synthRef.current.pause();
    setIsPlaying(false);
  };

  // Stop narration on unmount
  useEffect(() => {
    return () => synthRef.current.cancel();
  }, []);

  if (loading) return <p style={{ textAlign: "center" }}>Loading 3D model...</p>;
  if (error) return <p style={{ color: "red", textAlign: "center" }}>{error}</p>;

  return (
    <div style={{ padding: "16px", textAlign: "center" }}>
      <h1 style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "12px" }}>
        {artwork.title}
      </h1>

      <div style={{ height: "500px", width: "100%" }}>
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

        {/* Voice player controls */}
        {artwork.description && (
          <div style={{ marginTop: "16px" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: "12px",
              }}
            >
              {isPlaying ? (
                <PauseCircle size={36} onClick={pauseVoice} />
              ) : (
                <PlayCircle size={36} onClick={startVoice} />
              )}
              <span>
                {Math.floor(currentTime)}s / {duration}s
              </span>
            </div>
            <div
              style={{
                width: "80%",
                height: "8px",
                background: "#ddd",
                margin: "10px auto",
                borderRadius: "4px",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${progress}%`,
                  height: "100%",
                  background: "#4cafef",
                  transition: "width 0.2s",
                }}
              ></div>
            </div>
          </div>
        )}

        {/* Description buttons */}
        {!showDescription && (
          <div className="desc-cardsmall">
            <div className="buttons-bar">
              <ArrowUpCircle size={32} onClick={() => setShowDescription(true)} />
            </div>
          </div>
        )}

        {showDescription && (
          <div className="desc-card">
            <div className="buttons-bar">
              <ArrowDownCircle
                size={32}
                onClick={() => setShowDescription(false)}
              />
            </div>
            <h3>{artwork.title}</h3>
            <h4>{artwork.artist}</h4>
            <p>{artwork.description}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Artwork3DView;
