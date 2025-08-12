import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Exhibitions.css";

const API_URL = "https://puluyanartgallery.onrender.com/api/exhibitions?populate=coverImage";
const BASE_URL = "https://puluyanartgallery.onrender.com";

const Exhibitions = () => {
  const [exhibitions, setExhibitions] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchExhibitions = async () => {
      try {
        const res = await fetch(
          "https://puluyanartgallery.onrender.com/api/exhibitions?populate=coverImage"
        );
        const data = await res.json();

        console.log("Full API Response:", data);

        // Extract the exhibitions array
        const exhibitionsList = data.data || [];
        setExhibitions(exhibitionsList);
      } catch (err) {
        setError(err.message);
        console.error("Error fetching exhibitions:", err);
      }
    };

    fetchExhibitions();
  }, []);

  if (error) return <p>Error: {error}</p>;
  if (!exhibitions.length) return <p>No exhibitions found</p>;

  return (
    <div>
      <h1>Exhibitions</h1>
      {exhibitions.map((item) => {
        const attrs = item.attributes;
        const imageUrl =
          attrs.coverImage?.data?.attributes?.url
            ? `https://puluyanartgallery.onrender.com${attrs.coverImage.data.attributes.url}`
            : null;

        return (
          <div key={item.id}>
            <h2>{attrs.title}</h2>
            {imageUrl ? (
              <img src={imageUrl} alt={attrs.title} width="300" />
            ) : (
              <p>No image available</p>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default Exhibitions;
