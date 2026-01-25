import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './auth.css';
import { useAuth } from '../context/AuthContext';

function AdminLogin() {
  const navigate = useNavigate();
  const { login } = useAuth();
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

  // Detect login type based on input format
  const detectLoginType = (identifier) => {
    if (identifier.includes('@')) {
      return 'customer'; // Email format
    }
    return 'admin'; // Username format
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
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
    }

    if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoginError('');

    if (validateForm()) {
      setLoading(true);
      const loginType = detectLoginType(formData.identifier);

      setTimeout(() => {
        setLoading(false);

        if (loginType === 'admin') {
          // Admin login - verify credentials
          if (formData.identifier === 'admin' && formData.password === 'admin123') {
            setSuccess(true);
            setTimeout(() => {
              login({ 
                email: 'admin@autox.com',
                fullName: 'Admin',
                role: 'admin'
              });
              navigate('/admin', { replace: true });
            }, 1500);
          } else {
            setLoginError('Invalid username or password');
          }
        } else {
          // Customer login - accept any email/password combination
          setSuccess(true);
          setTimeout(() => {
            login({ 
              email: formData.identifier, 
              fullName: formData.identifier.split('@')[0],
              role: 'user' 
            });
            navigate('/customer/dashboard', { replace: true });
          }, 1500);
        }
      }, 1000);
    }
  };

  const handleForgotPasswordClick = (e) => {
    e.preventDefault();
    setShowForgotPassword(true);
    setForgotEmail('');
    setForgotErrors('');
    setForgotSuccess(false);
  };

  const handleForgotSubmit = (e) => {
    e.preventDefault();
    setForgotErrors('');

    if (!forgotEmail.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      setForgotErrors('Please enter a valid email address');
      return;
    }

    setForgotLoading(true);
    setTimeout(() => {
      setForgotLoading(false);
      setForgotSuccess(true);
      setTimeout(() => {
        setShowForgotPassword(false);
        setForgotEmail('');
      }, 2000);
    }, 1000);
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
      return '🔐 Admin login mode (Demo: admin)';
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
              {errors.identifier && <span className="error-text">{errors.identifier}</span>}
              {formData.identifier && (
                <small className="helper-text">{getHelperText()}</small>
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
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Login'}
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
    </div>
  );
}

export default AdminLogin;


