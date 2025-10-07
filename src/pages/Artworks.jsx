import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeftCircle } from "lucide-react"; // ✅ added icon import
import "./artwork.css";

/* ===========================
   Artworks Grid Page (Images Only)
=========================== */
const Artworks = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [artworks, setArtworks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [exhibitionTitle, setExhibitionTitle] = useState("Exhibition");

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

        if (json.data.length > 0) {
          const exbName =
            json.data[0]?.exhibition?.exb_title || // ✅ this is the correct path
            json.data[0]?.attributes?.exhibition?.exb_title ||
            "Exhibition";
          setExhibitionTitle(exbName);
        }

        const simplified = json.data.map((item) => ({
          id: item.id,
          title: item.art_title || item.attributes?.art_title || "Untitled",
          artist: item.artist || item.attributes?.artist || "Unknown Artist",
          image: getFileUrl(item.art_image || item.attributes?.art_image),
        
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
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      {/* Back button + Exhibition title */}
      <div
        style={{
          width: "100%",
          maxWidth: "900px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "16px",
        }}
      >
        {/* ✅ Updated Back Button with Icon */}
        <button
          onClick={() => navigate(-1)}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "transparent",
            color: "#1e1e1e",
            border: "none",
            borderRadius: "50%",
            width: "40px",
            height: "40px",
            cursor: "pointer",
            transition: "all 0.2s ease-in-out",
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = "scale(1.1)";
            e.currentTarget.style.color = "#323232ff";
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = "scale(1)";
            e.currentTarget.style.color = "#1e1e1e";
          }}
        >
          <ArrowLeftCircle size={25} />
        </button>

        <h1
          style={{
             fontSize: "clamp(16px, 3vw, 24px)",
              fontWeight: "700",
              textAlign: "center",
              color: "#333",
              flex: 1,
              margin: 0,
              textTransform: "uppercase", // ✅ all caps
          }}
        >
          {exhibitionTitle}
        </h1>
      </div>

      {/* Artworks Grid */}
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
                  aspectRatio: "3/4",
                  padding: "6px",
                }}
              >
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
