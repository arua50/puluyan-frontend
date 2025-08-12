import React, { useEffect, useState } from "react";
import axios from "axios";

const Exhibitions = () => {
  const [exhibitions, setExhibitions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
      {exhibitions.map((exhibition) => {
        const imageUrl = exhibition.coverImage?.formats?.medium?.url || exhibition.coverImage?.url;

        return (
          <div key={exhibition.id} className="border rounded shadow p-4">
            {imageUrl && (
              <img
                src={imageUrl}
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
  );
};

export default Exhibitions;
