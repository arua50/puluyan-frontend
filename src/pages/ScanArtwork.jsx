import React, { useEffect, useRef, useState, useCallback } from "react";
import Webcam from "react-webcam";
import * as tmImage from "@teachablemachine/image";
import "./ScanArtwork.css";
import { ArrowDownCircle, ArrowUp01Icon, ArrowUpCircle, LucideTriangle, PauseCircle, PlayCircle, SwitchCamera, Triangle, TriangleDashed, TriangleIcon } from "lucide-react";

/* CONFIG */
const MODEL_URL =
  "https://teachablemachine.withgoogle.com/models/lCqZGEeCd/";
const API_BASE =
  "https://puluyanartgallery.onrender.com/api/artworks?populate=*";

const ScanArtwork = () => {
  const webcamRef = useRef(null);
  const pollRef = useRef(null);

  /* state */
  const [model, setModel] = useState(null);
  const [maxPrediction, setMaxPrediction] = useState(null);

  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [description, setDescription] = useState("");

  const [showDescription, setShowDescription] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  // NEW — camera facingMode
  const [facingMode, setFacingMode] = useState("environment"); // or "user"

  /* load model */
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

  /* start polling */
  useEffect(() => {
    if (!model) return;
    pollRef.current = setInterval(() => predict(model), 3000);
    return () => {
      clearInterval(pollRef.current);
      window.speechSynthesis.cancel();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [model]);

  /* predict */
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

  /* fetch artwork */
  const fetchArtwork = async (label) => {
    try {
      const res = await fetch(`${API_BASE}&filters[slug][$eq]=${label}`);
      const json = await res.json();
      if (json.data?.length) {
        const art = json.data[0];
        setTitle(art.art_title || "Untitled");
        setArtist(art.artist || "Unknown artist");
        setDescription(art.art_description || "No description available.");
        setShowDescription(false);
        speak(art.art_description);
      } else {
        setTitle("");
        setArtist("");
        setDescription("Artwork not found in the database.");
        setShowDescription(true);
        speak("Artwork not found.");
      }
    } catch (e) {
      console.error("API error", e);
    }
  };

  /* voice utils */
  const speak = (txt) => {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(txt);
    u.lang = "en-US";
    u.onend = () => setIsPaused(false);
    window.speechSynthesis.speak(u);
  };

  const toggleVoice = () => {
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
    } else if (window.speechSynthesis.speaking) {
      window.speechSynthesis.pause();
      setIsPaused(true);
    }
  };

  /* NEW — switch camera */
  const switchCamera = useCallback(() => {
    setFacingMode((prev) => (prev === "user" ? "environment" : "user"));
  }, []);

  /* render */
  return (
    <div className="text-center">
      <div className="scan-wrapper">
        <Webcam
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          videoConstraints={{ facingMode }}
          className="webcam-view"
        />

        {/* 1 ▸ scanning overlay */}
        {!description && (
          <>
            
              <div className="bl" />
              <div className="tr" />
           
            

            {/* NEW ▸ camera-flip button (only while scanning) */}
            <button
              className="cam-flip-btn"
              onClick={switchCamera}
              title="Switch camera"
            >
             <SwitchCamera/>
            </button>
          </>
        )}

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

export default ScanArtwork;
