import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from '../context/AuthContext';
import PaymentGateway from './PaymentGateway';
import './BookService.css';

function ServiceBooking() {
  const { serviceId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    vehicle: '',
    preferredDate: '',
    preferredTime: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [bookingData, setBookingData] = useState(null);

  // Service list matching the one in services.jsx
  const services = [
    {
      id: 1,
      title: "Smart Garage Services",
      icon: "🚗",
      price: 2499,
      gst: 450,
      description: "Complete vehicle diagnostics, maintenance, and scheduled servicing by certified technicians.",
      features: [
        "Multi-point vehicle inspection report",
        "Engine oil change & filter replacement",
        "Brake pads, discs & fluid check",
        "Battery health & charging system check",
        "Wheel alignment & tire rotation",
        "Fluid top-up (coolant, brake, washer)",
        "Exterior wash & basic interior vacuum"
      ]
    },
    {
      id: 2,
      title: "Vehicle Breakdown Assistance",
      icon: "🛠",
      price: 1999,
      gst: 360,
      description: "24/7 roadside support for breakdowns, tire changes, fuel delivery, and quick fixes.",
      features: [
        "24/7 emergency helpline",
        "On-spot minor repairs",
        "Flat tire change & puncture assistance",
        "Battery jump-start",
        "Fuel delivery up to 5L",
        "Towing assistance (up to 10 km)"
      ]
    },
    {
      id: 3,
      title: "Vehicle Modification",
      icon: "⚙",
      price: 4999,
      gst: 900,
      description: "Expert custom modifications, upgrades, and tuning to enhance performance and aesthetics.",
      features: [
        "Performance tuning & ECU remap",
        "Custom body kits & wrap options",
        "Exhaust upgrades",
        "Suspension & brake upgrades",
        "Lighting upgrades (LED/Projector)",
        "Alloy wheels & tire fitment",
        "Interior customization"
      ]
    },
    {
      id: 4,
      title: "Car & Bike Repair",
      icon: "🔧",
      price: 3499,
      gst: 629,
      description: "Comprehensive repair services for all vehicle types with genuine parts and warranty.",
      features: [
        "Engine diagnostics & repair",
        "Transmission & clutch services",
        "Brake & suspension repair",
        "AC repair & gas refill",
        "Electrical & wiring diagnostics",
        "Body repair & painting"
      ]
    },
    {
      id: 5,
      title: "Emergency Roadside Help",
      icon: "🚘",
      price: 1499,
      gst: 270,
      description: "Immediate assistance for accidents, mechanical failures, and emergency towing services.",
      features: [
        "Instant emergency response",
        "Accident support & coordination",
        "Emergency towing",
        "Lockout assistance",
        "Battery jump-start",
        "Flat tire replacement"
      ]
    },
    {
      id: 6,
      title: "Vehicle Detailing",
      icon: "✨",
      price: 1999,
      gst: 360,
      description: "Professional cleaning, polishing, and detailing to make your vehicle look brand new.",
      features: [
        "Interior deep cleaning & shampoo",
        "Exterior wash, polish & wax",
        "Paint protection coating",
        "Ceramic coating",
        "Odor removal treatment",
        "Glass & trim restoration"
      ]
    },
    {
      id: 7,
      title: "Pre-Purchase Inspection",
      icon: "🔍",
      price: 2999,
      gst: 540,
      description: "Detailed inspection report before buying a used vehicle to ensure quality and safety.",
      features: [
        "Complete vehicle assessment",
        "Mechanical & electrical inspection",
        "Body & paint check",
        "OBD diagnostics scan",
        "Test drive evaluation",
        "Inspection report with recommendations"
      ]
    },
    {
      id: 8,
      title: "Tire & Wheel Services",
      icon: "⚪",
      price: 1799,
      gst: 324,
      description: "Complete tire solutions including replacement, alignment, balancing, and wheel care.",
      features: [
        "Tire replacement & fitment",
        "Wheel alignment",
        "Wheel balancing",
        "Puncture repair",
        "Tire rotation",
        "Alloy wheel care & cleaning"
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
    
    // Create booking object
    const booking = {
      id: Date.now(),
      customer: formData.name,
      email: formData.email,
      phone: formData.phone,
      service: selectedService.title,
      vehicleNumber: formData.vehicle,
      date: formData.preferredDate,
      time: formData.preferredTime,
      message: formData.message,
      status: 'Pending Payment',
      amount: String(selectedService.price + selectedService.gst),
      servicePrice: selectedService.price,
      gst: selectedService.gst,
      serviceId: parseInt(serviceId),
      createdAt: new Date().toISOString()
    };

    setBookingData(booking);
    setShowPayment(true);
  };

  const handlePaymentComplete = (paymentDetails) => {
    if (bookingData) {
      // Update booking status
      const updatedBooking = {
        ...bookingData,
        status: 'Confirmed',
        paymentMethod: paymentDetails.method,
        paymentDate: new Date().toISOString(),
        transactionId: `TXN${Math.random().toString(36).substr(2, 9).toUpperCase()}`
      };

      // Get existing bookings from localStorage
      const existingBookings = JSON.parse(localStorage.getItem('bookings') || '[]');
      
      // Add new booking
      existingBookings.push(updatedBooking);
      
      // Save to localStorage
      localStorage.setItem('bookings', JSON.stringify(existingBookings));
      
      console.log('Booking confirmed with payment:', updatedBooking);
      setShowPayment(false);
      setSubmitted(true);
      setTimeout(() => {
        navigate('/services');
      }, 3000);
    }
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
          <p>Thank you for booking {selectedService.title} with AUTOX. Payment of ₹{(selectedService.price + selectedService.gst).toLocaleString()} has been processed successfully.</p>
          <p className="confirmation-ref">Confirmation email sent to: {formData.email}</p>
          <p className="confirmation-ref">Your booking has been confirmed and our team will contact you shortly to finalize details.</p>
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

          <div className="price-summary-section">
            <h3>Payment Summary</h3>
            <div className="price-summary">
              <div className="summary-row">
                <span>Service Charge:</span>
                <span>₹{selectedService.price.toLocaleString()}</span>
              </div>
              <div className="summary-row">
                <span>GST (18%):</span>
                <span>₹{selectedService.gst.toLocaleString()}</span>
              </div>
              <div className="summary-row total">
                <span>Total Amount:</span>
                <span>₹{(selectedService.price + selectedService.gst).toLocaleString()}</span>
              </div>
            </div>
            <p className="payment-note">Payment will be processed securely in the next step</p>
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
              Proceed to Payment
            </button>
          </div>
        </form>
      </div>

      {/* Payment Gateway Modal */}
      <PaymentGateway 
        amount={selectedService.price + selectedService.gst}
        serviceName={selectedService.title}
        isOpen={showPayment}
        onPaymentComplete={handlePaymentComplete}
        onCancel={() => setShowPayment(false)}
      />
    </div>
  );
}

export default ServiceBooking;
