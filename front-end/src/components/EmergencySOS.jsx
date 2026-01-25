import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Emergency.css";

function EmergencySOS() {
  const navigate = useNavigate();
  const supportNumber = "+919328764024";

  useEffect(() => {
    const t = setTimeout(() => {
      window.location.href = `tel:${supportNumber}`;
    }, 400);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="emg-container">
      <div className="emg-hero">
        <h1>🚘 Emergency Roadside Help</h1>
        <p>Immediate assistance for accidents, mechanical failures, and emergency towing services.</p>
      </div>

      <div className="emg-card">
        <h2>Emergency SOS</h2>
        <p>Tap to call our emergency line. We’ll dispatch help immediately.</p>
        <a className="btn-primary call-btn" href={`tel:${supportNumber}`}>📞 Call Now: 9328764024</a>
        <div className="tip">Share your live location with our agent for faster help.</div>
        <div className="actions-row">
          <button className="btn-secondary" onClick={() => navigate(-1)}>Go Back</button>
          <button className="btn-secondary" onClick={() => navigate("/emergency/info")}>Learn More</button>
        </div>
      </div>

      <div className="emg-grid">
        <div className="e-card">🪝 Towing Service</div>
        <div className="e-card">🪫 Battery Jump-start</div>
        <div className="e-card">🛞 Tire Change / Puncture</div>
        <div className="e-card">⛽ Emergency Fuel</div>
        <div className="e-card">🔧 Quick Mechanical Fix</div>
        <div className="e-card">📑 Accident Assistance</div>
      </div>
    </div>
  );
}

export default EmergencySOS;
