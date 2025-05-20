import React from "react";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div
      style={{
        minHeight: "10vh",
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
    marginBottom: "-5rem"
  }}
/>


      {/* Buttons */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "0.5rem", // small gap between buttons
        }}
      >
        <button
          onClick={() => navigate("/scan")}
          style={{
            backgroundColor: "#8B0000",
            color: "#fff",
            padding: "0.75rem 1rem",
            borderRadius: "9999px",
            fontWeight: "bold",
            fontSize: "1rem",
            border: "none",
            cursor: "pointer",
            width: "200px",
          }}
        >
          Scan
        </button>
        <button
          onClick={() => navigate("/exhibitions")}
          style={{
            backgroundColor: "#8B0000",
            color: "#fff",
            padding: "0.75rem 1rem",
            borderRadius: "9999px",
            fontWeight: "bold",
            fontSize: "1rem",
            border: "none",
            cursor: "pointer",
            width: "200px",
          }}
        >
          Archives
        </button>
      </div>
    </div>
  );
};

export default Home;
