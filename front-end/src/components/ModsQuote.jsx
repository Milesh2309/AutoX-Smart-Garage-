import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useNotifications } from '../context/NotificationContext';
import "./Mods.css";

function ModsQuote() {
  const navigate = useNavigate();
  const location = useLocation();
  const { addNotification } = useNotifications();
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
  const [showPaymentOptions, setShowPaymentOptions] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);

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

  const paymentMethods = [
    { id: "credit_card", name: "Credit Card", icon: "💳", description: "Secure card payment" },
    { id: "debit_card", name: "Debit Card", icon: "🏦", description: "Direct debit payment" },
    { id: "upi", name: "UPI/Digital Wallet", icon: "📱", description: "UPI, PayTM, Google Pay" },
    { id: "netbanking", name: "Net Banking", icon: "🏧", description: "Direct bank transfer" },
    { id: "wallet", name: "Digital Wallet", icon: "💰", description: "Saved wallet balance" },
    { id: "cod", name: "Pay at Center", icon: "💵", description: "Cash on service completion" },
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
    
    // Add notification for quote request
    addNotification({
      type: 'booking',
      title: 'Quote Request Submitted',
      message: `Your modification quote for ${form.vehicle} has been submitted successfully`,
      icon: '🎨',
    });
    
    setSubmitted(true);
    // Show payment options instead of redirecting
    setShowPaymentOptions(true);
  };

  if (submitted) {
    if (showPaymentOptions) {
      return (
        <div className="mods-container">
          <div className="payment-section">
            <div className="payment-header">
              <h2>Quote Request Received ✓</h2>
              <p>Select a payment method to proceed with your quote request</p>
            </div>

            <div className="quote-summary">
              <h3>Quote Summary</h3>
              <div className="summary-item">
                <span>Vehicle:</span>
                <strong>{form.vehicle}</strong>
              </div>
              <div className="summary-item">
                <span>Selected Modifications:</span>
                <strong>{form.mods.length > 0 ? form.mods.join(", ") : "Not specified"}</strong>
              </div>
              <div className="summary-item">
                <span>Budget Range:</span>
                <strong>{form.budget}</strong>
              </div>
            </div>

            <div className="payment-methods-container">
              <h3>Choose Payment Method</h3>
              <div className="payment-grid">
                {paymentMethods.map((method) => (
                  <div
                    key={method.id}
                    className={`payment-card ${selectedPaymentMethod === method.id ? "active" : ""}`}
                    onClick={() => setSelectedPaymentMethod(method.id)}
                  >
                    <div className="payment-icon">{method.icon}</div>
                    <h4>{method.name}</h4>
                    <p>{method.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="payment-actions">
              <button
                className="btn-secondary"
                onClick={() => {
                  setSubmitted(false);
                  setShowPaymentOptions(false);
                }}
              >
                Back to Form
              </button>
              <button
                className="btn-primary"
                disabled={!selectedPaymentMethod}
                onClick={() => {
                  // Add payment notification
                  addNotification({
                    type: 'payment',
                    title: 'Payment Processing',
                    message: `Processing payment via ${selectedPaymentMethod}. Quote request will be confirmed.`,
                    icon: '💳',
                  });
                  
                  setTimeout(() => {
                    // Add confirmation notification
                    addNotification({
                      type: 'booking',
                      title: 'Quote Request Confirmed',
                      message: 'Your modification quote request has been confirmed. We will contact you within 24 hours.',
                      icon: '✅',
                    });
                    navigate("/");
                  }, 1500);
                }}
              >
                Proceed with Payment
              </button>
            </div>

            <div className="payment-info">
              <p>💡 <strong>Note:</strong> You'll receive a quote within 24 hours. Payment secures your quote priority.</p>
            </div>
          </div>
        </div>
      );
    }

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
