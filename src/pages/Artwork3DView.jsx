// src/pages/Artwork3DView.jsx
import React, { useEffect, useState, Suspense, useRef } from "react";
import { useParams } from "react-router-dom";
import { Canvas, useLoader, useThree } from "@react-three/fiber";
import {
  OrbitControls,
  Html,
  useProgress,
  Environment,
} from "@react-three/drei";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { KTX2Loader } from "three/examples/jsm/loaders/KTX2Loader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";
import {
  PlayCircle,
  PauseCircle,
  ArrowUpCircle,
  ArrowDownCircle,
} from "lucide-react";
import "./artwork.css";

/* ===========================
   Loader Component
=========================== */
const Loader = () => {
  const { progress } = useProgress();
  return (
    <Html center>
      <div style={{ color: "#555", fontSize: "16px" }}>
        Loading... {progress.toFixed(0)}%
      </div>
    </Html>
  );
};

/* ===========================
   Model Component (Improved)
=========================== */
const Model = ({ url }) => {
  const { gl } = useThree();
  const gltf = useLoader(GLTFLoader, url, (loader) => {
    loader.setMeshoptDecoder(MeshoptDecoder);

    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath(
      "https://www.gstatic.com/draco/versioned/decoders/1.5.6/"
    );
    loader.setDRACOLoader(dracoLoader);

    const ktx2Loader = new KTX2Loader()
      .setTranscoderPath("https://unpkg.com/three@0.164.0/examples/jsm/libs/basis/")
      .detectSupport(gl);
    loader.setKTX2Loader(ktx2Loader);
  });

  // ✅ Auto-center and scale the model
  useEffect(() => {
    if (!gltf.scene) return;

    const box = new THREE.Box3().setFromObject(gltf.scene);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());

    gltf.scene.position.sub(center); // Center model
    const maxAxis = Math.max(size.x, size.y, size.z);
    const scale = 3 / maxAxis; // Fit within camera view
    gltf.scene.scale.setScalar(scale);
  }, [gltf]);

  return <primitive object={gltf.scene} />;
};

/* ===========================
   Artwork 3D View Page
=========================== */
const Artwork3DView = () => {
  const { id } = useParams();
  const [artwork, setArtwork] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDescription, setShowDescription] = useState(false);
  const [isPaused, setIsPaused] = useState(true);

  const synthRef = useRef(window.speechSynthesis);
  const utteranceRef = useRef(null);

  const baseUrl =
    import.meta.env.VITE_API_URL || process.env.REACT_APP_API_URL || "";

  const getFileUrl = (file) => {
    const url = file?.url || file?.data?.attributes?.url;
    if (!url) return null;
    return url.startsWith("http") ? url : `${baseUrl}${url}`;
  };

  /* Fetch artwork data from Strapi */
  useEffect(() => {
    const fetchArtwork = async () => {
      try {
        const response = await fetch(
          `https://puluyan-back.onrender.com/api/artworks?filters[id][$eq]=${id}&populate=*`
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
          saleStat: item.saleStatus || "No Sale Status",
          price: item.price || "No Price",
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

  /* Voice Control for Artwork Description */
  const toggleVoice = () => {
    if (!artwork?.description) return;

    if (isPaused) {
      if (!utteranceRef.current) {
        utteranceRef.current = new SpeechSynthesisUtterance(
          artwork.description
        );
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

  if (loading)
    return <p style={{ textAlign: "center" }}>Loading 3D model...</p>;
  if (error)
    return <p style={{ color: "red", textAlign: "center" }}>{error}</p>;

  return (
    <div style={{ padding: "16px", textAlign: "center" }}>
      <div style={{ height: "500px", width: "100%" }}>
        <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
          <ambientLight intensity={0.6} />
          <directionalLight position={[5, 5, 5]} intensity={1.5} castShadow />
          <hemisphereLight skyColor="#ffffff" groundColor="#666666" intensity={0.5} />
          <Suspense fallback={<Loader />}>
            {artwork.modelUrl ? (
              <Model url={artwork.modelUrl} />
            ) : (
              <mesh rotation={[ 0.5, 0.7, 0]}>
                <boxGeometry />
                <meshStandardMaterial color="gray" />
              </mesh>
            )}
          </Suspense>
          <OrbitControls />
          <Environment preset="city" />
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

        {/* Expanded description panel */}
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

            {/* Title + Sale Status in one row */}
            <div className="title-sale-row">
              <h3>{artwork.title}</h3>

              <div className="sale-info">
                {artwork.saleStat === "forSale" ? (
                  <>
                    <h5 className="sale-on">On Sale</h5>
                    <h5 className="sale-price">
                      {artwork.price
                        ? `₱${artwork.price}`
                        : "Contact for price"}
                    </h5>
                  </>
                ) : artwork.saleStat === "notForSale" ? (
                  <h5 className="sale-not">Not for Sale</h5>
                ) : artwork.saleStat === "sold" ? (
                  <h5 className="sale-sold">Sold</h5>
                ) : (
                  <h5 className="sale-unknown">Sale status unknown</h5>
                )}
              </div>
            </div>

            <h4>{artwork.artist}</h4>
            <p>{artwork.description}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Artwork3DView;
