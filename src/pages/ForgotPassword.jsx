import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { forgotPassword } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      const responseMessage = await forgotPassword(email);
      setSuccess(responseMessage || 'Password reset OTP has been sent to your email.');
      setTimeout(() => {
        navigate(`/reset-password?email=${encodeURIComponent(email)}`);
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to request password reset OTP. Please check the email.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h2>Forgot Password</h2>
        <p className="subtitle">Enter your email to receive a 6-digit password reset OTP</p>

        {error && (
          <div className="error-container">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="success-container">
            <span>✅</span>
            <span>{success}</span>
          </div>
        )}

        <label>
          Email Address
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="e.g. jane@example.com"
            required
          />
        </label>

        <button type="submit" disabled={submitting || !!success}>
          {submitting ? 'Sending OTP...' : 'Send Reset OTP'}
        </button>

        <div className="footer-links">
          <p>
            Remember your password? <Link to="/login">Log In</Link>
          </p>
        </div>
      </form>
    </div>
  );
}
