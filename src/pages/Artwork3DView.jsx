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
  const [isPaused, setIsPaused] = useState(true);

  const synthRef = useRef(window.speechSynthesis);
  const utteranceRef = useRef(null);

  // Base URL for API
  const baseUrl =
    import.meta.env.VITE_API_URL || process.env.REACT_APP_API_URL || "";

  const getFileUrl = (file) => {
    const url = file?.url || file?.data?.attributes?.url;
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
          saleStat:item.saleStatus || "No Sale Status",
          price:item. price || "No Price", 
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

  // Voice controls for description
  const toggleVoice = () => {
    if (!artwork?.description) return;

    if (isPaused) {
      if (!utteranceRef.current) {
        utteranceRef.current = new SpeechSynthesisUtterance(artwork.description);
        utteranceRef.current.lang = "tl-PH";
        synthRef.current.speak(utteranceRef.current);
      } else {
        synthRef.current.resume();
      }
      setIsPaused(false);
    } else {
      synthRef.current.pause();
      setIsPaused(true);
    }
  };

  // Stop narration when component unmounts
  useEffect(() => {
    return () => {
      synthRef.current.cancel();
    };
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

        {/* Description buttons bar (collapsed) */}
        {artwork.description && !showDescription && (
          <div className="desc-cardsmall">
            <div className="buttons-bar">
              <div onClick={toggleVoice}>
                {isPaused ? <PlayCircle size={32} /> : <PauseCircle size={32} />}
              </div>
              <div
                onClick={() => setShowDescription(true)}
                title="Show description"
              >
                <ArrowUpCircle size={32} />
              </div>
            </div>
          </div>
        )}

        {/* Description panel (expanded) */}
        {showDescription && (
          <div className="desc-card">
            <div className="buttons-bar">
              <div onClick={toggleVoice}>
                {isPaused ? <PlayCircle size={32} /> : <PauseCircle size={32} />}
              </div>
              <div
                onClick={() => setShowDescription(false)}
                title="Hide description"
              >
                <ArrowDownCircle size={32} />
              </div>
            </div>
            {/*sale stat  */}
              <div className="sale-info">
                {artwork.saleStat === "onSale" ? (
                  <>
                    <h5 style={{ color: "white", fontWeight: "bold" }}>For Sale</h5>
                    <h5 style={{ color: "white" }}>
                      Price: {artwork.price ? `₱${artwork.price}` : "Contact for price"}
                    </h5>
                  </>
                ) : artwork.saleStat === "notForSale" ? (
                  <h5 style={{ color: "gray", fontWeight: "bold" }}>Not for Sale</h5>
                ) : artwork.saleStat === "sold" ? (
                  <h5 style={{ color: "red", fontWeight: "bold" }}>Sold</h5>
                ) : (
                  <h5 style={{ color: "gray" }}>Sale status unknown</h5>
                )}
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
