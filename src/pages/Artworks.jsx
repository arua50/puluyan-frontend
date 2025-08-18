import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

const Artworks = () => {
  const { id } = useParams(); // Exhibition ID
  const [artworks, setArtworks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

 const getImageUrl = (imageData) => {
  const baseUrl = import.meta.env.VITE_API_URL || process.env.REACT_APP_API_URL || "";

  const url = imageData?.data?.url || imageData?.url;

  if (url) {
    // If it's already a full URL (http/https), return as is
    if (url.startsWith("http")) {
      return url;
    }
    // If it's relative, attach base URL
    return `${baseUrl}${url}`;
  }

  // Fallback placeholder
  return "https://via.placeholder.com/300x300?text=No+Image";
};
  useEffect(() => {
    const fetchArtworks = async () => {
      try {
        const response = await fetch(
          `https://puluyanartgallery.onrender.com/api/artworks?filters[exhibition][id][$eq]=${id}&populate=*`
        );

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const json = await response.json();
        console.log("Fetched artworks full JSON:", JSON.stringify(json, null, 2));

        const simplified = json.data.map((item) => {
          const attrs = item;
          return {
            id: item.id,
            title: attrs.art_title || "Untitled",
            artist: attrs.artist || "Unknown Artist",
            image: getImageUrl(attrs.art_image),
          };
        });

        setArtworks(simplified);
      } catch (err) {
        console.error("Error fetching artworks:", err);
        setError("Failed to load list artworks. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchArtworks();
  }, [id]);

  if (loading) {
    return <p style={{ textAlign: "center", fontSize: "18px" }}>Loading artworks...</p>;
  }

  if (error) {
    return <p style={{ textAlign: "center", color: "red", fontSize: "18px" }}>{error}</p>;
  }

  return (
    <div style={{ padding: "24px", maxWidth: "960px", margin: "0 auto" }}>
      <h1 style={{ fontSize: "28px", fontWeight: "bold", textAlign: "center", marginBottom: "24px" }}>
        Artworks
      </h1>

      {artworks.length === 0 ? (
        <p style={{ textAlign: "center", fontSize: "16px", color: "#666" }}>
          No artworks found for this exhibition.
        </p>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "20px",
          }}
        >
          {artworks.map((artwork) => (
            <Link
              to={`/artwork/${artwork.documentId}`}
              key={artwork.documentId}
              style={{ textDecoration: "none", color: "inherit" }}
            >
              <div
                style={{
                  borderRadius: "10px",
                  boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                  backgroundColor: "#fff",
                  overflow: "hidden",
                  transition: "transform 0.2s ease-in-out",
                }}
              >
                <img
                  src={artwork.image}
                  alt={artwork.title || "Artwork"}
                  style={{ width: "100%", height: "200px", objectFit: "cover" }}
                />
                <div style={{ padding: "16px" }}>
                  <h2 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "8px" }}>
                    {artwork.title}
                  </h2>
                  <p style={{ color: "#666" }}>By {artwork.artist}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Artworks;
