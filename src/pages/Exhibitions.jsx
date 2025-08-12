import React, { useEffect, useState } from "react";

export default function ExhibitionsList() {
  const [exhibitions, setExhibitions] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ Your backend base URL
  const API_URL = "https://puluyanartgallery.onrender.com";
  
  // ✅ Make sure this matches your Strapi API ID exactly
  const ENDPOINT = `${API_URL}/api/exhibitions?populate=coverImage`;

  useEffect(() => {
    const fetchExhibitions = async () => {
      try {
        const res = await fetch(ENDPOINT);

        if (!res.ok) {
          throw new Error(`HTTP error! Status: ${res.status}`);
        }

        const json = await res.json();

        if (!json.data || json.data.length === 0) {
          console.warn("No exhibitions found");
          setExhibitions([]);
          return;
        }

        const simplified = json.data.map((item) => {
          const attrs = item.attributes || {};
          const imageData = attrs.coverImage?.data?.attributes;

          let imageUrl = "https://via.placeholder.com/400x300?text=No+Image"; // default

          if (imageData) {
            if (imageData.formats?.medium?.url) {
              imageUrl = imageData.formats.medium.url;
            } else if (imageData.url) {
              imageUrl = imageData.url;
            }

            if (imageUrl && !imageUrl.startsWith("http")) {
              imageUrl = `${API_URL}${imageUrl}`;
            }
          }

          return {
            id: item.id,
            exb_title: attrs.exb_title || "Untitled Exhibition",
            startDate: attrs.startDate || "Unknown",
            endDate: attrs.endDate || "Unknown",
            imageUrl,
          };
        });

        setExhibitions(simplified);
      } catch (err) {
        console.error("Error fetching exhibitions:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchExhibitions();
  }, [ENDPOINT]);

  if (loading) return <p>Loading exhibitions...</p>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
      {exhibitions.map((exhibition) => (
        <div
          key={exhibition.id}
          className="border rounded-lg shadow-md overflow-hidden"
        >
          <img
            src={exhibition.imageUrl}
            alt={exhibition.exb_title}
            className="w-full h-48 object-cover"
          />
          <div className="p-4">
            <h2 className="text-lg font-bold">{exhibition.exb_title}</h2>
            <p className="text-sm text-gray-500">
              {exhibition.startDate} – {exhibition.endDate}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
