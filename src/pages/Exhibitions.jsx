import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Exhibitions = () => {
  const [exhibitions, setExhibitions] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchExhibitions = async () => {
      try {
        const response = await fetch(
          "https://puluyanartgallery.onrender.com/api/exhibitions?populate=coverImage"
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
    <div>
      <h1>Exhibitions</h1>
      <div>
        
        {exhibitions.map((exhibition) => {
          const { id, exb_title, startDate, endDate} = exhibition;

          return (
            <div
              key={id}
              className="cursor-pointer relative rounded shadow overflow-hidden bg-gray-100 hover:shadow-lg transition-shadow"
              onClick={() => handleExhibitionClick(id)}
            >
              <img
                src="/uploads/large_s_558cedc009.jpg"
                
              
              />
              <div>
                <h2 >{exb_title}</h2>
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
