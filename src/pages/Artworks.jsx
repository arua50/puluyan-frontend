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
  return "https://via.placeholder.com/200x200?text=No+Image";
};
  useEffect(() => {
    const fetchArtworks = async () => {
      try {
        const response = await fetch(
          `https://puluyan-back.onrender.com/api/artworks?filters[exhibition][id][$eq]=${id}&populate=*`
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
  <div
  style={{
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "20px",
  }}
>
  {artworks.map((artwork) => (
    <Link
      to={`/artwork-3d/${artwork.id}`}
      key={artwork.id}
      style={{ textDecoration: "none", color: "inherit" }}
    >
      <div
        style={{
          borderRadius: "10px",
          boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
          backgroundColor: "#fff",
          overflow: "hidden",
          transition: "transform 0.2s ease-in-out",
          aspectRatio: "1 / 1", // 👈 keeps it perfectly square
          display: "flex",
          flexDirection: "column",
        }}
      >
        <img
          src={artwork.image}
          alt={artwork.title || "Artwork"}
          style={{
            width: "100%",
            height: "70%", // image takes 70% of square
            objectFit: "cover",
          }}
        />
        <div style={{ padding: "8px", flex: "1" }}>
          <h2
            style={{
              fontSize: "16px",
              fontWeight: "600",
              marginBottom: "4px",
              textAlign: "center",
            }}
          >
            {artwork.title}
          </h2>
          <p style={{ color: "#666", fontSize: "14px", textAlign: "center" }}>
            By {artwork.artist}
          </p>
        </div>
      </div>
    </Link>
  ))}
</div>

  );
};

export default Artworks;
