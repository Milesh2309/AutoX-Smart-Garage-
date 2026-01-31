import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import './BookService.css';

function ServiceBooking() {
  const { serviceId } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    vehicle: '',
    preferredDate: '',
    preferredTime: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  // Service list matching the one in services.jsx
  const services = [
    {
      id: 1,
      title: "Smart Garage Services",
      icon: "🚗",
      description: "Complete vehicle diagnostics, maintenance, and scheduled servicing by certified technicians.",
      features: [
        "Full vehicle inspection",
        "Oil change & filter replacement",
        "Brake system check",
        "Battery health check",
        "Tire rotation & alignment"
      ]
    },
    {
      id: 2,
      title: "Vehicle Breakdown Assistance",
      icon: "🛠",
      description: "24/7 roadside support for breakdowns, tire changes, fuel delivery, and quick fixes.",
      features: [
        "24/7 Emergency support",
        "On-spot tire change",
        "Battery jump-start",
        "Fuel delivery service",
        "Towing assistance"
      ]
    },
    {
      id: 3,
      title: "Vehicle Modification",
      icon: "⚙",
      description: "Expert custom modifications, upgrades, and tuning to enhance performance and aesthetics.",
      features: [
        "Performance tuning",
        "Custom body kits",
        "Exhaust upgrades",
        "Lighting modifications",
        "Interior customization"
      ]
    },
    {
      id: 4,
      title: "Car & Bike Repair",
      icon: "🔧",
      description: "Comprehensive repair services for all vehicle types with genuine parts and warranty.",
      features: [
        "Engine repair & overhaul",
        "Transmission services",
        "AC repair & service",
        "Electrical diagnostics",
        "Body repair & painting"
      ]
    },
    {
      id: 5,
      title: "Emergency Roadside Help",
      icon: "🚘",
      description: "Immediate assistance for accidents, mechanical failures, and emergency towing services.",
      features: [
        "Instant emergency response",
        "Accident support",
        "Emergency towing",
        "Lockout assistance",
        "Flat tire replacement"
      ]
    },
    {
      id: 6,
      title: "Vehicle Detailing",
      icon: "✨",
      description: "Professional cleaning, polishing, and detailing to make your vehicle look brand new.",
      features: [
        "Interior deep cleaning",
        "Exterior polishing & wax",
        "Paint protection coating",
        "Ceramic coating",
        "Odor removal treatment"
      ]
    },
    {
      id: 7,
      title: "Pre-Purchase Inspection",
      icon: "🔍",
      description: "Detailed inspection report before buying a used vehicle to ensure quality and safety.",
      features: [
        "Complete vehicle assessment",
        "Mechanical inspection",
        "Body & paint check",
        "Documentation verification",
        "Test drive evaluation"
      ]
    },
    {
      id: 8,
      title: "Tire & Wheel Services",
      icon: "⚪",
      description: "Complete tire solutions including replacement, alignment, balancing, and wheel care.",
      features: [
        "Tire replacement",
        "Wheel alignment",
        "Wheel balancing",
        "Puncture repair",
        "Tire rotation"
      ]
    }
  ];

  const selectedService = services.find(service => service.id === parseInt(serviceId));

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would typically send the form data to your backend
    console.log('Booking submitted:', { ...formData, serviceId });
    setSubmitted(true);
    setTimeout(() => {
      navigate('/services');
    }, 2000);
  };

  if (!selectedService) {
    return (
      <div className="book-service-container">
        <div className="error-message">
          <h2>Service Not Found</h2>
          <p>The service you're looking for doesn't exist.</p>
          <button className="btn-primary" onClick={() => navigate('/services')}>Back to Services</button>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="book-service-container">
        <div className="success-message">
          <div className="success-icon">✓</div>
          <h2>Booking Confirmed! 🎉</h2>
          <p>Thank you for booking {selectedService.title} with AUTOX. We've received your request and will contact you shortly.</p>
          <p className="confirmation-ref">Confirmation email sent to: {formData.email}</p>
          <button className="btn-primary" onClick={() => navigate('/services')}>Back to Services</button>
        </div>
      </div>
    );
  }

  return (
    <div className="book-service-container">
      <div className="book-service-wrapper">
        <div className="book-header">
          <h1>{selectedService.icon} {selectedService.title} - Book Service</h1>
          <p>{selectedService.description}</p>
        </div>

        <div className="service-features-section">
          <h3>What's Included:</h3>
          <ul className="features-list">
            {selectedService.features.map((feature, index) => (
              <li key={index}>
                <span className="check-icon">✓</span> {feature}
              </li>
            ))}
          </ul>
        </div>

        <form className="booking-form" onSubmit={handleSubmit}>
          <div className="form-section">
            <h3>Personal Information</h3>
            <div className="form-group">
              <label htmlFor="name">Full Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Your full name"
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="email">Email *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="your@email.com"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="phone">Phone Number *</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Your phone number"
                  required
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>Vehicle Information</h3>
            <div className="form-group">
              <label htmlFor="vehicle">Vehicle Details *</label>
              <input
                type="text"
                id="vehicle"
                name="vehicle"
                value={formData.vehicle}
                onChange={handleChange}
                placeholder="e.g., Honda Civic 2020, Maruti Swift 2022"
                required
              />
            </div>
          </div>

          <div className="form-section">
            <h3>Appointment Details</h3>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="preferredDate">Preferred Date *</label>
                <input
                  type="date"
                  id="preferredDate"
                  name="preferredDate"
                  value={formData.preferredDate}
                  onChange={handleChange}
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="preferredTime">Preferred Time *</label>
                <select
                  id="preferredTime"
                  name="preferredTime"
                  value={formData.preferredTime}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select a time slot</option>
                  <option value="09:00 AM">09:00 AM</option>
                  <option value="10:00 AM">10:00 AM</option>
                  <option value="11:00 AM">11:00 AM</option>
                  <option value="12:00 PM">12:00 PM</option>
                  <option value="02:00 PM">02:00 PM</option>
                  <option value="03:00 PM">03:00 PM</option>
                  <option value="04:00 PM">04:00 PM</option>
                  <option value="05:00 PM">05:00 PM</option>
                </select>
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>Additional Information</h3>
            <div className="form-group">
              <label htmlFor="message">Special Requirements (Optional)</label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Any specific requirements or concerns..."
                rows="5"
              ></textarea>
            </div>
          </div>

          <div className="booking-info-box">
            <p>📞 <strong>Need immediate assistance?</strong></p>
            <p>Call us at <a href="tel:9328764024">9328764024</a> or WhatsApp at <a href="https://wa.me/919328764024" target="_blank" rel="noreferrer">+91 9328764024</a></p>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => navigate('/services')}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
            >
              Confirm Booking
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ServiceBooking;
