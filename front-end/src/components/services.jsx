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
  const assetPath = (path) => encodeURI(path);

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
      image: assetPath('/img/web-images/regular-services/pexels-19x14-8478233.jpg')
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
      image: assetPath('/img/web-images/breakdown/pexels-edurawpro-21831855.jpg')
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
      image: assetPath('/img/web-images/modification/pexels-bylukemiller-32725702.jpg')
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
      image: assetPath('/img/web-images/regular-services/pexels-tami-19499386.jpg')
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
      image: assetPath('/img/web-images/breakdown/pexels-a-q-91521018-18863497.jpg')
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
      image: assetPath('/img/web-images/regular-services/pexels-artempodrez-8986139.jpg')
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
      image: assetPath('/img/web-images/breakdown/pexels-jonathan-reynaga-861774-17429096.jpg')
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
      image: assetPath('/img/web-images/breakdown/pexels-mikebirdy-943930.jpg')
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
    // Navigate to the booking page with the service ID
    navigate(`/book-service/${service.id}`);
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
    </div>
  );
}

export default Services;