import React, { useState } from 'react';
import './BookingWizard.css';

const BookingWizard = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [bookingData, setBookingData] = useState({
    // Step 1: Service Selection
    serviceId: '',
    serviceName: '',
    servicePrice: 0,
    
    // Step 2: Vehicle Details
    vehicleType: '',
    vehicleBrand: '',
    vehicleModel: '',
    vehicleNumber: '',
    vehicleYear: '',
    
    // Step 3: Date & Time
    bookingDate: '',
    bookingTime: '',
    preferredSlot: '',
    
    // Step 4: Payment Method
    paymentMethod: '',
    
    // Additional info
    specialInstructions: '',
  });

  const [errors, setErrors] = useState({});

  const steps = [
    { number: 1, title: 'Select Service', icon: '🔧' },
    { number: 2, title: 'Vehicle Details', icon: '🚗' },
    { number: 3, title: 'Date & Time', icon: '📅' },
    { number: 4, title: 'Payment Method', icon: '💳' },
    { number: 5, title: 'Confirmation', icon: '✓' },
  ];

  // Available services
  const services = [
    { id: 'oil-change', name: 'Oil Change', price: 1500, duration: '1 hour' },
    { id: 'brake-service', name: 'Brake Service', price: 2500, duration: '2 hours' },
    { id: 'engine-repair', name: 'Engine Repair', price: 5000, duration: '4 hours' },
    { id: 'tire-rotation', name: 'Tire Rotation', price: 1000, duration: '30 mins' },
    { id: 'ac-service', name: 'AC Service', price: 2000, duration: '1.5 hours' },
    { id: 'full-service', name: 'Full Service', price: 8000, duration: '1 day' },
  ];

  const vehicleTypes = ['Car', 'SUV', 'Bike', 'Truck', 'Van'];
  const timeSlots = [
    '09:00 AM - 11:00 AM',
    '11:00 AM - 01:00 PM',
    '01:00 PM - 03:00 PM',
    '03:00 PM - 05:00 PM',
    '05:00 PM - 07:00 PM',
  ];
  const paymentMethods = ['Cash', 'Credit Card', 'Debit Card', 'UPI', 'Net Banking'];

  const handleInputChange = (field, value) => {
    setBookingData(prev => ({
      ...prev,
      [field]: value,
    }));
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: '',
      }));
    }
  };

  const handleServiceSelect = (service) => {
    setBookingData(prev => ({
      ...prev,
      serviceId: service.id,
      serviceName: service.name,
      servicePrice: service.price,
    }));
    if (errors.serviceId) {
      setErrors(prev => ({ ...prev, serviceId: '' }));
    }
  };

  const validateStep = (step) => {
    const newErrors = {};

    switch (step) {
      case 1:
        if (!bookingData.serviceId) {
          newErrors.serviceId = 'Please select a service';
        }
        break;

      case 2:
        if (!bookingData.vehicleType) {
          newErrors.vehicleType = 'Vehicle type is required';
        }
        if (!bookingData.vehicleBrand) {
          newErrors.vehicleBrand = 'Vehicle brand is required';
        }
        if (!bookingData.vehicleModel) {
          newErrors.vehicleModel = 'Vehicle model is required';
        }
        if (!bookingData.vehicleNumber) {
          newErrors.vehicleNumber = 'Vehicle number is required';
        }
        break;

      case 3:
        if (!bookingData.bookingDate) {
          newErrors.bookingDate = 'Booking date is required';
        }
        if (!bookingData.preferredSlot) {
          newErrors.preferredSlot = 'Please select a time slot';
        }
        break;

      case 4:
        if (!bookingData.paymentMethod) {
          newErrors.paymentMethod = 'Please select a payment method';
        }
        break;

      default:
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 5));
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = () => {
    // Get existing bookings from localStorage
    const existingBookings = JSON.parse(localStorage.getItem('bookings') || '[]');
    
    // Create new booking with ID and timestamp
    const newBooking = {
      id: Date.now(),
      ...bookingData,
      status: 'Pending',
      createdAt: new Date().toISOString(),
      customerId: localStorage.getItem('currentUserId') || 'guest',
    };

    // Add to bookings array
    existingBookings.push(newBooking);
    
    // Save to localStorage
    localStorage.setItem('bookings', JSON.stringify(existingBookings));

    // Show success message
    alert('Booking confirmed successfully! Booking ID: ' + newBooking.id);

    // Reset form
    setBookingData({
      serviceId: '',
      serviceName: '',
      servicePrice: 0,
      vehicleType: '',
      vehicleBrand: '',
      vehicleModel: '',
      vehicleNumber: '',
      vehicleYear: '',
      bookingDate: '',
      bookingTime: '',
      preferredSlot: '',
      paymentMethod: '',
      specialInstructions: '',
    });
    setCurrentStep(1);
  };

  const getProgressPercentage = () => {
    return ((currentStep - 1) / (steps.length - 1)) * 100;
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="step-content">
            <h2>Select a Service</h2>
            <p className="step-description">Choose the service you need for your vehicle</p>
            
            <div className="services-grid">
              {services.map(service => (
                <div
                  key={service.id}
                  className={`service-card ${bookingData.serviceId === service.id ? 'selected' : ''}`}
                  onClick={() => handleServiceSelect(service)}
                >
                  <div className="service-icon">🔧</div>
                  <h3>{service.name}</h3>
                  <p className="service-price">₹{service.price}</p>
                  <p className="service-duration">{service.duration}</p>
                </div>
              ))}
            </div>
            {errors.serviceId && <span className="error">{errors.serviceId}</span>}
          </div>
        );

      case 2:
        return (
          <div className="step-content">
            <h2>Vehicle Details</h2>
            <p className="step-description">Enter your vehicle information</p>
            
            <div className="form-grid">
              <div className="form-group">
                <label>Vehicle Type *</label>
                <select
                  value={bookingData.vehicleType}
                  onChange={(e) => handleInputChange('vehicleType', e.target.value)}
                  className={errors.vehicleType ? 'error-input' : ''}
                >
                  <option value="">Select Type</option>
                  {vehicleTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
                {errors.vehicleType && <span className="error">{errors.vehicleType}</span>}
              </div>

              <div className="form-group">
                <label>Vehicle Brand *</label>
                <input
                  type="text"
                  value={bookingData.vehicleBrand}
                  onChange={(e) => handleInputChange('vehicleBrand', e.target.value)}
                  placeholder="e.g., Maruti, Honda"
                  className={errors.vehicleBrand ? 'error-input' : ''}
                />
                {errors.vehicleBrand && <span className="error">{errors.vehicleBrand}</span>}
              </div>

              <div className="form-group">
                <label>Vehicle Model *</label>
                <input
                  type="text"
                  value={bookingData.vehicleModel}
                  onChange={(e) => handleInputChange('vehicleModel', e.target.value)}
                  placeholder="e.g., Swift, City"
                  className={errors.vehicleModel ? 'error-input' : ''}
                />
                {errors.vehicleModel && <span className="error">{errors.vehicleModel}</span>}
              </div>

              <div className="form-group">
                <label>Vehicle Number *</label>
                <input
                  type="text"
                  value={bookingData.vehicleNumber}
                  onChange={(e) => handleInputChange('vehicleNumber', e.target.value.toUpperCase())}
                  placeholder="e.g., MH12AB1234"
                  className={errors.vehicleNumber ? 'error-input' : ''}
                />
                {errors.vehicleNumber && <span className="error">{errors.vehicleNumber}</span>}
              </div>

              <div className="form-group">
                <label>Manufacturing Year</label>
                <input
                  type="number"
                  value={bookingData.vehicleYear}
                  onChange={(e) => handleInputChange('vehicleYear', e.target.value)}
                  placeholder="e.g., 2020"
                  min="1990"
                  max={new Date().getFullYear() + 1}
                />
              </div>

              <div className="form-group full-width">
                <label>Special Instructions</label>
                <textarea
                  value={bookingData.specialInstructions}
                  onChange={(e) => handleInputChange('specialInstructions', e.target.value)}
                  placeholder="Any specific issues or requirements..."
                  rows="3"
                />
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="step-content">
            <h2>Select Date & Time</h2>
            <p className="step-description">Choose your preferred date and time slot</p>
            
            <div className="form-grid">
              <div className="form-group">
                <label>Booking Date *</label>
                <input
                  type="date"
                  value={bookingData.bookingDate}
                  onChange={(e) => handleInputChange('bookingDate', e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className={errors.bookingDate ? 'error-input' : ''}
                />
                {errors.bookingDate && <span className="error">{errors.bookingDate}</span>}
              </div>

              <div className="form-group full-width">
                <label>Preferred Time Slot *</label>
                <div className="time-slots-grid">
                  {timeSlots.map(slot => (
                    <div
                      key={slot}
                      className={`time-slot ${bookingData.preferredSlot === slot ? 'selected' : ''}`}
                      onClick={() => handleInputChange('preferredSlot', slot)}
                    >
                      {slot}
                    </div>
                  ))}
                </div>
                {errors.preferredSlot && <span className="error">{errors.preferredSlot}</span>}
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="step-content">
            <h2>Payment Method</h2>
            <p className="step-description">Select your preferred payment method</p>
            
            <div className="payment-methods">
              {paymentMethods.map(method => (
                <div
                  key={method}
                  className={`payment-card ${bookingData.paymentMethod === method ? 'selected' : ''}`}
                  onClick={() => handleInputChange('paymentMethod', method)}
                >
                  <div className="payment-icon">
                    {method === 'Cash' && '💵'}
                    {method === 'Credit Card' && '💳'}
                    {method === 'Debit Card' && '💳'}
                    {method === 'UPI' && '📱'}
                    {method === 'Net Banking' && '🏦'}
                  </div>
                  <span>{method}</span>
                </div>
              ))}
            </div>
            {errors.paymentMethod && <span className="error">{errors.paymentMethod}</span>}
          </div>
        );

      case 5:
        return (
          <div className="step-content">
            <h2>Confirm Your Booking</h2>
            <p className="step-description">Please review your booking details</p>
            
            <div className="confirmation-details">
              <div className="confirmation-section">
                <h3>🔧 Service Details</h3>
                <div className="detail-row">
                  <span>Service:</span>
                  <strong>{bookingData.serviceName}</strong>
                </div>
                <div className="detail-row">
                  <span>Price:</span>
                  <strong>₹{bookingData.servicePrice}</strong>
                </div>
              </div>

              <div className="confirmation-section">
                <h3>🚗 Vehicle Information</h3>
                <div className="detail-row">
                  <span>Type:</span>
                  <strong>{bookingData.vehicleType}</strong>
                </div>
                <div className="detail-row">
                  <span>Vehicle:</span>
                  <strong>{bookingData.vehicleBrand} {bookingData.vehicleModel}</strong>
                </div>
                <div className="detail-row">
                  <span>Number:</span>
                  <strong>{bookingData.vehicleNumber}</strong>
                </div>
                {bookingData.vehicleYear && (
                  <div className="detail-row">
                    <span>Year:</span>
                    <strong>{bookingData.vehicleYear}</strong>
                  </div>
                )}
              </div>

              <div className="confirmation-section">
                <h3>📅 Schedule</h3>
                <div className="detail-row">
                  <span>Date:</span>
                  <strong>{new Date(bookingData.bookingDate).toLocaleDateString('en-IN', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}</strong>
                </div>
                <div className="detail-row">
                  <span>Time Slot:</span>
                  <strong>{bookingData.preferredSlot}</strong>
                </div>
              </div>

              <div className="confirmation-section">
                <h3>💳 Payment</h3>
                <div className="detail-row">
                  <span>Method:</span>
                  <strong>{bookingData.paymentMethod}</strong>
                </div>
              </div>

              {bookingData.specialInstructions && (
                <div className="confirmation-section">
                  <h3>📝 Special Instructions</h3>
                  <p>{bookingData.specialInstructions}</p>
                </div>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="booking-wizard">
      <div className="wizard-container">
        <div className="wizard-header">
          <h1>Book Your Service</h1>
          <p>Complete the steps below to book your vehicle service</p>
        </div>

        {/* Progress Bar */}
        <div className="progress-bar-container">
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${getProgressPercentage()}%` }}
            />
          </div>
          <span className="progress-text">
            Step {currentStep} of {steps.length}
          </span>
        </div>

        {/* Stepper */}
        <div className="stepper">
          {steps.map((step, index) => (
            <div key={step.number} className="stepper-item">
              <div className={`stepper-step ${currentStep >= step.number ? 'active' : ''} ${currentStep > step.number ? 'completed' : ''}`}>
                <div className="step-number">
                  {currentStep > step.number ? '✓' : step.icon}
                </div>
                <div className="step-title">{step.title}</div>
              </div>
              {index < steps.length - 1 && (
                <div className={`stepper-line ${currentStep > step.number ? 'completed' : ''}`} />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className="wizard-content">
          {renderStepContent()}
        </div>

        {/* Navigation Buttons */}
        <div className="wizard-footer">
          <button
            className="btn btn-secondary"
            onClick={handleBack}
            disabled={currentStep === 1}
          >
            ← Back
          </button>

          {currentStep < 5 ? (
            <button
              className="btn btn-primary"
              onClick={handleNext}
            >
              Next →
            </button>
          ) : (
            <button
              className="btn btn-success"
              onClick={handleSubmit}
            >
              Confirm Booking ✓
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingWizard;
