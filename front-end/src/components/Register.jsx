import React, { useCallback, useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import './auth.css';
import { useAuth } from '../context/AuthContext';

function Register() {
  const navigate = useNavigate();
  const location = useLocation();
  const { register, requestRegisterOtp, verifyRegisterOtp } = useAuth();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    vehicleType: '',
    agreeTerms: false
  });

  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);
  const [step, setStep] = useState(1); // Step 1: Form, Step 2: OTP Verification
  const [otpEmail, setOtpEmail] = useState('');
  const [otpError, setOtpError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const validateForm = useCallback(() => {
    const newErrors = {};

    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
    
    // Email validation - must have @ and valid format
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!formData.email.includes('@')) {
      newErrors.email = 'Email must contain @ symbol';
    } else if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      newErrors.email = 'Please enter a valid email address (e.g., user@example.com)';
    }
    
    // Phone validation - exactly 10 digits, numbers only
    if (!formData.phone) {
      newErrors.phone = 'Phone number is required';
    } else if (!formData.phone.match(/^\d{10}$/)) {
      newErrors.phone = 'Phone must be exactly 10 digits (numbers only)';
    }
    
    if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    if (!formData.vehicleType) newErrors.vehicleType = 'Vehicle type is required';
    if (!formData.agreeTerms) newErrors.agreeTerms = 'You must agree to terms';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  React.useEffect(() => {
    if (Object.keys(errors).length > 0) {
      validateForm();
    }
  }, [errors, validateForm]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      setIsSubmitting(true);
      setOtpError('');
      setOtpEmail('');

      try {
        await register({
          email: formData.email,
          fullName: formData.fullName,
          phone: formData.phone,
          password: formData.password,
          role: 'user',
        });

        setStep(2);
      } catch (error) {
        setOtpError(error?.message || 'Registration failed. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleOtpVerification = async (e) => {
    e.preventDefault();
    setOtpError('');

    if (!otpEmail.trim()) {
      setOtpError('Please enter OTP sent to your email');
      return;
    }

    setIsSubmitting(true);
    try {
      await verifyRegisterOtp({ email: formData.email, otp: otpEmail });

      setSuccess(true);
      setTimeout(() => {
        const from = location.state?.from;
        if (from) {
          navigate(from, { replace: true });
        } else {
          navigate('/login', { replace: true });
        }
      }, 1500);
    } catch (error) {
      setOtpError(error?.message || 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendOtp = async () => {
    setIsSubmitting(true);
    try {
      await requestRegisterOtp(formData.email);
    } catch (error) {
      setOtpError(error?.message || 'Failed to resend OTP');
    } finally {
      setIsSubmitting(false);
    }

    setOtpEmail('');
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h1>{step === 1 ? 'Create Account' : 'Verify Account'}</h1>
            <p>{step === 1 ? 'Join AutoX for premium vehicle care' : 'Verify your email address'}</p>
          </div>

          {success && (
            <div className="success-banner">
              ✓ Email verified successfully! Redirecting to login...
            </div>
          )}

          {otpError && step === 1 && (
            <div className="error-banner">
              ⚠️ {otpError}
            </div>
          )}

          {step === 1 ? (
            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-group">
                <label htmlFor="email">Email Address * (must contain @)</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className={errors.email ? 'error' : ''}
                />
                {errors.email && <span className="error-text">⚠️ {errors.email}</span>}
                {formData.email && !errors.email && (
                  <small style={{ color: '#4caf50', display: 'block', marginTop: '4px' }}>✓ Valid email address</small>
                )}
                {formData.email && !formData.email.includes('@') && (
                  <small style={{ color: '#ff9800', display: 'block', marginTop: '4px' }}>ℹ️ Email must contain @ symbol (e.g., user@example.com)</small>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="phone">Phone Number * (10 digits only)</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={(e) => {
                    // Allow only numbers and limit to 10 digits
                    const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                    handleChange({ target: { name: 'phone', value } });
                  }}
                  placeholder="9876543210"
                  maxLength="10"
                  className={errors.phone ? 'error' : ''}
                />
                {errors.phone && <span className="error-text">⚠️ {errors.phone}</span>}
                {formData.phone && !errors.phone && (
                  <small style={{ color: '#4caf50', display: 'block', marginTop: '4px' }}>✓ Valid phone number ({formData.phone.length}/10 digits)</small>
                )}
                {formData.phone && formData.phone.length < 10 && !errors.phone && (
                  <small style={{ color: '#ff9800', display: 'block', marginTop: '4px' }}>ℹ️ Enter {10 - formData.phone.length} more digit(s)</small>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="fullName">Full Name *</label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="John Doe"
                  className={errors.fullName ? 'error' : ''}
                />
                {errors.fullName && <span className="error-text">⚠️ {errors.fullName}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="vehicleType">Vehicle Type *</label>
                <select
                  id="vehicleType"
                  name="vehicleType"
                  value={formData.vehicleType}
                  onChange={handleChange}
                  className={errors.vehicleType ? 'error' : ''}
                >
                  <option value="">Select vehicle type</option>
                  <option value="car">Car</option>
                  <option value="bike">Bike</option>
                  <option value="suv">SUV</option>
                  <option value="truck">Truck</option>
                  <option value="other">Other</option>
                </select>
                {errors.vehicleType && <span className="error-text">⚠️ {errors.vehicleType}</span>}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="password">Password *</label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className={errors.password ? 'error' : ''}
                  />
                  {errors.password && <span className="error-text">⚠️ {errors.password}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="confirmPassword">Confirm Password *</label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className={errors.confirmPassword ? 'error' : ''}
                  />
                  {errors.confirmPassword && <span className="error-text">⚠️ {errors.confirmPassword}</span>}
                </div>
              </div>

              <div className="form-checkbox">
                <input
                  type="checkbox"
                  id="agreeTerms"
                  name="agreeTerms"
                  checked={formData.agreeTerms}
                  onChange={handleChange}
                />
                <label htmlFor="agreeTerms">
                  I agree to the <a href="#terms">Terms & Conditions</a> and <a href="#privacy">Privacy Policy</a> *
                </label>
                {errors.agreeTerms && <span className="error-text">⚠️ {errors.agreeTerms}</span>}
              </div>

              <button 
                type="submit" 
                className="submit-btn"
                disabled={Object.keys(errors).length > 0 || isSubmitting}
                style={{
                  opacity: (Object.keys(errors).length > 0 || isSubmitting) ? 0.5 : 1,
                  cursor: (Object.keys(errors).length > 0 || isSubmitting) ? 'not-allowed' : 'pointer'
                }}
              >
                {isSubmitting
                  ? 'Creating Account...'
                  : Object.keys(errors).length > 0
                    ? '⚠️ Please fix errors above'
                    : 'Create Account & Send Email OTP'}
              </button>

              <div className="auth-footer">
                Already have an account? <Link to="/login">Login here</Link>
              </div>
            </form>
          ) : (
            <form onSubmit={handleOtpVerification} className="auth-form">
              <div className="otp-info">
                <p style={{ marginBottom: '20px', color: '#666', fontSize: '14px' }}>
                  We've sent an OTP verification code to:
                </p>
                <div style={{ background: '#f5f5f5', padding: '15px', borderRadius: '8px', marginBottom: '20px', fontSize: '14px' }}>
                  <p><strong>📧 Email:</strong> {formData.email}</p>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="otpEmail">Email OTP *</label>
                <input
                  type="text"
                  id="otpEmail"
                  value={otpEmail}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                    setOtpEmail(value);
                  }}
                  placeholder="Enter 6-digit OTP from email"
                  maxLength="6"
                  className={otpError && !otpEmail ? 'error' : ''}
                />
                {!otpEmail && <small style={{ color: '#999' }}>Check your email for the OTP</small>}
              </div>

              {otpError && (
                <div className="error-banner" style={{ color: '#d32f2f', background: '#ffebee', padding: '12px', borderRadius: '4px', marginBottom: '15px' }}>
                  ⚠️ {otpError}
                </div>
              )}

              <button 
                type="submit" 
                className="submit-btn"
                disabled={isSubmitting || otpEmail.trim().length < 4}
                style={{
                  opacity: (isSubmitting || otpEmail.trim().length < 4) ? 0.5 : 1,
                  cursor: (isSubmitting || otpEmail.trim().length < 4) ? 'not-allowed' : 'pointer'
                }}
              >
                {isSubmitting
                  ? 'Verifying...'
                  : 'Verify Email OTP & Complete Registration'}
              </button>

              <div style={{ textAlign: 'center', marginTop: '15px' }}>
                <button 
                  type="button" 
                  onClick={handleResendOtp}
                  style={{ 
                    background: 'none', 
                    border: 'none', 
                    color: '#1976d2', 
                    cursor: 'pointer',
                    fontSize: '14px',
                    textDecoration: 'underline'
                  }}
                >
                  Resend OTP
                </button>
              </div>

              <div style={{ textAlign: 'center', marginTop: '10px' }}>
                <button 
                  type="button" 
                  onClick={() => {
                    setStep(1);
                    setOtpEmail('');
                    setOtpError('');
                  }}
                  style={{ 
                    background: 'none', 
                    border: 'none', 
                    color: '#666', 
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  ← Go Back
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default Register;
