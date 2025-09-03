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

const MODEL_URL = "https://teachablemachine.withgoogle.com/models/lCqZGEeCd/";
const API_BASE =
  "https://puluyanartgallery.onrender.com/api/artworks?populate=*";

const ScanArtwork = () => {
  const webcamRef = useRef(null);
  const pollRef = useRef(null);

  const [model, setModel] = useState(null);
  const [maxPrediction, setMaxPrediction] = useState(null);
  const [artwork, setArtwork] = useState(null);

  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [description, setDescription] = useState("");

  const [showDescription, setShowDescription] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [facingMode, setFacingMode] = useState("environment");

  /* Load Teachable Machine model */
  useEffect(() => {
    (async () => {
      try {
        const m = await tmImage.load(
          `${MODEL_URL}model.json`,
          `${MODEL_URL}metadata.json`
        );
        setModel(m);
      } catch (err) {
        console.error("Error loading model:", err);
      }
    })();
  }, []);

  /* Start periodic predictions */
  useEffect(() => {
    if (!model) return;
    pollRef.current = setInterval(() => predict(model), 3000);
    return () => {
      clearInterval(pollRef.current);
      window.speechSynthesis.cancel();
    };
  }, [model]);

  /* Predict artwork from webcam */
  const predict = async (m) => {
    if (!webcamRef.current?.video) return;
    if (webcamRef.current.video.readyState !== 4) return;

    try {
      const predictions = await m.predict(webcamRef.current.video);
      const highest = predictions.reduce((a, b) =>
        a.probability > b.probability ? a : b
      );

      if (highest.probability > 0.9 && highest.className !== maxPrediction) {
        setMaxPrediction(highest.className);
        fetchArtwork(highest.className);
      }
    } catch (err) {
      console.error("Prediction error:", err);
    }
  };

  /* Fetch artwork from API */
  const fetchArtwork = async (label) => {
    try {
      const res = await fetch(`${API_BASE}&filters[slug][$eq]=${label}`);
      const json = await res.json();

      if (json.data?.length) {
        const art = json.data[0];
        setArtwork(art);
        setTitle(art.art_title || "Untitled");
        setArtist(art.artist || "Unknown Artist");
        setDescription(art.art_description || "No description available.");
        setShowDescription(false);
        speak(art.art_description || "No description available.");
      } else {
        setArtwork(null);
        setTitle("");
        setArtist("");
        setDescription("Artwork not found in the database.");
        setShowDescription(true);
        speak("Artwork not found.");
      }
    } catch (err) {
      console.error("API Fetch Error:", err);
    }
  };

  /* Voice synthesis */
  const speak = (text) => {
    window.speechSynthesis.cancel();
    if (!text) return;
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = "en-US";
    utter.onend = () => setIsPaused(false);
    window.speechSynthesis.speak(utter);
  };

  const toggleVoice = () => {
    if (!window.speechSynthesis.speaking) return;
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
    } else {
      window.speechSynthesis.pause();
      setIsPaused(true);
    }
  };

  /* Switch front/back camera */
  const switchCamera = useCallback(() => {
    setFacingMode((prev) => (prev === "user" ? "environment" : "user"));
  }, []);

  return (
    <div className="text-center">
      <div className="scan-wrapper">
        {/* Camera Feed */}
        <Webcam
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          videoConstraints={{ facingMode }}
          className="webcam-view"
        />

        {/* Overlay for scanning */}
        {!description && (
          <>
            <div className="bl" />
            <div className="tr" />
            <button className="cam-flip-btn" onClick={switchCamera}>
              <SwitchCamera />
            </button>
          </>
        )}

        {/* Collapsed card */}
        {description && !showDescription && (
          <div className="desc-cardsmall">
            <div className="buttons-bar">
              <div onClick={toggleVoice}>
                {isPaused ? <PlayCircle size={32} /> : <PauseCircle size={32} />}
              </div>
              <div
                onClick={() => setShowDescription(true)}
                style={{ cursor: "pointer" }}
              >
                <ArrowUpCircle size={32} />
              </div>
            </div>
          </div>
        )}

        {/* Expanded description card */}
        {showDescription && (
          <div className="desc-card">
            <div className="buttons-bar">
              <div onClick={toggleVoice}>
                {isPaused ? <PlayCircle size={32} /> : <PauseCircle size={32} />}
              </div>
              <div
                onClick={() => setShowDescription(false)}
                style={{ cursor: "pointer" }}
              >
                <ArrowDownCircle size={32} />
              </div>
            </div>

            {/* Sale Status */}
            <div className="sale-status">
              {artwork?.saleStat === "onSale" ? (
                <>
                  <span className="status on-sale">For Sale</span>
                  <span className="price">
                    ₱{artwork?.price || "Contact for price"}
                  </span>
                </>
              ) : artwork?.saleStat === "notForSale" ? (
                <span className="status not-sale">Not for Sale</span>
              ) : artwork?.saleStat === "sold" ? (
                <span className="status sold">Sold</span>
              ) : (
                <span className="status unknown">Status Unknown</span>
              )}
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

export default ScanArtwork;
