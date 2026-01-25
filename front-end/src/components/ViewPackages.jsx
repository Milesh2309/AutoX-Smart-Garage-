import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import './ViewPackages.css';

function ViewPackages() {
  const navigate = useNavigate();
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);

  const packages = [
    {
      id: 'basic',
      name: 'Basic Care',
      icon: '🚗',
      price: 999,
      description: 'Perfect for routine maintenance',
      features: [
        'Quick health check',
        'Engine oil top-up',
        'Exterior wash',
        'Fluid level check',
        'Tire pressure adjustment',
        'Basic warranty: 3 months'
      ],
      cta: 'Choose Basic',
      popular: false,
      duration: 'per service'
    },
    {
      id: 'standard',
      name: 'Standard Service',
      icon: '⚙️',
      price: 2499,
      description: 'Most popular choice for vehicle health',
      features: [
        'Full periodic service',
        'Oil & filter change',
        'Brake inspection',
        'Battery health check',
        'Free pickup & drop',
        '6-month support & follow-up',
        'Standard warranty: 6 months'
      ],
      cta: 'Choose Standard',
      popular: true,
      duration: 'per service'
    },
    {
      id: 'premium',
      name: 'Premium Plus',
      icon: '⭐',
      price: 5999,
      description: 'Complete care with priority support',
      features: [
        'Full service + detailing',
        'Complete engine checkup',
        'Suspension inspection',
        'Electrical diagnostics',
        'Priority roadside help 24/7',
        'Free pickup & drop',
        '1-year support & maintenance',
        'Premium warranty: 1 year',
        'Free AC service included'
      ],
      cta: 'Choose Premium',
      popular: false,
      duration: 'per service'
    },
    {
      id: 'annual',
      name: 'Annual Membership',
      icon: '🎯',
      price: 8999,
      description: 'Unlimited benefits for a year',
      features: [
        'Unlimited oil changes',
        'Quarterly full service',
        'Priority appointments',
        '24/7 roadside assistance',
        'Free parts & labor',
        'Extended warranty coverage',
        'Exclusive member benefits',
        'VIP customer support',
        'Free detailing service'
      ],
      cta: 'Subscribe Now',
      popular: false,
      duration: 'per year'
    }
  ];

  const handleSelectPackage = (pkg) => {
    setSelectedPackage(pkg);
    setShowPurchaseModal(true);
  };

  const handlePurchase = () => {
    alert(`✓ Package "${selectedPackage.name}" added to cart! Proceeding to checkout...`);
    setShowPurchaseModal(false);
    navigate('/');
  };

  return (
    <div className="view-packages-container">
      <div className="packages-hero">
        <h1>🚗 Smart Garage Services - Service Packages</h1>
        <p>Full vehicle diagnostics, maintenance, and scheduled servicing by certified technicians.</p>
        <p className="sub-text">Choose the perfect plan for your vehicle's maintenance needs</p>
      </div>

      <div className="packages-content">
        <div className="packages-grid">
          {packages.map((pkg) => (
            <div key={pkg.id} className={`package-card ${pkg.popular ? 'popular' : ''}`}>
              {pkg.popular && <div className="popular-badge">Most Popular</div>}
              
              <div className="package-header">
                <div className="package-icon">{pkg.icon}</div>
                <h3 className="package-name">{pkg.name}</h3>
                <p className="package-desc">{pkg.description}</p>
              </div>

              <div className="package-price">
                <span className="currency">₹</span>
                <span className="amount">{pkg.price}</span>
                <span className="period">/{pkg.duration}</span>
              </div>

              <ul className="features-list">
                {pkg.features.map((feature, idx) => (
                  <li key={idx} className="feature-item">
                    <span className="checkmark">✓</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <button 
                className={`cta-button ${pkg.popular ? 'primary' : 'secondary'}`}
                onClick={() => handleSelectPackage(pkg)}
              >
                {pkg.cta}
              </button>
            </div>
          ))}
        </div>

        <div className="comparison-section">
          <h2>Why Choose Our Packages?</h2>
          <div className="benefits-grid">
            <div className="benefit-card">
              <div className="benefit-icon">🏆</div>
              <h4>Certified Technicians</h4>
              <p>Expert mechanics with industry certifications and years of experience</p>
            </div>
            <div className="benefit-card">
              <div className="benefit-icon">🔧</div>
              <h4>Complete Diagnostics</h4>
              <p>Advanced tools for accurate vehicle health assessment</p>
            </div>
            <div className="benefit-card">
              <div className="benefit-icon">⚡</div>
              <h4>Quick Service</h4>
              <p>Fast turnaround without compromising quality</p>
            </div>
            <div className="benefit-card">
              <div className="benefit-icon">📞</div>
              <h4>24/7 Support</h4>
              <p>Round-the-clock roadside assistance and customer support</p>
            </div>
            <div className="benefit-card">
              <div className="benefit-icon">💯</div>
              <h4>Warranty Covered</h4>
              <p>All services and parts are covered under warranty</p>
            </div>
            <div className="benefit-card">
              <div className="benefit-icon">🚗</div>
              <h4>Free Pickup & Drop</h4>
              <p>Convenient service - we come to you</p>
            </div>
          </div>
        </div>

        <div className="faq-section">
          <h2>Frequently Asked Questions</h2>
          <div className="faq-items">
            <div className="faq-item">
              <h4>Can I upgrade my package anytime?</h4>
              <p>Yes! You can upgrade to a higher tier package at any time. We'll credit your current plan and charge only the difference.</p>
            </div>
            <div className="faq-item">
              <h4>Is pickup and drop-off free?</h4>
              <p>Free pickup and drop-off is included in Standard and Premium packages. For Basic Care, it's available for an additional ₹200.</p>
            </div>
            <div className="faq-item">
              <h4>How do I book an appointment?</h4>
              <p>After selecting a package, you can book directly through our app or call our support team at 9328764024.</p>
            </div>
            <div className="faq-item">
              <h4>What warranty do packages include?</h4>
              <p>Each package includes a warranty period on parts and labor. Extended warranty options are also available.</p>
            </div>
            <div className="faq-item">
              <h4>Can I get a refund?</h4>
              <p>Refunds are available within 7 days of purchase if you haven't used the service. Post-service modifications require manager approval.</p>
            </div>
            <div className="faq-item">
              <h4>Do you service all vehicle types?</h4>
              <p>Yes! We service cars, bikes, SUVs, and commercial vehicles. Our technicians are trained for all makes and models.</p>
            </div>
          </div>
        </div>
      </div>

      {showPurchaseModal && selectedPackage && (
        <div className="purchase-modal" role="dialog" aria-modal="true">
          <div className="modal-backdrop" onClick={() => setShowPurchaseModal(false)} />
          <div className="modal-content">
            <div className="modal-header">
              <h2>Confirm Purchase</h2>
              <button 
                className="modal-close" 
                onClick={() => setShowPurchaseModal(false)}
                aria-label="Close"
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              <div className="package-summary">
                <h3>{selectedPackage.icon} {selectedPackage.name}</h3>
                <div className="summary-price">
                  <span className="currency">₹</span>
                  <span className="amount">{selectedPackage.price}</span>
                  <span className="period">/{selectedPackage.duration}</span>
                </div>
                <p className="summary-desc">{selectedPackage.description}</p>
              </div>
              <div className="terms-check">
                <input type="checkbox" id="terms" defaultChecked />
                <label htmlFor="terms">I agree to the terms and conditions</label>
              </div>
            </div>
            <div className="modal-actions">
              <button 
                className="btn-secondary" 
                onClick={() => setShowPurchaseModal(false)}
              >
                Cancel
              </button>
              <button 
                className="btn-primary" 
                onClick={handlePurchase}
              >
                Proceed to Checkout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ViewPackages;
