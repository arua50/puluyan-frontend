import React, { useEffect, useRef, useState, useCallback } from "react";
import Webcam from "react-webcam";
import { ArrowDownCircle, ArrowUpCircle, PauseCircle, PlayCircle, SwitchCamera } from "lucide-react";
import "./ScanArtwork.css";

/* CONFIG */
const MATCH_API = "http://localhost:8000/match-artwork/"; 
const STRAPI_API = "https://puluyanartgallery.onrender.com/api/artworks";

const ScanArtwork = () => {
  const webcamRef = useRef(null);
  const pollRef = useRef(null);

  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [description, setDescription] = useState("");
  const [showDescription, setShowDescription] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [facingMode, setFacingMode] = useState("environment");

  /* Poll every 3 seconds */
  useEffect(() => {
    pollRef.current = setInterval(() => captureAndMatch(), 3000);
    return () => {
      clearInterval(pollRef.current);
      window.speechSynthesis.cancel();
    };
  }, []);

  /* Capture image from webcam */
  const captureAndMatch = async () => {
    if (!webcamRef.current) return;
    const imageSrc = webcamRef.current.getScreenshot();

    if (imageSrc) {
      try {
        const blob = await fetch(imageSrc).then((res) => res.blob());
        const formData = new FormData();
        formData.append("file", blob, "scan.jpg");

        // Send image to TensorFlow matcher API
        const response = await fetch(MATCH_API, {
          method: "POST",
          body: formData,
        });
        const data = await response.json();

        if (data.match && data.match.score > 0.7) {
          fetchArtworkDetails(data.match.id);
        } else {
          console.log("No confident match found");
        }
      } catch (e) {
        console.error("Matching error:", e);
      }
    }
  };

  /* Fetch artwork details from Strapi */
  const fetchArtworkDetails = async (artworkId) => {
    try {
      const res = await fetch(`${STRAPI_API}/${artworkId}?populate=*`);
      const json = await res.json();
      if (json.data) {
        const art = json.data;
        setTitle(art.attributes.art_title || "Untitled");
        setArtist(art.attributes.artist || "Unknown artist");
        setDescription(art.attributes.art_description || "No description available.");
        setShowDescription(false);
        speak(art.attributes.art_description);
      }
    } catch (e) {
      console.error("Strapi fetch error:", e);
    }
  };

  /* Voice narration */
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

        {/* Scanning Overlay */}
        {!description && (
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

        {/* Small description preview */}
        {description && !showDescription && (
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

        {/* Full description */}
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
