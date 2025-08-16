import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment } from "@react-three/drei";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import * as THREE from "three";

const Artwork3DView = () => {
  const { id } = useParams();
  const [modelUrl, setModelUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const baseUrl = import.meta.env.VITE_API_URL || process.env.REACT_APP_API_URL || "";

  // Fetch artwork data
  useEffect(() => {
    const fetchArtwork = async () => {
      try {
        const res = await fetch(
          `${baseUrl}/api/artworks/${id}?populate=*`
        );
        if (!res.ok) throw new Error("Failed to fetch artwork");
        const json = await res.json();

        console.log("Artwork details:", json);

        // Get 3D model file path from Strapi (assuming field name is 'model_file')
        const modelPath = json.data?.attributes?.model_file?.data?.attributes?.url;
        if (modelPath) {
          setModelUrl(modelPath.startsWith("http") ? modelPath : `${baseUrl}${modelPath}`);
        } else {
          throw new Error("No 3D model found for this artwork");
        }
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchArtwork();
  }, [id, baseUrl]);

  if (loading) return <p style={{ textAlign: "center" }}>Loading 3D model...</p>;
  if (error) return <p style={{ textAlign: "center", color: "red" }}>{error}</p>;

  return (
    <div style={{ height: "100vh", backgroundColor: "#222" }}>
      <Link to={`/`} style={{ position: "absolute", top: 20, left: 20, color: "#fff" }}>
        ⬅ Back
      </Link>

      <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 5, 5]} />
        <OrbitControls />
        <Environment preset="studio" />

        {modelUrl && <Model url={modelUrl} />}
      </Canvas>
    </div>
  );
};

// Separate Model loader component
const Model = ({ url }) => {
  const [model, setModel] = useState();

  useEffect(() => {
    const loader = new GLTFLoader();
    loader.load(
      url,
      (gltf) => setModel(gltf.scene),
      undefined,
      (err) => console.error("Error loading model:", err)
    );
  }, [url]);

  return model ? <primitive object={model} scale={1} /> : null;
};

export default Artwork3DView;
