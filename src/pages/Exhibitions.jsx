import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Exhibitions = () => {
  const [exhibitions, setExhibitions] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchExhibitions = async () => {
      try {
        const response = await fetch(
          "https://puluyanartgallery.onrender.com/api/exhibitions"
        );
        const json = await response.json();
        console.log("Fetched exhibitions:", json);
        setExhibitions(json.data || []);
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
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4 text-center">Exhibitions</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        
        {exhibitions.map((exhibition) => {
          const { id, exb_title, startDate, endDate } = exhibition;

          return (
            <div
              key={id}
              className="cursor-pointer relative rounded shadow overflow-hidden bg-gray-100 hover:shadow-lg transition-shadow"
              onClick={() => handleExhibitionClick(id)}
            >
              <img
                src="https://via.placeholder.com/400x200?text=No+Image"
                alt={exb_title}
                className="w-full h-48 object-cover opacity-80"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 p-3 text-white">
                <h2 className="text-lg font-semibold">{exb_title}</h2>
                <p className="text-sm">
                  {startDate} – {endDate}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Exhibitions;
