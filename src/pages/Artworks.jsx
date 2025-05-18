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
          `https://puluyanartgallery.onrender.com/api/artworks?populate=coverImage,artist,exhibition&filters[exhibition][id][$eq]=${id}`
        );
        const json = await response.json();
        console.log("Fetched artworks:", json);
        setArtworks(json.data || []);
      } catch (err) {
        console.error("Error fetching artworks:", err);
        setError("Failed to load artworks.");
      } finally {
        setLoading(false);
      }
    };

    fetchArtworks();
  }, [id]);

  if (loading) return <p className="text-center">Loading...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4 text-center">Artworks in Exhibition</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {artworks.map((artwork) => {
          const { id, attributes } = artwork;
          const { art_title, artist, coverImage } = attributes;

          const imageUrl = coverImage?.data?.attributes?.url
            ? `https://puluyanartgallery.onrender.com${coverImage.data.attributes.url}`
            : "https://via.placeholder.com/400x300?text=No+Image";

          const artistName = artist?.data?.attributes?.name || "Unknown Artist";

          return (
            <div
              key={id}
              className="rounded shadow bg-white overflow-hidden"
            >
              <img
                src={imageUrl}
                alt={art_title}
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <h2 className="text-lg font-semibold mb-1">{art_title}</h2>
                <p className="text-gray-600">By {artistName}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Artworks;
