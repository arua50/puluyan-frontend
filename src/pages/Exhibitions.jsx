import React, { useEffect, useState } from "react";
import axios from "axios";

const Exhibitions = () => {
  const [exhibitions, setExhibitions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lightboxImage, setLightboxImage] = useState(null);

  useEffect(() => {
    const fetchExhibitions = async () => {
      try {
        const res = await axios.get("https://puluyanartgallery.onrender.com//api/exhibitions?populate=coverImage");
        setExhibitions(res.data.data);
      } catch (err) {
        console.error("Error fetching exhibitions:", err);
        setError("Failed to fetch exhibitions.");
      } finally {
        setLoading(false);
      }
    };

    fetchExhibitions();
  }, []);

  if (loading) return <p>Loading exhibitions...</p>;
  if (error) return <p>{error}</p>;

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
        {exhibitions.map((exhibition) => {
          const imageThumb = exhibition.coverImage?.formats?.thumbnail?.url || exhibition.coverImage?.url;
          const imageFull = exhibition.coverImage?.formats?.large?.url || exhibition.coverImage?.url;

          return (
            <div
              key={exhibition.id}
              className="border rounded shadow p-4 cursor-pointer"
              onClick={() => setLightboxImage(imageFull)}
            >
              {imageThumb && (
                <img
                  src={imageThumb}
                  alt={exhibition.exb_title || "Exhibition"}
                  className="w-full h-48 object-cover rounded"
                />
              )}
              <h2 className="text-lg font-bold mt-2">{exhibition.exb_title}</h2>
              <p className="text-sm text-gray-600">
                {exhibition.startDate} – {exhibition.endDate}
              </p>
            </div>
          );
        })}
      </div>

      {/* Lightbox Overlay */}
      {lightboxImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50"
          onClick={() => setLightboxImage(null)}
        >
          <img
            src={lightboxImage}
            alt="Full Size"
            className="max-w-full max-h-full rounded shadow-lg"
          />
        </div>
      )}
    </>
  );
};

export default Exhibitions;
