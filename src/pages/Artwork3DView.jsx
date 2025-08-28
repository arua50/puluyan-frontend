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

  // Voice player states
  const synthRef = useRef(window.speechSynthesis);
  const utteranceRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [finished, setFinished] = useState(false);

  const baseUrl =
    import.meta.env.VITE_API_URL || process.env.REACT_APP_API_URL || "";

  const getFileUrl = (file) => {
    const url = file?.url;
    if (!url) return null;
    return url.startsWith("http") ? url : `${baseUrl}${url}`;
  };

  // Fetch artwork details
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

  const estimateDuration = (text) => {
    if (!text) return 0;
    const words = text.trim().split(/\s+/).length;
    return Math.ceil((words / 150) * 60); // 150 WPM ~ duration in seconds
  };

  const startVoice = () => {
    if (!artwork?.description) return;

    if (finished) {
      synthRef.current.cancel();
      setFinished(false);
      setProgress(0);
      setCurrentTime(0);
    }

    if (!utteranceRef.current) {
      utteranceRef.current = new SpeechSynthesisUtterance(artwork.description);
      utteranceRef.current.lang = "en-US";

      utteranceRef.current.onstart = () => {
        setIsPlaying(true);
        setDuration(estimateDuration(artwork.description));
        setCurrentTime(0);
        setProgress(0);
        setFinished(false);
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

  const pauseVoice = () => {
    synthRef.current.pause();
    setIsPlaying(false);
  };

  useEffect(() => {
    return () => synthRef.current.cancel();
  }, []);

  const handleProgressClick = (e) => {
    const rect = e.target.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    const newProgress = (clickX / width) * 100;
    setProgress(newProgress);

    // Simulate seeking (restart narration from beginning)
    if (artwork?.description) {
      synthRef.current.cancel();
      utteranceRef.current = null;
      setFinished(false);
      setCurrentTime(0);
      setProgress(0);
      startVoice();
    }
  };

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

        {showDescription && (
          <div
            className="desc-card"
            style={{
              marginTop: "16px",
              padding: "16px",
              border: "1px solid #ddd",
              borderRadius: "12px",
              background: "#f9f9f9",
            }}
          >
            <h3>{artwork.title}</h3>
            <h4>{artwork.artist}</h4>
            <p style={{ marginBottom: "12px" }}>{artwork.description}</p>

            {/* Voice player inside box */}
            <div style={{ marginTop: "10px" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: "12px",
                  marginBottom: "8px",
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
                  width: "100%",
                  height: "8px",
                  background: "#ddd",
                  borderRadius: "4px",
                  overflow: "hidden",
                  cursor: "pointer",
                }}
                onClick={handleProgressClick}
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

            <div style={{ marginTop: "12px" }}>
              <ArrowDownCircle
                size={32}
                onClick={() => setShowDescription(false)}
                style={{ cursor: "pointer" }}
              />
            </div>
          </div>
        )}

        {!showDescription && (
          <div className="desc-cardsmall">
            <div className="buttons-bar">
              <ArrowUpCircle size={32} onClick={() => setShowDescription(true)} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Artwork3DView;
