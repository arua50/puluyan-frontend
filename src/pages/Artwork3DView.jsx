// src/components/VoicePlayer.jsx
import React, { useState, useRef, useEffect } from "react";

const VoicePlayer = ({ text }) => {
  const synthRef = useRef(window.speechSynthesis);
  const utteranceRef = useRef(null);
  const wordsRef = useRef([]);
  const timerRef = useRef(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);

  const estimateDuration = (text) => Math.ceil(text.trim().split(/\s+/).length / 3);
  const formatTime = (sec) => `${Math.floor(sec / 60)}:${(sec % 60).toString().padStart(2, "0")}`;

  const stopSpeech = () => {
    synthRef.current.cancel();
    clearInterval(timerRef.current);
    setIsPlaying(false);
    setIsPaused(false);
    setElapsed(0);
    setCurrentWordIndex(0);
  };

  const startSpeech = (text, startIndex = 0) => {
    stopSpeech();
    if (!text) return;
    const words = text.split(" ");
    wordsRef.current = words;
    const chunk = words.slice(startIndex).join(" ");

    const utterance = new SpeechSynthesisUtterance(chunk);
    utterance.lang = "en-US";
    setDuration(estimateDuration(text));
    setElapsed((startIndex / words.length) * duration);

    timerRef.current = setInterval(() => {
      setElapsed((prev) => (prev >= duration ? duration : prev + 1));
    }, 1000);

    utterance.onend = () => {
      clearInterval(timerRef.current);
      setIsPlaying(false);
      setIsPaused(false);
      setElapsed(0);
    };

    synthRef.current.speak(utterance);
    utteranceRef.current = utterance;
    setIsPlaying(true);
    setIsPaused(false);
  };

  const handleSeek = (e) => {
    if (!text || !duration) return;
    const bar = e.target.getBoundingClientRect();
    const ratio = (e.clientX - bar.left) / bar.width;
    const newTime = Math.floor(ratio * duration);
    const words = wordsRef.current.length;
    const newWordIndex = Math.floor((newTime / duration) * words);
    setElapsed(newTime);
    setCurrentWordIndex(newWordIndex);
    startSpeech(text, newWordIndex);
  };

  const handlePlayPause = () => {
    if (!isPlaying) startSpeech(text, currentWordIndex);
    else if (isPaused) {
      synthRef.current.resume();
      setIsPaused(false);
    } else {
      synthRef.current.pause();
      setIsPaused(true);
    }
  };

  useEffect(() => {
    return () => {
      clearInterval(timerRef.current);
      stopSpeech();
    };
  }, []);

  return (
    <div style={{ textAlign: "center", marginTop: "20px" }}>
      <button
        onClick={handlePlayPause}
        style={{
          padding: "10px 20px",
          fontSize: "16px",
          marginRight: "10px",
          cursor: "pointer",
        }}
      >
        {isPlaying && !isPaused ? "Pause" : "Play"}
      </button>
      <button
        onClick={stopSpeech}
        style={{
          padding: "10px 20px",
          fontSize: "16px",
          cursor: "pointer",
        }}
      >
        Stop
      </button>
      <div
        style={{
          marginTop: "15px",
          width: "80%",
          height: "6px",
          background: "#ccc",
          borderRadius: "3px",
          position: "relative",
          marginInline: "auto",
          cursor: "pointer",
        }}
        onClick={handleSeek}
      >
        <div
          style={{
            position: "absolute",
            height: "100%",
            width: `${(elapsed / duration) * 100}%`,
            background: "#333",
            borderRadius: "3px",
            transition: "width 0.3s linear",
          }}
        ></div>
      </div>
      <p style={{ marginTop: "8px", fontSize: "14px" }}>
        {formatTime(elapsed)} / {formatTime(duration)}
      </p>
    </div>
  );
};

export default VoicePlayer;
