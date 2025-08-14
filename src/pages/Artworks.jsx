import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

const Artworks = () => {
  const { id } = useParams(); // Exhibition ID from URL
  const [artworks, setArtworks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Helper to build image URL
  const getImageUrl = (imageData) => {
    const url = imageData?.data?.attributes?.url;
    return url
      ? `https://puluyanartgallery.onrender.com${url}`
      : "https://via.placeholder.com/400x300?text=No+Image";
  };

  useEffect(() => {
    const fetchArtworks = async () => {
      try {
        const response = await fetch(
          `https://puluyanartgallery.onrender.com/api/artworks?filters[exhibition][id][$eq]=${id}&populate=*`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch artworks");
        }

        const json = await response.json();

        if (!json.data || json.data.length === 0) {
          setArtworks([]);
          return;
        }

        const simplified = json.data.map((item) => {
          const attrs = item.attributes;
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
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchArtworks();
  }, [id]);

  if (loading) return <p style={{ textAlign: "center" }}>Loading artworks...</p>;
  if (error) return <p style={{ textAlign: "center", color: "red" }}>{error}</p>;
  if (artworks.length === 0) return <p style={{ textAlign: "center" }}>No artworks found for this exhibition.</p>;

  return (
    <div style={{ padding: "24px" }}>
      <h1 style={{ textAlign: "center", marginBottom: "24px" }}>Artworks</h1>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
          gap: "16px",
        }}
      >
        {artworks.map((artwork) => (
          <Link
            to={`/artwork/${artwork.id}`}
            key={artwork.id}
            style={{
              textDecoration: "none",
              border: "1px solid #ddd",
              borderRadius: "8px",
              overflow: "hidden",
              background: "#fff",
            }}
          >
            <img
              src={artwork.image}
              alt={artwork.title}
              style={{
                width: "100%",
                height: "200px",
                objectFit: "cover",
              }}
            />
            <div style={{ padding: "12px" }}>
              <h2
                style={{
                  fontSize: "18px",
                  margin: "0 0 8px",
                  color: "#333",
                }}
              >
                {artwork.title}
              </h2>
              <p style={{ margin: 0, color: "#666" }}>By {artwork.artist}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Artworks;
