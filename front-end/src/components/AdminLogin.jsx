import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './auth.css';
import { useAuth } from '../context/AuthContext';
import { usersApi } from '../utils/apiService';

function AdminLogin() {
  const navigate = useNavigate();
  const { login, loginWithOtp, requestLoginOtp, requestForgotPassword } = useAuth();
  const [formData, setFormData] = useState({
    identifier: '', // Can be email or username
    password: '',
    rememberMe: false
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotErrors, setForgotErrors] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);
  
  // OTP verification states for customer login
  const [showOtpVerification, setShowOtpVerification] = useState(false);
  const [userOtp, setUserOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [tempCustomerEmail, setTempCustomerEmail] = useState('');
  const [otpPreview, setOtpPreview] = useState('');

  // Detect login type based on input format
  const detectLoginType = (identifier) => {
    if (identifier.includes('@')) {
      return 'customer'; // Email format
    }
    return 'admin'; // Username format
  };

  const resolveCustomerEmail = async (identifier) => {
    const raw = String(identifier || '').trim();
    if (!raw) return '';
    if (raw.includes('@')) return raw.toLowerCase();

    try {
      const response = await usersApi.list();
      const users = Array.isArray(response?.data) ? response.data : [];
      const normalized = raw.toLowerCase();

      const found = users.find((user) => {
        const email = String(user?.email || '').toLowerCase();
        const username = String(user?.username || '').toLowerCase();
        const name = String(user?.name || user?.fullName || '').toLowerCase();
        const phone = String(user?.phone || '').toLowerCase();

        return (
          email === normalized ||
          username === normalized ||
          name === normalized ||
          phone === normalized
        );
      });

      return String(found?.email || '').toLowerCase();
    } catch (_error) {
      return '';
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Clear field-level error when user edits + clear login error
    setErrors(prev => {
      const next = { ...prev };
      delete next[name];
      return next;
    });
    setLoginError('');
  };

  const validateForm = () => {
    const newErrors = {};
    const loginType = detectLoginType(formData.identifier);

    if (!formData.identifier.trim()) {
      if (loginType === 'admin') {
        newErrors.identifier = 'Username is required';
      } else {
        newErrors.identifier = 'Email is required';
      }
    } else if (loginType === 'customer') {
      // For customer login with email, validate email format
      if (!formData.identifier.includes('@')) {
        newErrors.identifier = 'Email must contain @ symbol';
      } else if (!formData.identifier.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
        newErrors.identifier = 'Please enter a valid email address';
      }
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoginError('');

    if (validateForm()) {
      setLoading(true);
      const loginType = detectLoginType(formData.identifier);

      try {
        if (loginType === 'admin') {
          const adminEmail = formData.identifier.includes('@')
            ? formData.identifier
            : `${formData.identifier}@autox.com`;

          try {
            const user = await login({
              email: adminEmail,
              password: formData.password,
            });

            setSuccess(true);
            setTimeout(() => {
              navigate(user?.role === 'admin' ? '/admin' : '/customer/dashboard', { replace: true });
            }, 1200);
          } catch (_adminError) {
            const customerEmail = await resolveCustomerEmail(formData.identifier);
            if (!customerEmail) {
              throw _adminError;
            }

            const otpResponse = await requestLoginOtp(customerEmail);
            setUserOtp('');
            setOtpError('');
            setTempCustomerEmail(customerEmail);
            setOtpPreview(String(otpResponse?.otp || ''));
            setShowOtpVerification(true);
          }
        } else {
          const customerEmail = await resolveCustomerEmail(formData.identifier);
          if (!customerEmail) {
            throw new Error('Customer email not found. Please enter registered email.');
          }

          const otpResponse = await requestLoginOtp(customerEmail);
          setUserOtp('');
          setOtpError('');
          setTempCustomerEmail(customerEmail);
          setOtpPreview(String(otpResponse?.otp || ''));
          setShowOtpVerification(true);
        }
      } catch (error) {
        setLoginError(error?.message || 'Unable to login right now');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleOtpVerification = async (e) => {
    e.preventDefault();
    setOtpError('');

    if (!userOtp.trim()) {
      setOtpError('Please enter the OTP sent to your email');
      return;
    }

    setLoading(true);
    try {
      await loginWithOtp({ email: tempCustomerEmail, otp: userOtp });
      setSuccess(true);
      setTimeout(() => {
        navigate('/customer/dashboard', { replace: true });
      }, 1200);
    } catch (error) {
      setOtpError(error?.message || 'Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    try {
      const otpResponse = await requestLoginOtp(tempCustomerEmail);
      setUserOtp('');
      setOtpError('');
      setOtpPreview(String(otpResponse?.otp || ''));
    } catch (error) {
      setOtpError(error?.message || 'Failed to resend OTP');
    }
  };

  const handleForgotPasswordClick = (e) => {
    e.preventDefault();
    setShowForgotPassword(true);
    setForgotEmail('');
    setForgotErrors('');
    setForgotSuccess(false);
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    setForgotErrors('');

    if (!forgotEmail.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      setForgotErrors('Please enter a valid email address');
      return;
    }

    setForgotLoading(true);
    try {
      await requestForgotPassword(forgotEmail);
      setForgotSuccess(true);
      setTimeout(() => {
        setShowForgotPassword(false);
        setForgotEmail('');
      }, 2000);
    } catch (error) {
      setForgotErrors(error?.message || 'Could not process forgot password request');
    } finally {
      setForgotLoading(false);
    }
  };

  const closeForgotPassword = () => {
    setShowForgotPassword(false);
    setForgotEmail('');
    setForgotErrors('');
    setForgotSuccess(false);
  };

  const handleEmailSupport = () => {
    window.location.href = 'mailto:autox.service@gmail.com?subject=Login Assistance&body=Hello, I need help logging into my AutoX account.';
  };

  const handleWhatsAppSupport = () => {
    window.open('https://wa.me/919328764024?text=Hello, I need help with my AutoX login', '_blank');
  };

  const getPlaceholder = () => {
    if (!formData.identifier) {
      return 'Enter email (customer) or username (admin)';
    }
    const loginType = detectLoginType(formData.identifier);
    return loginType === 'admin' ? 'Admin username' : 'Customer email';
  };

  const getHelperText = () => {
    if (!formData.identifier) {
      return 'Enter email for customer login or username for admin login';
    }
    const loginType = detectLoginType(formData.identifier);
    if (loginType === 'admin') {
      return '🔐 Admin login mode';
    }
    return '👤 Customer login mode';
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card login-card">
          <div className="auth-header">
            <h1>Welcome to AutoX</h1>
            <p>Login to your account</p>
          </div>

          {success && (
            <div className="success-banner">
              ✓ Login successful! Redirecting...
            </div>
          )}

          {loginError && <div className="error-banner">{loginError}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="identifier">Email or Username</label>
              <input
                type="text"
                id="identifier"
                name="identifier"
                value={formData.identifier}
                onChange={handleChange}
                placeholder={getPlaceholder()}
                className={errors.identifier ? 'error' : ''}
              />
              {errors.identifier && <span className="error-text">⚠️ {errors.identifier}</span>}
              {formData.identifier && (
                <small className="helper-text">{getHelperText()}</small>
              )}
              {formData.identifier && !errors.identifier && detectLoginType(formData.identifier) === 'customer' && (
                <small style={{ color: '#4caf50', display: 'block', marginTop: '4px' }}>✓ Valid email format - Customer login</small>
              )}
              {formData.identifier && !errors.identifier && detectLoginType(formData.identifier) === 'admin' && (
                <small style={{ color: '#1976d2', display: 'block', marginTop: '4px' }}>👤 Admin username detected</small>
              )}
              {formData.identifier && !formData.identifier.includes('@') && detectLoginType(formData.identifier) === 'admin' && !errors.identifier && (
                <small style={{ color: '#ff9800', display: 'block', marginTop: '4px' }}>ℹ️ Using admin login credentials</small>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className={errors.password ? 'error' : ''}
              />
              {errors.password && <span className="error-text">{errors.password}</span>}
            </div>

            <div className="form-row-inline">
              <div className="form-checkbox">
                <input
                  type="checkbox"
                  id="rememberMe"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                />
                <label htmlFor="rememberMe">Remember me</label>
              </div>
              <button
                type="button"
                onClick={handleForgotPasswordClick}
                className="forgot-link"
              >
                Forgot password?
              </button>
            </div>

            <button 
              type="submit" 
              className="submit-btn"
              disabled={loading || Object.keys(errors).length > 0}
              style={{
                opacity: (loading || Object.keys(errors).length > 0) ? 0.5 : 1,
                cursor: (loading || Object.keys(errors).length > 0) ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? 'Logging in...' : Object.keys(errors).length > 0 ? '⚠️ Please fix errors above' : 'Login'}
            </button>

            <div className="auth-footer">
              Don't have an account? <Link to="/register">Register here</Link>
            </div>
          </form>

          <div className="divider">OR</div>

          <div className="social-login">
            <button className="social-btn google" onClick={handleEmailSupport}>
              <span>📧</span> Login with Email
            </button>
            <button className="social-btn whatsapp" onClick={handleWhatsAppSupport}>
              <span>💬</span> WhatsApp
            </button>
          </div>

          {/* Demo Info */}
          <div className="demo-info">
            <strong>Demo Credentials:</strong>
            <div>👤 Username: <code>admin</code></div>
            <div>🔑 Password: <code>admin123</code></div>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div className="modal-backdrop" onClick={closeForgotPassword}>
          <div className="forgot-password-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={closeForgotPassword}>✕</button>
            
            <div className="forgot-password-header">
              <h2>Forgot Password?</h2>
              <p>Enter your email address and we'll send you a link to reset your password.</p>
            </div>

            {forgotSuccess && (
              <div className="success-banner">
                ✓ Reset link sent! Check your email inbox.
              </div>
            )}

            <form onSubmit={handleForgotSubmit} className="forgot-form">
              <div className="form-group">
                <label htmlFor="forgotEmail">Email Address</label>
                <input
                  type="email"
                  id="forgotEmail"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="you@example.com"
                  className={forgotErrors ? 'error' : ''}
                />
                {forgotErrors && <span className="error-text">{forgotErrors}</span>}
              </div>

              <button 
                type="submit" 
                className="submit-btn forgot-submit-btn"
                disabled={forgotLoading}
              >
                {forgotLoading ? 'Sending...' : 'Send Reset Link'}
              </button>

              <button
                type="button"
                onClick={closeForgotPassword}
                className="cancel-btn"
              >
                Back to Login
              </button>
            </form>
          </div>
        </div>
      )}

      {/* OTP Verification Modal for Customer Login */}
      {showOtpVerification && (
        <div className="modal-backdrop" onClick={() => setShowOtpVerification(false)}>
          <div className="forgot-password-modal" onClick={(e) => e.stopPropagation()}>
            <button 
              className="modal-close-btn" 
              onClick={() => setShowOtpVerification(false)}
            >
              ✕
            </button>
            
            <div className="forgot-password-header">
              <h2>Verify Your Email</h2>
              <p>We've sent a 6-digit OTP to your email address</p>
            </div>

            <div style={{ background: '#f5f5f5', padding: '15px', borderRadius: '8px', marginBottom: '20px', fontSize: '14px', textAlign: 'center' }}>
              <p><strong>📧 {tempCustomerEmail}</strong></p>
              {otpPreview ? (
                <p style={{ marginTop: '10px', color: '#b91c1c' }}>
                  <strong>OTP: {otpPreview}</strong>
                </p>
              ) : null}
            </div>

            {otpError && (
              <div className="error-banner" style={{ marginBottom: '15px' }}>
                ⚠️ {otpError}
              </div>
            )}

            <form onSubmit={handleOtpVerification} className="forgot-form">
              <div className="form-group">
                <label htmlFor="userOtp">Enter OTP *</label>
                <input
                  type="text"
                  id="userOtp"
                  value={userOtp}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                    setUserOtp(value);
                  }}
                  placeholder="Enter 6-digit OTP"
                  maxLength="6"
                  className={otpError ? 'error' : ''}
                  style={{ textAlign: 'center', fontSize: '18px', letterSpacing: '2px' }}
                />
                {(!userOtp || userOtp.length < 6) && (
                  <small style={{ color: '#999', display: 'block', textAlign: 'center', marginTop: '8px' }}>
                    Check your email for the OTP code
                  </small>
                )}
              </div>

              <button 
                type="submit" 
                className="submit-btn forgot-submit-btn"
                disabled={loading || userOtp.trim().length < 4}
                style={{
                  opacity: (loading || userOtp.trim().length < 4) ? 0.5 : 1,
                  cursor: (loading || userOtp.trim().length < 4) ? 'not-allowed' : 'pointer'
                }}
              >
                {loading ? 'Verifying...' : 'Verify & Login'}
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
                  Didn't receive OTP? Resend
                </button>
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowOtpVerification(false);
                  setUserOtp('');
                  setOtpError('');
                  setOtpPreview('');
                }}
                className="cancel-btn"
              >
                Back to Login
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminLogin;


