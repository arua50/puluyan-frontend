import React, { useRef, useEffect } from "react";

const CameraScanner = ({ onCapture }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
      videoRef.current.srcObject = stream;
    });
  }, []);

  const captureImage = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    const img = new Image();
    img.src = canvas.toDataURL("image/png");
    img.onload = () => onCapture(img);
  };

  return (
    <div className="flex flex-col items-center">
      <video ref={videoRef} autoPlay playsInline className="w-full rounded-lg shadow" />
      <canvas ref={canvasRef} width="224" height="224" style={{ display: "none" }} />
      <button onClick={captureImage} className="mt-2 p-2 bg-blue-500 text-white rounded-lg">
        Capture
      </button>
    </div>
  );
};

export default CameraScanner;
