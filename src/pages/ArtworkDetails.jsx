import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const ArtworkDetails = () => {
  const { id } = useParams();
  const [artwork, setArtwork] = useState(null);
  const [loading, setLoading] = useState(true);

  const getImageUrl = (imageData) => {
    const url = imageData?.data?.attributes?.url;
    return url
      ? `https://puluyanartgallery.onrender.com${url}`
      : "https://via.placeholder.com/400x300?text=No+Image";
  };

  useEffect(() => {
    const fetchArtwork = async () => {
      try {
        const response = await fetch(
          `https://puluyanartgallery.onrender.com/api/artworks/${id}?populate=*`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch artwork");
        }

        const json = await response.json();
        const item = json.data;

        if (!item) throw new Error("No artwork found");

        setArtwork({
          title: item.attributes.art_title || "Untitled",
          artist: item.attributes.artist || "Unknown",
          description: item.attributes.description || "No description available.",
          image: getImageUrl(item.attributes.art_image),
        });
      } catch (error) {
        console.error("Error fetching artwork:", error);
        setArtwork(null);
      } finally {
        setLoading(false);
      }
    };

    fetchArtwork();
  }, [id]);

  if (loading) return <p style={{ textAlign: "center" }}>Loading artwork...</p>;
  if (!artwork) return <p style={{ textAlign: "center" }}>Artwork not found.</p>;

  return (
    <div style={{ padding: "24px", maxWidth: "800px", margin: "0 auto" }}>
      <img
        src={artwork.image}
        alt={artwork.title}
        style={{ width: "100%", borderRadius: "12px", marginBottom: "16px" }}
      />
      <h1 style={{ fontSize: "28px", marginBottom: "8px" }}>{artwork.title}</h1>
      <h2 style={{ fontSize: "20px", color: "#666", marginBottom: "16px" }}>
        By {artwork.artist}
      </h2>
      <p style={{ fontSize: "16px", lineHeight: "1.5", color: "#333" }}>
        {artwork.description}
      </p>
    </div>
  );
};

export default ArtworkDetails;
