import React, { useState, useEffect } from "react";
import CameraScanner from "../components/CameraScanner";
import { getEmbedding } from "../utils/tensorflow";
import { findBestMatch } from "../utils/similarity";

const ArtworkScanner = () => {
  const [galleryEmbeddings, setGalleryEmbeddings] = useState([]);
  const [result, setResult] = useState("");

  // Load gallery data and pre-compute embeddings
  useEffect(() => {
    const loadGallery = async () => {
      const res = await fetch("https://puluyanartgallery.onrender.com/api/artworks?populate=*");
      const json = await res.json();

      const loadedEmbeddings = [];
      for (const art of json.data) {
        for (const imgData of art.attributes.images.data) {
          const img = new Image();
          img.crossOrigin = "anonymous";
          img.src = imgData.attributes.url;
          await new Promise((resolve) => (img.onload = resolve));
          const embedding = await getEmbedding(img);
          loadedEmbeddings.push({title:art.attributes.art_title, embedding });
        }
      }
      setGalleryEmbeddings(loadedEmbeddings);
    };

    loadGallery();
  }, []);

  const handleCapture = async (imageElement) => {
    const scannedEmbedding = await getEmbedding(imageElement);
    const match = findBestMatch(scannedEmbedding, galleryEmbeddings);

    if (match.score > 0.7) {
      setResult(`Matched artwork: ${match.title}`);
    } else {
      setResult("No match found");
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Artwork Scanner</h1>
      <CameraScanner onCapture={handleCapture} />
      {result && <p className="mt-4">{result}</p>}
    </div>
  );
};

export default ArtworkScanner;
