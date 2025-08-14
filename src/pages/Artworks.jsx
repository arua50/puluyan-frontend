import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const API_URL = "https://puluyanartgallery.onrender.com";

const Artworks = () => {
  const { id } = useParams(); // from /exhibitions/:id
  const [artworks, setArtworks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArtworks = async () => {
      try {
        const res = await fetch(
          `${API_URL}/api/artworks?filters[exhibition][id][$eq]=${id}&populate=art_image`
        );

        if (!res.ok) throw new Error("Failed to fetch artworks");

        const json = await res.json();
        console.log("Artworks API Response:", json);

        const simplified = json.data.map((item) => {
          const art = item.attributes;
          const imgData = art.art_image?.data?.attributes;

          let imageUrl = "https://via.placeholder.com/400x300?text=No+Image";
          if (imgData?.formats?.medium?.url) {
            imageUrl = `${API_URL}${imgData.formats.medium.url}`;
          } else if (imgData?.url) {
            imageUrl = `${API_URL}${imgData.url}`;
          }

          return {
            id: item.id,
            title: art.art_title || "Untitled Artwork",
            artist: art.artist || "Unknown Artist",
            imageUrl,
          };
        });

        setArtworks(simplified);
      } catch (err) {
        console.error("Error fetching artworks:", err);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchArtworks();
  }, [id]);

  if (loading) return <p>Loading artworks...</p>;
  if (!artworks.length) return <p>No artworks found for this exhibition.</p>;

  return (
    <div style={{ padding: "20px" }}>
      <h1>Artworks in this Exhibition</h1>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
          gap: "16px",
        }}
      >
        {artworks.map((art) => (
          <div
            key={art.id}
            style={{
              border: "1px solid #ddd",
              borderRadius: "8px",
              overflow: "hidden",
            }}
          >
            <img
              src={art.imageUrl}
              alt={art.title}
              style={{ width: "100%", height: "200px", objectFit: "cover" }}
            />
            <div style={{ padding: "10px" }}>
              <h2 style={{ fontSize: "18px", marginBottom: "5px" }}>
                {art.title}
              </h2>
              <p style={{ fontSize: "14px", color: "#555" }}>{art.artist}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Artworks;
