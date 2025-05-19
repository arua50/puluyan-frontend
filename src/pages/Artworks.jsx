import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const Artworks = () => {
  const { id } = useParams(); // Exhibition ID
  const [artworks, setArtworks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchArtworks = async () => {
      try {
        const response = await fetch(
          `https://puluyanartgallery.onrender.com/api/artworks?filters[exhibition][id][$eq]=${id}&populate=*`
        );
        const json = await response.json();
        console.log("Fetched artworks:", json);

        const simplified = json.data.map((item) => ({
          id: item.id,
          title: item?.art_title || "Untitled",
          artist: item?.artist?.data?.name || "Unknown Artist",
          image: item?.coverImage?.data?.url
            ? `https://puluyanartgallery.onrender.com${item.coverImage.data.url}`
            : "https://via.placeholder.com/400x300?text=No+Image",
        }));

        setArtworks(simplified);
      } catch (err) {
        console.error("Error fetching artworks:", err);
        setError("Failed to load artworks.");
      } finally {
        setLoading(false);
      }
    };

    fetchArtworks();
  }, [id]);

  if (loading) return <p style={{ textAlign: "center" }}>Loading...</p>;
  if (error)
    return <p style={{ textAlign: "center", color: "red" }}>{error}</p>;

  return (
    <div style={{ padding: "24px", maxWidth: "960px", margin: "0 auto" }}>
      <h1
        style={{
          fontSize: "24px",
          fontWeight: "bold",
          textAlign: "center",
          marginBottom: "20px",
        }}
      >
        Artworks in Exhibition
      </h1>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "16px",
        }}
      >
        {artworks.map((artwork) => (
          <div
            key={artwork.id}
            style={{
              borderRadius: "8px",
              boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
              backgroundColor: "#fff",
              overflow: "hidden",
            }}
          >
            <img
              src={artwork.image}
              alt={artwork.title}
              style={{ width: "100%", height: "200px", objectFit: "cover" }}
            />
            <div style={{ padding: "16px" }}>
              <h2 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "8px" }}>
                {artwork.title}
              </h2>
              <p style={{ color: "#666" }}>By {artwork.artist}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Artworks;
