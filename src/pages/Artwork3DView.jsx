import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

// Install model-viewer: npm install @google/model-viewer
import "@google/model-viewer";

const Artwork3DView = () => {
  const { id } = useParams(); // artwork id
  const [artwork, setArtwork] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchArtwork = async () => {
      try {
        const res = await fetch(
          `https://puluyanartgallery.onrender.com/api/artworks?filters[id][$eq]=${id}&populate=*`
        );

        if (!res.ok) throw new Error(`HTTP error! Status ${res.status}`);

        const json = await res.json();
        if (json.data.length === 0) {
          throw new Error("Artwork not found");
        }

        const item = json.data[0];
        setArtwork({
          id: item.id,
          title: item.art_title,
          description: item.art_description,
          artist: item.artist,
          image: item.art_image?.url,
          model3D: item.model3D?.url, // ✅ GLB file
        });
      } catch (err) {
        console.error("Error fetching artwork:", err);
        setError("Failed to fetch artwork");
      } finally {
        setLoading(false);
      }
    };

    fetchArtwork();
  }, [id]);

  if (loading) return <p style={{ textAlign: "center" }}>Loading 3D artwork...</p>;
  if (error) return <p style={{ textAlign: "center", color: "red" }}>{error}</p>;
  if (!artwork) return null;

  return (
    <div style={{ padding: "24px", maxWidth: "900px", margin: "0 auto" }}>
      <Link to="/" style={{ color: "#007bff", textDecoration: "underline" }}>
        ← Back to Exhibitions
      </Link>
      <h1 style={{ fontSize: "28px", fontWeight: "bold", margin: "16px 0" }}>
        {artwork.title}
      </h1>
      <p style={{ color: "#666", marginBottom: "8px" }}>By {artwork.artist}</p>
      <p style={{ marginBottom: "24px" }}>{artwork.description}</p>

      {artwork.model3D ? (
        <model-viewer
          src={artwork.model3D}
          alt={artwork.title}
          ar
          auto-rotate
          camera-controls
          style={{ width: "100%", height: "500px", border: "1px solid #ccc", borderRadius: "10px" }}
        />
      ) : (
        <p style={{ color: "red" }}>⚠ No 3D model available for this artwork</p>
      )}
    </div>
  );
};

export default Artwork3DView;
