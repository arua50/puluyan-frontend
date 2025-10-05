import React, { useEffect, useState, Suspense } from "react";
import { useParams, Link } from "react-router-dom";
import { Canvas, useLoader, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Html, Environment } from "@react-three/drei";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { KTX2Loader } from "three/examples/jsm/loaders/KTX2Loader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";
import "./artwork.css";

/* ===========================
   Loader UI
=========================== */
const Loader = () => (
  <Html center>
    <div style={{ fontSize: "12px", color: "#555" }}>Loading...</div>
  </Html>
);

/* ===========================
   Rotating 3D Model
=========================== */
const RotatingModel = ({ url }) => {
  const { gl } = useThree();
  const gltf = useLoader(GLTFLoader, url, (loader) => {
    loader.setMeshoptDecoder(MeshoptDecoder);

    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath(
      "https://www.gstatic.com/draco/versioned/decoders/1.5.6/"
    );
    loader.setDRACOLoader(dracoLoader);

    const ktx2Loader = new KTX2Loader()
      .setTranscoderPath(
        "https://unpkg.com/three@0.164.0/examples/jsm/libs/basis/"
      )
      .detectSupport(gl);
    loader.setKTX2Loader(ktx2Loader);
  });

  // Auto-center & scale
  React.useEffect(() => {
    const box = new THREE.Box3().setFromObject(gltf.scene);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    gltf.scene.position.sub(center);
    const maxAxis = Math.max(size.x, size.y, size.z);
    gltf.scene.scale.setScalar(1.5 / maxAxis);
  }, [gltf]);

  // Gentle rotation
  useFrame(() => {
    if (gltf.scene) gltf.scene.rotation.y += 0.01;
  });

  return <primitive object={gltf.scene} scale={[0.5, 0.5, 0.5]}  />;
};

/* ===========================
   Artworks Grid Page
=========================== */
const Artworks = () => {
  const { id } = useParams();
  const [artworks, setArtworks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const baseUrl =
    import.meta.env.VITE_API_URL || process.env.REACT_APP_API_URL || "";

  const getFileUrl = (file) => {
    const url = file?.url || file?.data?.attributes?.url;
    if (!url) return null;
    return url.startsWith("http") ? url : `${baseUrl}${url}`;
  };

  useEffect(() => {
    const fetchArtworks = async () => {
      try {
        const response = await fetch(
          `https://puluyan-back.onrender.com/api/artworks?filters[exhibition][id][$eq]=${id}&populate=*`
        );

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const json = await response.json();
        const simplified = json.data.map((item) => ({
          id: item.id,
          title: item.art_title || "Untitled",
          artist: item.artist || "Unknown Artist",
          model: getFileUrl(item.model3D),
          image: getFileUrl(item.art_image),
        }));

        setArtworks(simplified);
      } catch (err) {
        console.error("Error fetching artworks:", err);
        setError("Failed to load artworks.");
      } finally {
        setLoading(false);
      }
    };

    fetchArtworks();
  }, [id]);

  if (loading)
    return <p style={{ textAlign: "center", fontSize: "18px" }}>Loading...</p>;
  if (error)
    return (
      <p style={{ textAlign: "center", color: "red", fontSize: "18px" }}>
        {error}
      </p>
    );

  return (
    <div style={{ padding: "16px", maxWidth: "1200px", margin: "0 auto" }}>
      {artworks.length === 0 ? (
        <p style={{ textAlign: "center", fontSize: "16px", color: "#666" }}>
          No artworks found.
        </p>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "20px",
          }}
        >
          {artworks.map((artwork) => (
            <Link
              to={`/artwork-3d/${artwork.id}`}
              key={artwork.id}
              style={{ textDecoration: "none", color: "inherit" }}
            >
              <div
                style={{
                  background: "#fff",
                  borderRadius: "12px",
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  alignItems: "center",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                  height: "320px", // fixed height for equal sizing
                }}
              >
                <div
                  style={{
                    width: "100%",
                    height: "75%", // space for 3D or image
                    background: "#f3f3f3",
                    flexShrink: 0,
                  }}
                >
                  {artwork.model ? (
                    <Canvas
                      camera={{ position: [0, 0, 3], fov: 45 }}
                      style={{
                        width: "100%",
                        height: "100%",
                        touchAction: "none",
                      }}
                    >
                      <ambientLight intensity={0.6} />
                      <directionalLight position={[3, 3, 3]} intensity={1.2} />
                      <Suspense fallback={<Loader />}>
                        <RotatingModel url={artwork.model} />
                      </Suspense>
                      <Environment preset="sunset" />
                      <OrbitControls enableZoom={false} enablePan={false} />
                    </Canvas>
                  ) : (
                    <img
                      src={
                        artwork.image ||
                        "https://via.placeholder.com/300x300?text=No+Model"
                      }
                      alt={artwork.title}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  )}
                </div>

                {/* Fixed text area */}
                <div
                  style={{
                    width: "100%",
                    textAlign: "center",
                    padding: "8px",
                    backgroundColor: "#fff",
                    flexShrink: 0,
                  }}
                >
                  <h2
                    style={{
                      fontSize: "14px",
                      fontWeight: "600",
                      color: "#333",
                      margin: "0",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                    title={artwork.title}
                  >
                    {artwork.title}
                  </h2>
                  <p
                    style={{
                      fontSize: "12px",
                      color: "#666",
                      margin: "4px 0 0 0",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                    title={artwork.artist}
                  >
                    {artwork.artist}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Artworks;
