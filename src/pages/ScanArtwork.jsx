import React, { useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";
import * as tmImage from "@teachablemachine/image";

const ScanArtwork = () => {
  const webcamRef = useRef(null);
  const [model, setModel] = useState(null);
  const [maxPrediction, setMaxPrediction] = useState(null);
  const [description, setDescription] = useState("");
  const [speaking, setSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [showDescription, setShowDescription] = useState(false);

  const MODEL_URL = "https://teachablemachine.withgoogle.com/models/1RphcVieu/";

  useEffect(() => {
    const loadModel = async () => {
      try {
        const loadedModel = await tmImage.load(
          MODEL_URL + "model.json",
          MODEL_URL + "metadata.json"
        );
        setModel(loadedModel);
      } catch (error) {
        console.error("Failed to load Teachable Machine model:", error);
      }
    };
    loadModel();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      predict();
    }, 3000);
    return () => clearInterval(interval);
  }, [model]);

  const predict = async () => {
    if (
      model &&
      webcamRef.current &&
      webcamRef.current.video &&
      webcamRef.current.video.readyState === 4
    ) {
      try {
        const prediction = await model.predict(webcamRef.current.video);
        const highest = prediction.reduce((a, b) =>
          a.probability > b.probability ? a : b
        );
        if (highest.probability > 0.9 && highest.className !== maxPrediction) {
          setMaxPrediction(highest.className);
          fetchArtworkDescription(highest.className);
        }
      } catch (error) {
        console.error("Prediction error:", error);
      }
    }
  };

  const fetchArtworkDescription = async (label) => {
    try {
      const url = `https://puluyanartgallery.onrender.com/api/artworks?filters[documentId][$eq]=${label}`;
      console.log("Fetching from:", url);
      const response = await fetch(url);
      const data = await response.json();

      if (data.data && data.data.length > 0) {
        const descriptionText = data.data[0].art_description || "No description available.";
        setDescription(descriptionText);
        setShowDescription(true);
        playVoice(descriptionText);
      } else {
        setDescription("Artwork not found in the database.");
        setShowDescription(true);
      }
    } catch (error) {
      console.error("Error fetching artwork description:", error);
      setDescription("Failed to fetch artwork description.");
      setShowDescription(true);
    }
  };

  const playVoice = (text) => {
    const newUtterance = new SpeechSynthesisUtterance(text);
    newUtterance.lang = "en-US";
    newUtterance.onend = () => {
      setSpeaking(false);
      setIsPaused(false);
    };
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(newUtterance);
    setSpeaking(true);
    setIsPaused(false);
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

  return (
    <div className="text-center p-4">
      <Webcam ref={webcamRef} screenshotFormat="image/jpeg" width={350} />
      <h2 className="text-xl mt-4">
        Detected Artwork: {maxPrediction || "Scanning..."}
      </h2>

      {description && (
        <div className="mt-4">
          <button
            onClick={() => setShowDescription(!showDescription)}
            className="mb-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded"
          >
            {showDescription ? "Hide Description" : "Show Description"}
          </button>

          {showDescription && (
            <p className="mt-2 max-w-xl mx-auto text-gray-800 bg-gray-100 p-4 rounded shadow">
              {description}
            </p>
          )}

          <div className="mt-4 flex justify-center">
            <button
              onClick={toggleVoice}
              className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded"
            >
              {isPaused ? "|>" : "||"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScanArtwork;
