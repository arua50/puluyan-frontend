import React, { useEffect, useRef, useState, useCallback } from "react";
import Webcam from "react-webcam";
import * as tmImage from "@teachablemachine/image";
import "./ScanArtwork.css";
import {
  ArrowDownCircle,
  ArrowUpCircle,
  PauseCircle,
  PlayCircle,
  SwitchCamera,
} from "lucide-react";

/* CONFIG */
const MODEL_URL = "https://teachablemachine.withgoogle.com/models/lCqZGEeCd/";
const API_BASE =
  "https://puluyanartgallery.onrender.com/api/artworks?populate=*";

const ScanArtwork = () => {
  const webcamRef = useRef(null);
  const pollRef = useRef(null);
  const speechRef = useRef(null);

  /* State */
  const [model, setModel] = useState(null);
  const [maxPrediction, setMaxPrediction] = useState(null);
  const [artwork, setArtwork] = useState(null);

  const [showDescription, setShowDescription] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const [facingMode, setFacingMode] = useState("environment"); // or "user"

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
    return () => {
      clearInterval(pollRef.current);
      window.speechSynthesis.cancel();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [model]);

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
          saleStat: art.saleStat || "unknown",
          price: art.price || null,
        });
        setShowDescription(false);
        playVoice(art.art_description);
      } else {
        setArtwork({
          title: "",
          artist: "",
          description: "Artwork not found in the database.",
          saleStat: "unknown",
        });
        setShowDescription(true);
        playVoice("Artwork not found.");
      }
    } catch (e) {
      console.error("API error", e);
    }
  };

  /* Voice control */
const toggleVoice = () => {
    if (!artwork?.description) return;

    if (isPaused) {
      if (!utteranceRef.current) {
        utteranceRef.current = new SpeechSynthesisUtterance(artwork.description);
        utteranceRef.current.lang = "en-US";
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

  /* Switch camera between front and back */
  const switchCamera = useCallback(() => {
    setFacingMode((prev) => (prev === "user" ? "environment" : "user"));
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

            <button
              className="cam-flip-btn"
              onClick={switchCamera}
              title="Switch camera"
            >
              <SwitchCamera />
            </button>
          </>
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

            <h3>{artwork?.title}</h3>
            <h4>{artwork?.artist}</h4>
            <p>{artwork?.description}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScanArtwork;
