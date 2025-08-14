import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const Artworks = () => {
  const { exhibitionId } = useParams(); // Get exhibition ID from the URL
  const [artworks, setArtworks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Helper function for image URLs
  const getImageUrl = (imageData) => {
    const url = imageData?.data?.attributes?.url;
    return url
      ? `https://puluyanartgallery.onrender.com${url}`
      : "https://via.placeholder.com/400x300?text=No+Image";
  };

  useEffect(() => {
    const fetchArtworks = async () => {
      try {
        const res = await fetch(
          `https://puluyanartgallery.onrender.com/api/artworks?filters[exhibition][id][$eq]=${exhibitionId}&populate=*`
        );

        if (!res.ok) throw new Error("Failed to fetch artworks");

        const json = await res.json();
        console.log("Fetched artworks JSON:", json);

        const formatted = json.data.map((item) => ({
          id: item.id,
          title: item.attributes.art_title || "Untitled",
          artist: item.attributes.artist || "Unknown Artist",
          image: getImageUrl(item.attributes.art_image),
        }));

        setArtworks(formatted);
      } catch (err) {
        console.error("Error fetching artworks:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchArtworks();
  }, [exhibitionId]);

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
              src={art.image}
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
