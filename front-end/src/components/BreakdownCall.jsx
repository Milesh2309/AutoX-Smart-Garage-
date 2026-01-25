import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Breakdown.css";

function BreakdownCall() {
  const navigate = useNavigate();
  const supportNumber = "+919328764024";

  useEffect(() => {
    // Optionally, auto-open the dialer shortly after mount
    const t = setTimeout(() => {
      window.location.href = `tel:${supportNumber}`;
    }, 400);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="breakdown-container">
      <div className="breakdown-hero">
        <h1>🆘 Vehicle Breakdown Assistance</h1>
        <p>24/7 roadside support for breakdowns, tire changes, fuel delivery, and quick fixes.</p>
      </div>

      <div className="breakdown-card">
        <h2>Call Our Support Line</h2>
        <p>Tap the button below to call our emergency line. We’ll dispatch help immediately.</p>
        <a className="btn-primary call-btn" href={`tel:${supportNumber}`}>📞 Call Now: 9328764024</a>
        <div className="tip">
          Tip: Share your live location with the agent for faster assistance.
        </div>
        <div className="actions-row">
          <button className="btn-secondary" onClick={() => navigate(-1)}>Go Back</button>
          <button className="btn-secondary" onClick={() => navigate("/breakdown/request")}>Request Help Form</button>
        </div>
      </div>

      <div className="breakdown-grid">
        <div className="b-card">🪫 Battery Jump-start</div>
        <div className="b-card">🛞 Tire Change / Puncture</div>
        <div className="b-card">⛽ Emergency Fuel</div>
        <div className="b-card">🪝 Towing Service</div>
        <div className="b-card">🔧 Quick Mechanical Fix</div>
        <div className="b-card">📑 Accident Assistance</div>
      </div>
    </div>
  );
}

export default BreakdownCall;
