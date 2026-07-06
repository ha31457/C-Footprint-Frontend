import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { verifyEmail } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const emailParam = searchParams.get('email');
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (otp.length !== 6 || !/^\d+$/.test(otp)) {
      setError('OTP must be a 6-digit numeric code.');
      return;
    }

    setSubmitting(true);
    try {
      const responseMessage = await verifyEmail(email, otp);
      setSuccess(responseMessage || 'Email successfully verified! You can now log in.');
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed. Please check the code and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h2>Verify Email</h2>
        <p className="subtitle">Please enter the 6-digit OTP sent to your email</p>

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

        <label>
          Verification OTP (6 Digits)
          <input
            type="text"
            maxLength={6}
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
            placeholder="123456"
            required
          />
        </label>

        <button type="submit" disabled={submitting || !!success}>
          {submitting ? 'Verifying...' : 'Verify Email'}
        </button>

        <div className="footer-links">
          <p>
            Didn't receive a code? Try signing up again to resend.
          </p>
          <p>
            Back to <Link to="/login">Log In</Link>
          </p>
        </div>
      </form>
    </div>
  );
}
