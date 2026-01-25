import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./Mods.css";

function ModsQuote() {
  const navigate = useNavigate();
  const location = useLocation();
  const preselectedCategory = location.state?.category || "";

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    vehicle: "",
    registration: "",
    category: preselectedCategory,
    mods: [],
    budget: "",
    notes: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const allMods = [
    "Body Kit",
    "Custom Paint",
    "LED Lights",
    "Alloy Wheels",
    "Window Tinting",
    "Engine Tuning",
    "Turbo Kit",
    "Exhaust System",
    "Air Intake",
    "Suspension",
    "Sound System",
    "Subwoofer",
    "Amplifier",
    "Android Head Unit",
    "Dash Cam",
    "Parking Sensors",
    "Reverse Camera",
    "Seat Covers",
    "Floor Mats",
    "Sunroof",
  ];

  const budgets = [
    { value: "<25000", label: "Below ₹25,000" },
    { value: "25000-75000", label: "₹25,000 - ₹75,000" },
    { value: "75000-150000", label: "₹75,000 - ₹1,50,000" },
    { value: ">150000", label: "Above ₹1,50,000" },
  ];

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onToggleMod = (mod) => {
    setForm((prev) => {
      const present = prev.mods.includes(mod);
      return { ...prev, mods: present ? prev.mods.filter((m) => m !== mod) : [...prev.mods, mod] };
    });
  };

  const onSubmit = (e) => {
    e.preventDefault();
    console.log("Mods quote submitted:", form);
    setSubmitted(true);
    setTimeout(() => navigate("/"), 2000);
  };

  if (submitted) {
    return (
      <div className="mods-container">
        <div className="success-message">
          <div className="success-icon">✓</div>
          <h2>Quote Request Sent</h2>
          <p>Our modifications expert will reach out within 24 hours.</p>
          <button className="btn-primary" onClick={() => navigate("/")}>Back to Home</button>
        </div>
      </div>
    );
  }

  return (
    <div className="mods-container">
      <div className="mods-hero">
        <h1>Get a Custom Quote</h1>
        <p>Tell us your vehicle details and desired upgrades. We’ll send a tailored estimate.</p>
      </div>

      <form className="mods-form" onSubmit={onSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label>Name *</label>
            <input name="name" value={form.name} onChange={onChange} required placeholder="Your full name" />
          </div>
          <div className="form-group">
            <label>Phone *</label>
            <input name="phone" type="tel" value={form.phone} onChange={onChange} required placeholder="9XXXXXXXXX" />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Email</label>
            <input name="email" type="email" value={form.email} onChange={onChange} placeholder="you@email.com" />
          </div>
          <div className="form-group">
            <label>Registration No.</label>
            <input name="registration" value={form.registration} onChange={onChange} placeholder="GJ-01-AB-1234" />
          </div>
        </div>

        <div className="form-group">
          <label>Vehicle *</label>
          <input name="vehicle" value={form.vehicle} onChange={onChange} required placeholder="e.g., 2021 Hyundai i20 N Line" />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Category</label>
            <select name="category" value={form.category} onChange={onChange}>
              <option value="">Select category (optional)</option>
              <option>🎨 Aesthetic Mods</option>
              <option>⚡ Performance Upgrades</option>
              <option>🔊 Audio & Entertainment</option>
              <option>🛡️ Safety & Comfort</option>
            </select>
          </div>
          <div className="form-group">
            <label>Budget *</label>
            <select name="budget" value={form.budget} onChange={onChange} required>
              <option value="">Select budget</option>
              {budgets.map((b) => (
                <option key={b.value} value={b.value}>{b.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="mods-pills">
          {allMods.map((m) => (
            <button
              type="button"
              key={m}
              className={`pill ${form.mods.includes(m) ? "active" : ""}`}
              onClick={() => onToggleMod(m)}
            >
              {m}
            </button>
          ))}
        </div>

        <div className="form-group">
          <label>Notes</label>
          <textarea name="notes" rows="4" value={form.notes} onChange={onChange} placeholder="Any specific goals or references?" />
        </div>

        <div className="actions-row">
          <button type="button" className="btn-secondary" onClick={() => navigate(-1)}>Cancel</button>
          <button type="submit" className="btn-primary">Request Quote</button>
        </div>
      </form>
    </div>
  );
}

export default ModsQuote;
