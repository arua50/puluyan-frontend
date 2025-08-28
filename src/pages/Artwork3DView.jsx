// src/pages/Artwork3DView.jsx
import React, { useEffect, useState, Suspense } from "react";
import { useParams, Link } from "react-router-dom";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";

const Model = ({ url }) => {
  const { scene } = useGLTF(url);
  return <primitive object={scene} scale={1.5} />;
};

const Artwork3DView = () => {
  const { id } = useParams();
  const [artwork, setArtwork] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get API base URL from env
  const baseUrl =
    import.meta.env.VITE_API_URL || process.env.REACT_APP_API_URL || "";

  const getFileUrl = (file) => {
    const url = file?.url || file?.data?.attributes?.url;
    if (!url) return null;
    if (url.startsWith("http")) return url;
    return `${baseUrl}${url}`;
  };

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
        setTitle(art.art_title || "Untitled");
        setArtist(art.artist || "Unknown artist");
        setDescription(art.art_description || "No description available.");
        setShowDescription(false);
        speak(art.art_description);
        setArtwork({
          id: item.id,
          title: item.art_title || "Untitled",
          modelUrl: getFileUrl(item.model3D), // <-- field in Strapi (make sure it matches!)
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

          {/* 2 ▸ buttons bar (description hidden) */}
        {description && !showDescription && (
          <div className="desc-cardsmall">
            <div className="buttons-bar">
              <div onClick={toggleVoice}>{isPaused ? <PlayCircle size={32}/> : <PauseCircle size={32}/>}</div>
              <div
                onClick={() => setShowDescription(true)}
                title="Show description"
              >
                <ArrowUpCircle size={32}/>
               
              </div>
            </div>
          </div>
        )}

        {/* 3 ▸ description card */}
        {showDescription && (
          <div className="desc-card">
            <div className="buttons-bar">
              <div onClick={toggleVoice}>{isPaused ? <PlayCircle size={32}/> : <PauseCircle size={32}/>}</div>
              <div
                onClick={() => setShowDescription(false)}
                title="Hide description"
              >
                <ArrowDownCircle size={32}/>
              </div>
            </div>
            <h3>{title}</h3>
            <h4>{artist}</h4>
            <p>{description}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Artwork3DView;
