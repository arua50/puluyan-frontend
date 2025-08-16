import React, { useEffect, useState, Suspense } from "react";
import { useParams } from "react-router-dom";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment, useGLTF } from "@react-three/drei";

const getFileUrl = (fileData) => {
  const baseUrl =
    import.meta.env.VITE_API_URL || process.env.REACT_APP_API_URL || "";
  const url = fileData?.data?.url || fileData?.url;
  if (!url) return null;
  return url.startsWith("http") ? url : `${baseUrl}${url}`;
};

// Component to load the GLTF/GLB model
function Model({ modelUrl }) {
  const { scene } = useGLTF(modelUrl);
  return <primitive object={scene} scale={1} />;
}

const Artwork3D = () => {
  const { id } = useParams();
  const [artwork, setArtwork] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchArtwork = async () => {
      try {
        const res = await fetch(
          `https://puluyanartgallery.onrender.com/api/artworks/${id}?populate=*`
        );
        if (!res.ok) throw new Error("Failed to fetch artwork");

        const json = await res.json();
        const attrs = json.data;
        setArtwork({
          title: attrs.art_title,
          artist: attrs.artist,
          modelUrl: getFileUrl(attrs.art_3d_model), // assuming Strapi field is art_3d_model
        });
      } catch (err) {
        console.error(err);
        setError("Could not load 3D artwork.");
      } finally {
        setLoading(false);
      }
    };
    fetchArtwork();
  }, [id]);

  if (loading) return <p style={{ textAlign: "center" }}>Loading 3D model...</p>;
  if (error) return <p style={{ textAlign: "center", color: "red" }}>{error}</p>;
  if (!artwork?.modelUrl)
    return <p style={{ textAlign: "center" }}>No 3D model available.</p>;

  return (
    <div style={{ height: "100vh", width: "100%" }}>
      <h1 style={{ textAlign: "center", padding: "10px" }}>
        {artwork.title} — {artwork.artist}
      </h1>
      <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <Suspense fallback={null}>
          <Model modelUrl={artwork.modelUrl} />
          <Environment preset="studio" />
          <OrbitControls />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default Artwork3D;
