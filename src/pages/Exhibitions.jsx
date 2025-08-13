import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Exhibitions.css";

const API_URL = "https://puluyanartgallery.onrender.com";
const BASE_URL = `${API_URL}/api/exhibitions?populate=coverImage`;

const Exhibitions = () => {
  const [exhibitions, setExhibitions] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchExhibitions = async () => {
      try {
        // ✅ Fetch from BASE_URL so Strapi returns exhibitions + coverImage
        const response = await fetch(BASE_URL);
        const json = await response.json();

        const simplified = json.data.map((item) => {
          const image = item.coverImage;

          // Default placeholder image
          let imageUrl = "https://via.placeholder.com/400x300?text=No+Image";

          // ✅ Correct image URL building
          if (image && image.formats && image.formats.medium?.url) {
            imageUrl = `${API_URL}${image.formats.medium.url}`;
          } else if (image?.url) {
            imageUrl = `${API_URL}${image.url}`;
          }

          return {
            id: item.id,
            exb_title: item.exb_title || "Untitled Exhibition",
            startDate: item.startDate || "Unknown",
            endDate: item.endDate || "Unknown",
            imageUrl,
          };
        });

        setExhibitions(simplified);
      } catch (error) {
        console.error("Error fetching exhibitions:", error);
      }
    };

    fetchExhibitions();
  }, []);

  const handleExhibitionClick = (id) => {
    navigate(`/exhibitions/${id}`);
  };

  return (
    <div className="exhibitions-container">
      <div className="exhibitions-list">
        {exhibitions.map((exhibition) => (
          <div
            key={exhibition.id}
            className="exhibition-card"
            onClick={() => handleExhibitionClick(exhibition.id)}
          >
            <img
              src={exhibition.imageUrl}
              alt={exhibition.exb_title}
              className="exhibition-image"
            />
            <div className="exhibition-overlay">
              <h2 className="exhibition-title">{exhibition.exb_title}</h2>
              <p className="exhibition-dates">
                {exhibition.startDate} – {exhibition.endDate}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Exhibitions;
