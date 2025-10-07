
// src/pages/ScanArtwork.jsx
import React, { useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";
import * as tmImage from "@teachablemachine/image";
import "./ScanArtwork.css";

import {
  ArrowDownCircle,
  ArrowUpCircle,
  PauseCircle,
  PlayCircle,
} from "lucide-react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
/* CONFIG */
const MODEL_URL = "https://teachablemachine.withgoogle.com/models/yhD5GdSXk/";
const API_BASE =
  "https://puluyan-back.onrender.com/api/artworks?populate=*";
/* 3D Model Component with orientation fix */
const Model = ({ url }) => {
  const { scene } = useGLTF(url);
  // Fix orientation so front faces camera
  scene.rotation.set(0, Math.PI / 2, 0);
  return <primitive object={scene} scale={1.5} />;
};
const ScanArtwork = () => {
  const webcamRef = useRef(null);
  const pollRef = useRef(null);
  const timerRef = useRef(null);
  // Refs for speech synthesis
  const utteranceRef = useRef(null);
  const synthRef = useRef(window.speechSynthesis);
  /* State */
  const [model, setModel] = useState(null);
  const [maxPrediction, setMaxPrediction] = useState(null);
  const [artwork, setArtwork] = useState(null);
  const [showDescription, setShowDescription] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [facingMode, setFacingMode] = useState("environment"); // or "user"
  const [noArtworkMsg, setNoArtworkMsg] = useState(false);
  /* Load Teachable Machine model */
  useEffect(() => {
    (async () => {
      try {
        const m = await tmImage.load(
          `${MODEL_URL}model.json`,
          `${MODEL_URL}metadata.json`
        );
        setModel(m);
      } catch (e) {
        console.error("TM load error", e);
      }
    })();
  }, []);
  /* Start prediction polling */
  useEffect(() => {
    if (!model) return;
    pollRef.current = setInterval(() => predict(model), 3000);
    // Start 13s timer
    startTimer();
    return () => {
      clearInterval(pollRef.current);
      clearTimeout(timerRef.current);
      synthRef.current.cancel();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [model]);
  /* Timer functions */
  const startTimer = () => {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      if (!artwork) {
        setNoArtworkMsg(true);
        // Hide after 3 seconds
        setTimeout(() => {
          setNoArtworkMsg(false);
        }, 3000);
        // Restart the 13s timer loop
        startTimer();
      }
    }, 13000); // 13 seconds
  };
  const resetTimer = () => {
    clearTimeout(timerRef.current);
    setNoArtworkMsg(false);
    startTimer();
  };
  /* Prediction logic */
  const predict = async (m) => {
    if (!webcamRef.current?.video) return;
    if (webcamRef.current.video.readyState !== 4) return;
    try {
      const preds = await m.predict(webcamRef.current.video);
      const highest = preds.reduce((a, b) =>
        a.probability > b.probability ? a : b
      );
      if (highest.probability > 0.9 && highest.className !== maxPrediction) {
        setMaxPrediction(highest.className);
        await fetchArtwork(highest.className);
        resetTimer(); // reset timer when something is detected
      }
    } catch (e) {
      console.error("Prediction error", e);
    }
  };
  /* Fetch artwork from API */
  const fetchArtwork = async (label) => {
    try {
      const res = await fetch(`${API_BASE}&filters[slug][$eq]=${label}`);
      const json = await res.json();
      if (json.data?.length) {
        const art = json.data[0];
        setArtwork({
          title: art.art_title || "Untitled",
          artist: art.artist || "Unknown artist",
          description: art.art_description || "No description available.",
          saleStat: art.saleStatus || "unknown",
          price: art.price || null,
          model3DUrl: art.model3D?.url
            ? `https://puluyan-back.onrender.com${art.model3D.url}`
            : null,
        });
        setShowDescription(false);
        playVoice(art.art_description);
      } else {
        setArtwork(null);
        setNoArtworkMsg(true);
      }
    } catch (e) {
      console.error("API error", e);
    }
  };
  /* Play AI voice narration */
  const playVoice = (text) => {
    if (!text) return;
    synthRef.current.cancel();
    utteranceRef.current = new SpeechSynthesisUtterance(text);
    utteranceRef.current.lang = "en-US";
    utteranceRef.current.onstart = () => {
      setIsSpeaking(true);
      setIsPaused(false);
    };
    utteranceRef.current.onend = () => {
      setIsSpeaking(false);
      setIsPaused(false);
    };
    utteranceRef.current.onerror = () => {
      setIsSpeaking(false);
    };
    synthRef.current.speak(utteranceRef.current);
  };
  /* Toggle play/pause */
  const toggleVoice = () => {
    if (!artwork?.description) return;
    if (isSpeaking && !isPaused) {
      synthRef.current.pause();
      setIsPaused(true);
    } else if (isPaused) {
      synthRef.current.resume();
      setIsPaused(false);
    } else {
      playVoice(artwork.description);
    }
  };
  /* Stop narration on unmount / tab change */
  useEffect(() => {
    const handleBeforeUnload = () => {
      synthRef.current.cancel();
    };
    const handleVisibilityChange = () => {
      if (document.hidden && synthRef.current.speaking) {
        synthRef.current.pause();
        setIsPaused(true);
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      synthRef.current.cancel();
      clearTimeout(timerRef.current);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);
  return (
    <div className="text-center">
      <div className="scan-wrapper">
        <Webcam
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          videoConstraints={{ facingMode }}
          className="webcam-view"
        />
        {/* Overlay when scanning */}
        {!artwork?.description && (
          <>
            <div className="bl" />
            <div className="tr" />
          </>
        )}
        {/* Centered "not recognized" message */}
        {noArtworkMsg && !artwork && (
          <div className="no-artwork-message">
            <p>Artwork not recognized</p>
          </div>
        )}
        {/* Show 3D preview if artwork has model */}
        {artwork?.model3DUrl && (
          <div style={{ height: "400px", marginTop: "16px" }}>
            <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
              <ambientLight intensity={0.5} />
              <directionalLight position={[5, 5, 5]} />
              <Model url={artwork.model3DUrl} />
              <OrbitControls />
            </Canvas>
          </div>
        )}
        {/* Small description bar */}
        {artwork?.description && !showDescription && (
          <div className="desc-cardsmall">
            <div className="buttons-bar">
              <div onClick={toggleVoice}>
                {isPaused || !isSpeaking ? (
                  <PlayCircle size={32} />
                ) : (
                  <PauseCircle size={32} />
                )}
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
        {/* Full description card */}
        {showDescription && (
          <div className="desc-card">
            <div className="buttons-bar">
              <div onClick={toggleVoice}>
                {isPaused || !isSpeaking ? (
                  <PlayCircle size={32} />
                ) : (
                  <PauseCircle size={32} />
                )}
              </div>
              <div
                onClick={() => setShowDescription(false)}
                title="Hide description"
              >
                <ArrowDownCircle size={32} />
              </div>
            </div>
            <div className="title-sale-row">
              <h3>{artwork?.title}</h3>
              <div className="sale-info">
                {artwork.saleStat === "forSale" ? (
                  <>
                    <span className="status for-sale">For Sale</span>
                    <span className="price">
                      {artwork.price ? `₱${artwork.price}` : "Contact for price"}
                    </span>
                  </>
                ) : artwork.saleStat === "notForSale" ? (
                  <span className="status not-for-sale">Not for Sale</span>
                ) : artwork.saleStat === "sold" ? (
                  <span className="status sold">Sold</span>
                ) : (
                  <span className="status unknown">Sale status unknown</span>
                )}
              </div>
            </div>
            <h4>{artwork?.artist}</h4>
            <p>{artwork?.description}</p>
          </div>
        )}
      </div>
    </div>
  );
};
export default ScanArtwork;