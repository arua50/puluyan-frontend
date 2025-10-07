import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import "./artwork.css";

/* ===========================
   Artworks Grid Page (Images Only)
=========================== */
const Artworks = () => {
  const { id } = useParams();
  const [artworks, setArtworks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const baseUrl =
    import.meta.env.VITE_API_URL || process.env.REACT_APP_API_URL || "";

  const getFileUrl = (file) => {
    const url = file?.url || file?.data?.attributes?.url;
    if (!url) return null;
    return url.startsWith("http") ? url : `${baseUrl}${url}`;
  };

  useEffect(() => {
    const fetchArtworks = async () => {
      try {
        const response = await fetch(
          `https://puluyan-back.onrender.com/api/artworks?filters[exhibition][id][$eq]=${id}&populate=*`
        );

        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

        const json = await response.json();
        const simplified = json.data.map((item) => ({
          id: item.id,
          title: item.art_title || "Untitled",
          artist: item.artist || "Unknown Artist",
          image: getFileUrl(item.art_image),
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

  if (loading)
    return <p style={{ textAlign: "center", fontSize: "18px" }}>Loading...</p>;
  if (error)
    return (
      <p style={{ textAlign: "center", color: "red", fontSize: "18px" }}>
        {error}
      </p>
    );

  return (
    <div
      style={{
        padding: "16px",
        width: "100%",
        display: "flex",
        justifyContent: "center",
      }}
    >
      {artworks.length === 0 ? (
        <p style={{ textAlign: "center", fontSize: "16px", color: "#666" }}>
          No artworks found.
        </p>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, minmax(0, 400px))",
            gap: "14px",
            justifyContent: "center",
            width: "100%",
            maxWidth: "900px",
          }}
        >
          {artworks.map((artwork) => (
            <Link
              to={`/artwork-3d/${artwork.id}`}
              key={artwork.id}
              style={{
                textDecoration: "none",
                color: "inherit",
              }}
            >
              <div
                style={{
                  background: "#fff",
                  borderRadius: "14px",
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                  transition: "transform 0.2s ease-in-out",
                  height: "auto",
                  aspectRatio: "3/4",
                  padding: "6px",
                }}
              >
                {/* Artwork Image */}
                <div
                  style={{
                    width: "100%",
                    flex: 1,
                    background: "#f3f3f3",
                    borderRadius: "8px",
                  }}
                >
                  <img
                    src={
                      artwork.image ||
                      "https://via.placeholder.com/300x300?text=No+Image"
                    }
                    alt={artwork.title}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      borderRadius: "8px",
                    }}
                  />
                </div>

                {/* Text area */}
                <div
                  style={{
                    width: "100%",
                    textAlign: "center",
                    backgroundColor: "#fff",
                    padding: "6px 4px",
                  }}
                >
                  <h2
                    style={{
                      fontSize: "clamp(11px, 2.2vw, 15px)",
                      fontWeight: "600",
                      color: "#333",
                      margin: "0",
                      lineHeight: "1.2",
                    }}
                  >
                    {artwork.title}
                  </h2>
                  <p
                    style={{
                      fontSize: "clamp(10px, 2vw, 13px)",
                      color: "#666",
                      margin: "4px 0 0 0",
                      lineHeight: "1.2",
                    }}
                  >
                    {artwork.artist}
                  </p>
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
