import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from '../context/AuthContext';
import { useBookings } from '../context';
import { useNotifications } from '../context/NotificationContext';
import { servicesApi } from '../utils/apiService';
import PaymentGateway from './PaymentGateway';
import './BookService.css';

function ServiceBooking() {
  const { serviceId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { createBooking } = useBookings();
  const { addNotification } = useNotifications();
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
  const [selectedService, setSelectedService] = useState(null);
  const [serviceLoading, setServiceLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fallback hardcoded service list (matches services.jsx numeric IDs)
  const fallbackServices = [
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

  // Fetch service: try API first, fallback to hardcoded list, then generic service
  useEffect(() => {
    let active = true;
    const loadService = async () => {
      setServiceLoading(true);
      try {
        const res = await servicesApi.getById(serviceId);
        const svc = res?.data || res;
        if (svc && active) {
          setSelectedService({
            id: svc._id || svc.id,
            title: svc.title || svc.name || 'Service',
            icon: svc.icon || '🚗',
            price: svc.price ?? svc.basePrice ?? 0,
            gst: svc.gst ?? Math.round((svc.price ?? svc.basePrice ?? 0) * 0.18),
            description: svc.description || '',
            features: svc.features || [],
          });
          setServiceLoading(false);
          return;
        }
      } catch (err) {
        // API call failed, try hardcoded list
        console.warn(`Service API call failed for serviceId: ${serviceId}`, err);
      }

      // Fallback: match by numeric id in hardcoded list
      const numId = parseInt(serviceId, 10);
      const local = fallbackServices.find(s => s.id === numId);
      if (local && active) {
        setSelectedService(local);
        setServiceLoading(false);
        return;
      }

      // Last resort: create a generic service from the params
      if (active) {
        const genericService = {
          id: serviceId,
          title: 'Vehicle Service Booking',
          icon: '🚗',
          price: 2499,
          gst: 450,
          description: 'Professional vehicle service including inspection, maintenance, and repairs.',
          features: [
            'Professional technician service',
            'Quality workmanship',
            'Timely completion',
            'Customer satisfaction guaranteed'
          ]
        };
        setSelectedService(genericService);
        setServiceLoading(false);
      }
    };

    loadService();
    return () => { active = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serviceId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const nextErrors = {};
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneDigits = formData.phone.replace(/\D/g, '');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDate = formData.preferredDate ? new Date(`${formData.preferredDate}T00:00:00`) : null;

    if (!formData.name.trim()) {
      nextErrors.name = 'Full name is required';
    }

    if (!formData.email.trim()) {
      nextErrors.email = 'Email is required';
    } else if (!emailPattern.test(formData.email.trim())) {
      nextErrors.email = 'Enter a valid email address';
    }

    if (!formData.phone.trim()) {
      nextErrors.phone = 'Phone number is required';
    } else if (phoneDigits.length < 10 || phoneDigits.length > 15) {
      nextErrors.phone = 'Enter a valid phone number';
    }

    if (!formData.vehicle.trim()) {
      nextErrors.vehicle = 'Vehicle details are required';
    } else if (formData.vehicle.trim().length < 5) {
      nextErrors.vehicle = 'Enter complete vehicle details';
    }

    if (!formData.preferredDate) {
      nextErrors.preferredDate = 'Preferred date is required';
    } else if (selectedDate && selectedDate < today) {
      nextErrors.preferredDate = 'Choose today or a future date';
    }

    if (!formData.preferredTime) {
      nextErrors.preferredTime = 'Preferred time is required';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isSubmitting) return;

    if (!validateForm()) {
      addNotification({
        type: 'error',
        title: 'Validation Required',
        message: 'Please fix the highlighted fields before continuing.',
        icon: '⚠️',
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Create booking in backend FIRST with pending status
      // Keep serviceId as string if it's not numeric (could be MongoDB ObjectId)
      const parsedServiceId = isNaN(Number(serviceId)) ? serviceId : Number(serviceId);
      
      const bookingPayload = {
        userId: user?.id,
        serviceId: parsedServiceId,
        serviceName: selectedService.title,
        customerName: formData.name,
        email: formData.email,
        phone: formData.phone,
        vehicleNumber: formData.vehicle,
        date: formData.preferredDate,
        timeSlot: formData.preferredTime,
        notes: formData.message,
        amount: Number(selectedService.price + selectedService.gst),
        paymentMethod: 'Razorpay',
        paymentStatus: 'Pending',
        status: 'pending',
      };

      const createResult = await createBooking(bookingPayload);
      
      if (!createResult.success) {
        const bookingError = createResult.error || 'Unable to create booking';
        addNotification({
          type: 'error',
          title: 'Booking Failed',
          message: `Could not create booking: ${bookingError}`,
          icon: '❌',
        });
        alert(`Could not create booking: ${bookingError}`);
        return;
      }

      const createdBooking = createResult?.data || {};
      const resolvedBookingId = createdBooking?.id || createdBooking?._id || createdBooking?.bookingId || null;
      setBookingData({ ...createdBooking, id: resolvedBookingId });
      setShowPayment(true);
      
      // Add notification for booking initiation
      addNotification({
        type: 'booking',
        title: 'Booking Initiated',
        message: `${selectedService.title} booking created. Please complete payment.`,
        icon: '📋',
      });
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Booking Failed',
        message: error.message || 'Could not create booking',
        icon: '❌',
      });
      alert(error.message || 'Could not create booking');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePaymentComplete = async (paymentDetails) => {
    const resolvedBookingId = bookingData?.id || bookingData?._id || bookingData?.bookingId || null;

    try {
      // Payment is already verified and booking is updated on the backend
      // Just notify the user and redirect
      
      addNotification({
        type: 'payment',
        title: 'Payment Successful',
        message: `Payment of ₹${paymentDetails.amount} processed successfully`,
        icon: '💳',
      });
      
      addNotification({
        type: 'booking',
        title: 'Booking Confirmed',
        message: `Your ${selectedService.title} is scheduled for ${formData.preferredDate} at ${formData.preferredTime}`,
        icon: '✅',
      });

      setShowPayment(false);
      setSubmitted(true);

      // Redirect to payment success page
      setTimeout(() => {
        if (resolvedBookingId) {
          navigate(`/payment-success/${resolvedBookingId}`);
        } else {
          navigate('/services');
        }
      }, 1500);
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Error',
        message: error.message || 'Could not complete booking',
        icon: '❌',
      });
    }
  };

  if (serviceLoading) {
    return (
      <div className="book-service-container">
        <div className="error-message">
          <h2>Loading Service...</h2>
          <p>Please wait while we fetch service details.</p>
        </div>
      </div>
    );
  }

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

        <form className="booking-form" onSubmit={handleSubmit} noValidate>
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
                className={errors.name ? 'error' : ''}
                aria-invalid={Boolean(errors.name)}
                required
              />
              {errors.name && <span className="error-text">{errors.name}</span>}
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
                  className={errors.email ? 'error' : ''}
                  aria-invalid={Boolean(errors.email)}
                  required
                />
                {errors.email && <span className="error-text">{errors.email}</span>}
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
                  className={errors.phone ? 'error' : ''}
                  aria-invalid={Boolean(errors.phone)}
                  required
                />
                {errors.phone && <span className="error-text">{errors.phone}</span>}
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
                className={errors.vehicle ? 'error' : ''}
                aria-invalid={Boolean(errors.vehicle)}
                required
              />
              {errors.vehicle && <span className="error-text">{errors.vehicle}</span>}
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
                  className={errors.preferredDate ? 'error' : ''}
                  aria-invalid={Boolean(errors.preferredDate)}
                  required
                />
                {errors.preferredDate && <span className="error-text">{errors.preferredDate}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="preferredTime">Preferred Time *</label>
                <select
                  id="preferredTime"
                  name="preferredTime"
                  value={formData.preferredTime}
                  onChange={handleChange}
                  className={errors.preferredTime ? 'error' : ''}
                  aria-invalid={Boolean(errors.preferredTime)}
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
                {errors.preferredTime && <span className="error-text">{errors.preferredTime}</span>}
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
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Processing...' : 'Proceed to Payment'}
            </button>
          </div>
        </form>
      </div>

      {/* Payment Gateway Modal */}
      <PaymentGateway 
        amount={selectedService.price + selectedService.gst}
        serviceName={selectedService.title}
        isOpen={showPayment}
        bookingId={bookingData?.id}
        onPaymentComplete={handlePaymentComplete}
        onCancel={() => setShowPayment(false)}
      />
    </div>
  );
}

export default ServiceBooking;
