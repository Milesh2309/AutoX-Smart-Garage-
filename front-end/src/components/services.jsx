import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import './services.css';
import { useAuth } from "../context/AuthContext";

function Services() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const [activeService, setActiveService] = useState(null);
  const [ctaNotice, setCtaNotice] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [bookingData, setBookingData] = useState({
    name: '',
    email: '',
    phone: '',
    date: '',
    time: '',
    vehicle: '',
    message: ''
  });

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
      ],
      image: "/img/web images/regular services/pexels-19x14-8478233.jpg"
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
      ],
      image: "/img/web images/break dwon/pexels-edurawpro-21831855.jpg"
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
      ],
      image: "/img/web images/modificasoin/pexels-bylukemiller-32725702.jpg"
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
      ],
      image: "/img/web images/regular services/pexels-tami-19499386.jpg"
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
      ],
      image: "/img/web images/break dwon/pexels-a-q-91521018-18863497.jpg"
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
      ],
      image: "/img/web images/regular services/pexels-artempodrez-8986139.jpg"
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
      ],
      image: "/img/web images/break dwon/pexels-jonathan-reynaga-861774-17429096.jpg"
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
      ],
      image: "/img/web images/break dwon/pexels-mikebirdy-943930.jpg"
    }
  ];

  const handleServiceClick = (id) => {
    setActiveService(activeService === id ? null : id);
  };

  const handleBookNow = (service) => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: location.pathname, action: 'book', service: service.title } });
      return;
    }
    setSelectedService(service);
    setShowBookingModal(true);
  };

  const handleBookingChange = (field, value) => {
    setBookingData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleBookingSubmit = (e) => {
    e.preventDefault();
    alert(`Booking confirmed for ${selectedService.title}!\nName: ${bookingData.name}\nPhone: ${bookingData.phone}\nDate: ${bookingData.date}\nTime: ${bookingData.time}\n\nWe will contact you shortly to confirm your booking.`);
    setShowBookingModal(false);
    setBookingData({
      name: '',
      email: '',
      phone: '',
      date: '',
      time: '',
      vehicle: '',
      message: ''
    });
  };

  const handleLearnMore = (service) => {
    setCtaNotice({ type: 'info', service: service.title });
  };

  return (
    <div className="services-page">
      <div className="services-container">
        <div className="services-header">
          <h1>Our Services</h1>
          <p>Comprehensive automotive solutions for all your vehicle needs</p>
        </div>

        <div className="services-grid">
        {services.map((service) => (
          <div
            key={service.id}
            className={`service-card ${activeService === service.id ? 'active' : ''}`}
            onClick={() => handleServiceClick(service.id)}
          >
            <div className="service-image">
              <img src={service.image} alt={service.title} />
              <div className="service-overlay"></div>
            </div>
            <div className="service-content">
              <h3>{service.title}</h3>
              <p className="service-description">{service.description}</p>
              
              {activeService === service.id && (
                <div className="service-features">
                  <h4>What's Included:</h4>
                  <ul>
                    {service.features.map((feature, index) => (
                      <li key={index}>
                        <span className="check-icon">✓</span> {feature}
                      </li>
                    ))}
                  </ul>
                  <div className="service-actions">
                    <button
                      type="button"
                      className="btn-primary"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleBookNow(service);
                      }}
                    >
                      Book Now
                    </button>
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleLearnMore(service);
                      }}
                    >
                      Learn More
                    </button>
                  </div>
                  {ctaNotice?.service === service.title && (
                    <div className="cta-note">
                      {ctaNotice.type === 'book'
                        ? (
                          <>
                            We are opening your dialer to call 9328764024. If it does not start, please call us directly.
                            <div className="cta-links">
                              <a href="tel:9328764024">Call</a>
                              <a href="https://wa.me/919328764024?text=Hi%2C%20I%20want%20to%20book%20this%20service" target="_blank" rel="noreferrer">WhatsApp</a>
                            </div>
                          </>
                        )
                        : (
                          <>
                            We will share more details. Call 9328764024 or ping on WhatsApp.
                            <div className="cta-links">
                              <a href="tel:9328764024">Call</a>
                              <a href="https://wa.me/919328764024?text=Hi%2C%20tell%20me%20more%20about%20this%20service" target="_blank" rel="noreferrer">WhatsApp</a>
                            </div>
                          </>
                        )}
                    </div>
                  )}
                </div>
              )}
              
              {activeService !== service.id && (
                <button className="btn-expand">View Details →</button>
              )}
            </div>
          </div>
        ))}
        </div>

        <div className="services-cta">
          <h2>Need Help Choosing a Service?</h2>
          <p>Our experts are here to assist you with the right solution</p>
          <button
            className="btn-contact"
            onClick={() => navigate('/contact')}
          >
            Contact Us
          </button>
        </div>
      </div>

      {/* Booking Modal */}
      {showBookingModal && selectedService && (
        <div className="booking-modal-overlay" onClick={() => setShowBookingModal(false)}>
          <div className="booking-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setShowBookingModal(false)}>✕</button>
            
            <div className="booking-modal-header">
              <div className="booking-service-icon">{selectedService.icon}</div>
              <h2>Book {selectedService.title}</h2>
              <p>Fill in the details below to schedule your service</p>
            </div>

            <form className="booking-form" onSubmit={handleBookingSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="booking-name">Full Name *</label>
                  <input
                    type="text"
                    id="booking-name"
                    placeholder="Enter your full name"
                    value={bookingData.name}
                    onChange={(e) => handleBookingChange('name', e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="booking-phone">Phone Number *</label>
                  <input
                    type="tel"
                    id="booking-phone"
                    placeholder="Enter your phone number"
                    value={bookingData.phone}
                    onChange={(e) => handleBookingChange('phone', e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="booking-email">Email Address</label>
                <input
                  type="email"
                  id="booking-email"
                  placeholder="Enter your email address"
                  value={bookingData.email}
                  onChange={(e) => handleBookingChange('email', e.target.value)}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="booking-date">Preferred Date *</label>
                  <input
                    type="date"
                    id="booking-date"
                    min={new Date().toISOString().split('T')[0]}
                    value={bookingData.date}
                    onChange={(e) => handleBookingChange('date', e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="booking-time">Preferred Time *</label>
                  <select
                    id="booking-time"
                    value={bookingData.time}
                    onChange={(e) => handleBookingChange('time', e.target.value)}
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

              <div className="form-group">
                <label htmlFor="booking-vehicle">Vehicle Details *</label>
                <input
                  type="text"
                  id="booking-vehicle"
                  placeholder="e.g., Honda Civic 2020, Maruti Swift 2022"
                  value={bookingData.vehicle}
                  onChange={(e) => handleBookingChange('vehicle', e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="booking-message">Additional Notes (Optional)</label>
                <textarea
                  id="booking-message"
                  rows="4"
                  placeholder="Any specific requirements or concerns..."
                  value={bookingData.message}
                  onChange={(e) => handleBookingChange('message', e.target.value)}
                ></textarea>
              </div>

              <div className="booking-info-box">
                <p>📞 <strong>Need immediate assistance?</strong></p>
                <p>Call us at <a href="tel:9328764024">9328764024</a> or WhatsApp at <a href="https://wa.me/919328764024" target="_blank" rel="noreferrer">+91 9328764024</a></p>
              </div>

              <div className="booking-modal-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowBookingModal(false)}
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
      )}
    </div>
  );
}

export default Services;