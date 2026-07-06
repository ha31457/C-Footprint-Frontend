import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import CustomDropdown from '../components/CustomDropdown';

export default function Signup() {
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    mobileNumber: '',
    age: '',
    gender: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Simple validation for mobile number (10-15 digits, digits only, optional leading plus sign)
    const mobileRegex = /^\+?[0-9]{10,15}$/;
    if (!mobileRegex.test(form.mobileNumber)) {
      setError('Mobile number must be between 10 and 15 digits (e.g. +15551234567).');
      return;
    }

    const ageNum = parseInt(form.age, 10);
    if (isNaN(ageNum) || ageNum < 1 || ageNum > 120) {
      setError('Age must be a number between 1 and 120.');
      return;
    }

    if (!form.gender) {
      setError('Please select a gender.');
      return;
    }

    setSubmitting(true);
    try {
      await signup(
        form.username,
        form.email,
        form.password,
        form.mobileNumber,
        form.age,
        form.gender
      );
      setSuccess(true);
      setTimeout(() => {
        navigate(`/verify-email?email=${encodeURIComponent(form.email)}`);
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h2>Create Account</h2>
        <p className="subtitle">Join the Carbon Footprint tracker</p>
        
        {error && (
          <div className="error-container">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}
        
        {success && (
          <div className="success-container">
            <span>✅</span>
            <span>Account created! Redirecting to verification page...</span>
          </div>
        )}

        <label>
          Username
          <input
            type="text"
            name="username"
            minLength={3}
            maxLength={50}
            value={form.username}
            onChange={handleChange}
            placeholder="e.g. jane_doe"
            required
          />
        </label>

        <label>
          Email
          <input
            type="email"
            name="email"
            maxLength={100}
            value={form.email}
            onChange={handleChange}
            placeholder="e.g. jane@example.com"
            required
          />
        </label>

        <label>
          Password
          <input
            type="password"
            name="password"
            minLength={6}
            value={form.password}
            onChange={handleChange}
            placeholder="At least 6 characters"
            required
          />
        </label>

        <label>
          Mobile Number
          <input
            type="text"
            name="mobileNumber"
            value={form.mobileNumber}
            onChange={handleChange}
            placeholder="e.g. +15551234567"
            required
          />
        </label>

        <div className="form-row">
          <label>
            Age
            <input
              type="number"
              name="age"
              min={1}
              max={120}
              value={form.age}
              onChange={handleChange}
              placeholder="e.g. 28"
              required
            />
          </label>

          <CustomDropdown
            label="Gender"
            placeholder="Select"
            options={[
              { value: 'Male', label: 'Male' },
              { value: 'Female', label: 'Female' },
              { value: 'Other', label: 'Other' }
            ]}
            value={form.gender}
            onChange={(val) => setForm((prev) => ({ ...prev, gender: val }))}
          />
        </div>

        <button type="submit" disabled={submitting || success}>
          {submitting ? 'Creating account...' : 'Sign Up'}
        </button>
        
        <div className="footer-links">
          <p>
            Already have an account? <Link to="/login">Log in</Link>
          </p>
        </div>
      </form>
    </div>
  );
}