import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const Artworks = () => {
  const [artworks, setArtworks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const baseUrl = "https://puluyanartgallery.onrender.com"; // set for now

  useEffect(() => {
    const fetchArtworks = async () => {
      try {
        const res = await fetch(`${baseUrl}/api/artworks?populate=*`);
        if (!res.ok) throw new Error("Failed to fetch artworks");
        const json = await res.json();
        setArtworks(json.data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchArtworks();
  }, []);

  const getImageUrl = (imageData) => {
    if (imageData?.data?.attributes?.url) {
      return `${baseUrl}${imageData.data.attributes.url}`;
    }
    return "https://via.placeholder.com/400x300?text=No+Image";
  };

  if (loading) return <p style={{ textAlign: "center" }}>Loading artworks...</p>;
  if (error) return <p style={{ textAlign: "center", color: "red" }}>{error}</p>;

  return (
    <div style={{ padding: "20px" }}>
      <h1>Artworks</h1>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: "20px" }}>
        {artworks.map((artwork) => (
          <div key={artwork.id} style={{ border: "1px solid #ccc", borderRadius: "8px", overflow: "hidden", padding: "10px" }}>
            <img
              src={getImageUrl(artwork.attributes?.image)}
              alt={artwork.attributes?.title || "Artwork"}
              style={{ width: "100%", height: "200px", objectFit: "cover" }}
            />
            <h3>{artwork.attributes?.title || "Untitled"}</h3>
            <p>{artwork.attributes?.description || "No description available."}</p>

            {/* Details page link */}
            <Link to={`/artwork/${artwork.id}`} style={{ color: "blue", marginRight: "10px" }}>
              View Details
            </Link>

            {/* 3D view link */}
            <Link to={`/artwork-3d/${artwork.id}`} style={{ color: "green" }}>
              View in 3D
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Artworks;
