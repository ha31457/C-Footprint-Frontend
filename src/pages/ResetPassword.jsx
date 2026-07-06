import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { resetPassword } = useAuth();
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

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters long.');
      return;
    }

    setSubmitting(true);
    try {
      const responseMessage = await resetPassword(email, otp, newPassword);
      setSuccess(responseMessage || 'Password has been successfully updated. You can now log in.');
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password. Please check your details.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h2>Reset Password</h2>
        <p className="subtitle">Enter the OTP sent to your email and your new password</p>

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
          Reset OTP (6 Digits)
          <input
            type="text"
            maxLength={6}
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
            placeholder="654321"
            required
          />
        </label>

        <label>
          New Password
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Minimum 6 characters"
            minLength={6}
            required
          />
        </label>

        <button type="submit" disabled={submitting || !!success}>
          {submitting ? 'Resetting password...' : 'Update Password'}
        </button>

        <div className="footer-links">
          <p>
            Back to <Link to="/login">Log In</Link>
          </p>
        </div>
      </form>
    </div>
  );
}
