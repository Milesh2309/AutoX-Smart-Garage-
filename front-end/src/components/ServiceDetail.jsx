import React from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import './ServiceDetail.css';

function ServiceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  const servicesData = [
    {
      id: 1,
      title: "Smart Garage Services",
      icon: "🚗",
      description: "Complete vehicle diagnostics, maintenance, and scheduled servicing by certified technicians.",
      fullDescription: "Our Smart Garage Services provide comprehensive automotive care with state-of-the-art diagnostic equipment. Our certified technicians perform thorough inspections and maintenance to keep your vehicle running smoothly.",
      features: [
        "Full vehicle inspection",
        "Oil change & filter replacement",
        "Brake system check",
        "Battery health check",
        "Tire rotation & alignment"
      ],
      benefits: [
        "Extend your vehicle's lifespan",
        "Improve fuel efficiency",
        "Enhanced safety and reliability",
        "Prevent costly repairs",
        "Maintain warranty compliance"
      ],
      pricing: "Starting from ₹2,500",
      image: "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=600&h=400&fit=crop"
    },
    {
      id: 2,
      title: "Vehicle Breakdown Assistance",
      icon: "🛠",
      description: "24/7 roadside support for breakdowns, tire changes, fuel delivery, and quick fixes.",
      fullDescription: "Available round the clock, our breakdown assistance team ensures you're never stranded. We provide immediate roadside support for mechanical failures, tire issues, fuel emergencies, and more.",
      features: [
        "24/7 Emergency support",
        "On-spot tire change",
        "Battery jump-start",
        "Fuel delivery service",
        "Towing assistance"
      ],
      benefits: [
        "Peace of mind on every journey",
        "Fast response time",
        "Professional technicians",
        "Transparent pricing",
        "Available everywhere"
      ],
      pricing: "From ₹499/incident",
      image: "https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=600&h=400&fit=crop"
    },
    {
      id: 3,
      title: "Vehicle Modification",
      icon: "⚙",
      description: "Expert custom modifications, upgrades, and tuning to enhance performance and aesthetics.",
      fullDescription: "Transform your vehicle with our expert modification services. From performance tuning to aesthetic upgrades, we customize your car to match your style and performance needs.",
      features: [
        "Performance tuning",
        "Custom body kits",
        "Exhaust upgrades",
        "Lighting modifications",
        "Interior customization"
      ],
      benefits: [
        "Personalized vehicle upgrades",
        "Enhanced performance",
        "Premium aesthetics",
        "Professional installation",
        "Quality guarantees"
      ],
      pricing: "Custom quotes available",
      image: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=600&h=400&fit=crop"
    },
    {
      id: 4,
      title: "Car & Bike Repair",
      icon: "🔧",
      description: "Comprehensive repair services for all vehicle types with genuine parts and warranty.",
      fullDescription: "Our experienced technicians handle all types of repairs using genuine parts and modern tools. From routine repairs to major overhauls, we ensure quality and reliability.",
      features: [
        "Engine repair & overhaul",
        "Transmission services",
        "AC repair & service",
        "Electrical diagnostics",
        "Body repair & painting"
      ],
      benefits: [
        "Genuine parts guarantee",
        "Expert diagnosis",
        "Warranty on repairs",
        "Quick turnaround",
        "Competitive pricing"
      ],
      pricing: "From ₹3,000",
      image: "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=600&h=400&fit=crop"
    },
    {
      id: 5,
      title: "Emergency Roadside Help",
      icon: "🚘",
      description: "Immediate assistance for accidents, mechanical failures, and emergency towing services.",
      fullDescription: "Our emergency team is trained to handle critical situations. We provide immediate response for accidents, mechanical breakdowns, and emergency towing anywhere.",
      features: [
        "Instant emergency response",
        "Accident support",
        "Emergency towing",
        "Lockout assistance",
        "Flat tire replacement"
      ],
      benefits: [
        "24/7 availability",
        "Professional assistance",
        "Rapid response",
        "Coordination with hospitals/police",
        "Comprehensive coverage"
      ],
      pricing: "From ₹999/incident",
      image: "https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=600&h=400&fit=crop"
    },
    {
      id: 6,
      title: "Vehicle Detailing",
      icon: "✨",
      description: "Professional cleaning, polishing, and detailing to make your vehicle look brand new.",
      fullDescription: "Revitalize your vehicle's appearance with our professional detailing services. We use premium products and techniques to restore shine and protect your vehicle.",
      features: [
        "Interior deep cleaning",
        "Exterior polishing & wax",
        "Paint protection coating",
        "Ceramic coating",
        "Odor removal treatment"
      ],
      benefits: [
        "Enhanced vehicle appearance",
        "Long-lasting protection",
        "Increased resale value",
        "Premium finish",
        "UV protection"
      ],
      pricing: "From ₹5,000",
      image: "https://images.unsplash.com/photo-1601362840469-51e4d8d58785?w=600&h=400&fit=crop"
    },
    {
      id: 7,
      title: "Pre-Purchase Inspection",
      icon: "🔍",
      description: "Detailed inspection report before buying a used vehicle to ensure quality and safety.",
      fullDescription: "Before making a big purchase, get a comprehensive inspection. Our detailed reports help you make informed decisions when buying used vehicles.",
      features: [
        "Complete vehicle assessment",
        "Mechanical inspection",
        "Body & paint check",
        "Documentation verification",
        "Test drive evaluation"
      ],
      benefits: [
        "Avoid hidden problems",
        "Negotiate better prices",
        "Insurance-friendly reports",
        "Expert evaluation",
        "Peace of mind"
      ],
      pricing: "₹2,000 per inspection",
      image: "https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=600&h=400&fit=crop"
    },
    {
      id: 8,
      title: "Tire & Wheel Services",
      icon: "⚪",
      description: "Complete tire solutions including replacement, alignment, balancing, and wheel care.",
      fullDescription: "Keep your wheels in perfect condition with our comprehensive tire and wheel services. From replacements to alignment, we handle all your tire needs.",
      features: [
        "Tire replacement",
        "Wheel alignment",
        "Wheel balancing",
        "Puncture repair",
        "Tire rotation"
      ],
      benefits: [
        "Better fuel efficiency",
        "Improved safety",
        "Extended tire life",
        "Smooth driving experience",
        "Genuine products"
      ],
      pricing: "From ₹1,500",
      image: "https://images.unsplash.com/photo-1629897048514-3dd7414fe72a?w=600&h=400&fit=crop"
    }
  ];

  const service = servicesData.find(s => s.id === parseInt(id));

  if (!service) {
    return (
      <div className="service-detail-page">
        <div className="service-not-found">
          <h2>Service not found</h2>
          <button onClick={() => navigate('/services')}>Back to Services</button>
        </div>
      </div>
    );
  }

  const handleBookNow = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: location.pathname, action: 'book', service: service.title } });
      return;
    }
    navigate('/book-service', { state: { service: service.title } });
  };

  return (
    <div className="service-detail-page">
      <div className="service-detail-container">
        {/* Header with back button */}
        <div className="detail-header">
          <button className="back-button" onClick={() => navigate('/services')}>
            ← Back to Services
          </button>
        </div>

        {/* Hero section */}
        <div className="detail-hero">
          <img src={service.image} alt={service.title} className="detail-hero-image" />
          <div className="detail-hero-overlay">
            <h1>{service.title}</h1>
            <p className="detail-subtitle">{service.description}</p>
          </div>
        </div>

        {/* Main content */}
        <div className="detail-content">
          <div className="detail-main">
            {/* Overview section */}
            <section className="detail-section">
              <h2>Overview</h2>
              <p>{service.fullDescription}</p>
            </section>

            {/* Features section */}
            <section className="detail-section">
              <h2>What's Included</h2>
              <div className="features-grid">
                {service.features.map((feature, index) => (
                  <div key={index} className="feature-item">
                    <span className="feature-icon">✓</span>
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Benefits section */}
            <section className="detail-section">
              <h2>Benefits</h2>
              <div className="benefits-list">
                {service.benefits.map((benefit, index) => (
                  <div key={index} className="benefit-item">
                    <span className="benefit-icon">★</span>
                    <span>{benefit}</span>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <aside className="detail-sidebar">
            <div className="sidebar-card">
              <h3>Service Pricing</h3>
              <p className="pricing-text">{service.pricing}</p>
              <button className="btn-book-now" onClick={handleBookNow}>
                Book This Service
              </button>
            </div>

            <div className="sidebar-card contact-card">
              <h3>Need More Information?</h3>
              <p>Contact our experts for personalized assistance</p>
              <div className="contact-buttons">
                <a href="tel:9328764024" className="btn-contact-call">
                  📞 Call Us
                </a>
                <a href="https://wa.me/919328764024?text=Hi%2C%20tell%20me%20more%20about%20this%20service" target="_blank" rel="noreferrer" className="btn-contact-whatsapp">
                  💬 WhatsApp
                </a>
              </div>
            </div>

            <div className="sidebar-card faq-card">
              <h3>Why Choose Us?</h3>
              <ul className="why-list">
                <li>Certified technicians</li>
                <li>Genuine parts</li>
                <li>Warranty coverage</li>
                <li>Transparent pricing</li>
                <li>24/7 support</li>
              </ul>
            </div>
          </aside>
        </div>

        {/* CTA section */}
        <div className="detail-cta">
          <h2>Ready to Get Started?</h2>
          <p>Book your service today and experience quality automotive care</p>
          <button className="btn-primary-large" onClick={handleBookNow}>
            Book {service.title}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ServiceDetail;
