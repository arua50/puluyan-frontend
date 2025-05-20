import React from "react";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#fff",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
      }}
    >
      {/* Logo */}
   <img
  src="/logo.png"
  alt="Puluy-an Logo"
  style={{               // JSX style object
    width: 400,          // pixels — increase as needed
    maxWidth: "90%",     // optional: don’t overflow small screens
    marginBottom: "0rem"
  }}
/>


      {/* Buttons */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
        }}
      >
        <button
          onClick={() => navigate("/scan")}
          style={{
            backgroundColor: "#8B0000", // deep red
            color: "#fff",
            padding: "0.75rem 2rem",
            borderRadius: "9999px", // fully rounded
            fontWeight: "bold",
            fontSize: "1rem",
            border: "none",
            cursor: "pointer",
          }}
        >
          Scan
        </button>
        <button
          onClick={() => navigate("/exhibitions")}
          style={{
            backgroundColor: "#8B0000",
            color: "#fff",
            padding: "0.75rem 2rem",
            borderRadius: "9999px",
            fontWeight: "bold",
            fontSize: "1rem",
            border: "none",
            cursor: "pointer",
          }}
        >
          Archives
        </button>
      </div>
    </div>
  );
};

export default Home;
