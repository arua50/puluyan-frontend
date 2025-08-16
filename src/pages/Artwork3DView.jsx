import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

const Artwork3DView = () => {
  const { id } = useParams();
  const [artwork, setArtwork] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const baseUrl = "https://puluyanartgallery.onrender.com";

  useEffect(() => {
    const fetchArtwork = async () => {
      try {
        const res = await fetch(`${baseUrl}/api/artworks/${id}?populate=*`);
        if (!res.ok) throw new Error("Failed to fetch artwork");
        const json = await res.json();
        setArtwork(json.data || null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchArtwork();
  }, [id]);

  const getModelUrl = (modelData) => {
    if (modelData?.data?.attributes?.url) {
      return `${baseUrl}${modelData.data.attributes.url}`;
    }
    return null;
  };

  if (loading) return <p style={{ textAlign: "center" }}>Loading 3D model...</p>;
  if (error) return <p style={{ textAlign: "center", color: "red" }}>{error}</p>;
  if (!artwork) return <p style={{ textAlign: "center" }}>Artwork not found.</p>;

  const title = artwork.attributes?.title || "Untitled";
  const modelUrl = getModelUrl(artwork.attributes?.model_file);

  return (
    <div style={{ padding: "20px" }}>
      <h1>{title} — 3D View</h1>

      {modelUrl ? (
        <model-viewer
          src={modelUrl}
          alt={title}
          auto-rotate
          camera-controls
          style={{ width: "100%", height: "500px", border: "1px solid #ccc" }}
        ></model-viewer>
      ) : (
        <p>No 3D model available for this artwork.</p>
      )}

      <div style={{ marginTop: "20px" }}>
        <Link to={`/artwork/${id}`} style={{ color: "blue" }}>
          ← Back to Details
        </Link>
      </div>
    </div>
  );
};

export default Artwork3DView;
