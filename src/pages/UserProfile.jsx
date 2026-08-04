import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import apiClient from '../api/apiClient';
import CustomDropdown from '../components/CustomDropdown';
import { getAvatarUrl } from '../constants/avatars';
import { useLanguage } from '../context/LanguageContext';

export default function UserProfile() {
  const { user, updateUser } = useAuth();
  const { t } = useLanguage();
  const [profile, setProfile] = useState(user);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Editing states
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    mobileNumber: '',
    age: '',
    gender: ''
  });
  const [saving, setSaving] = useState(false);

  const isUser = user?.role === 'ROLE_USER';

  // Fetch enriched profile if user
  useEffect(() => {
    if (!isUser) {
      setProfile(user);
      return;
    }

    const fetchProfile = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await apiClient.get('/users/me');
        setProfile(res.data);
        // Pre-fill edit form
        setEditForm({
          mobileNumber: res.data.mobileNumber || '',
          age: res.data.age || '',
          gender: res.data.gender || ''
        });
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch enriched profile details.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [isUser, user]);

  const handleStartEdit = () => {
    setEditForm({
      mobileNumber: profile?.mobileNumber || '',
      age: profile?.age || '',
      gender: profile?.gender || ''
    });
    setSuccess('');
    setError('');
    setIsEditing(true);
  };

  const handleEditChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Regex Pattern validation: ^\+?[1-9]\d{1,14}$
    const mobileRegex = /^\+?[1-9]\d{1,14}$/;
    if (!mobileRegex.test(editForm.mobileNumber)) {
      setError('Mobile number must follow standard format (e.g., +1999999999 or +15551234567, no leading zeros after plus).');
      return;
    }

    const ageNum = parseInt(editForm.age, 10);
    if (isNaN(ageNum) || ageNum < 1 || ageNum > 120) {
      setError('Age must be a number between 1 and 120.');
      return;
    }

    if (!editForm.gender) {
      setError('Please select a gender.');
      return;
    }

    setSaving(true);
    try {
      const res = await apiClient.put('/users/profile', {
        mobileNumber: editForm.mobileNumber,
        age: ageNum,
        gender: editForm.gender
      });

      // Update local profile view
      setProfile(res.data);
      updateUser(res.data);
      setIsEditing(false);
      setSuccess('Profile details updated successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile.');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setError('');
    setSuccess('');

    // Check size limit: 1MB
    if (file.size > 1024 * 1024) {
      setError('Upload failed: File size exceeds the maximum limit of 1MB.');
      return;
    }

    // Check allowed format: png, jpg, jpeg
    const allowedExtensions = ['png', 'jpg', 'jpeg'];
    const fileExtension = file.name.split('.').pop().toLowerCase();
    if (!allowedExtensions.includes(fileExtension)) {
      setError('Upload failed: Only PNG, JPG, and JPEG images are allowed.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await apiClient.post('/users/upload-avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      // The API returns { avatarImageId, avatarUrl }
      const updatedProfile = { ...profile, avatarUrl: res.data.avatarUrl };
      setProfile(updatedProfile);
      updateUser(updatedProfile);
      setSuccess('Profile avatar photo uploaded successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload avatar image.');
      console.error(err);
    }
  };

  const handleAvatarReset = async () => {
    setError('');
    setSuccess('');
    try {
      await apiClient.put('/users/avatar', {
        avatar: 'male-1'
      });
      const updatedProfile = { ...profile, avatarUrl: null, avatar: 'male-1' };
      setProfile(updatedProfile);
      updateUser(updatedProfile);
      setSuccess('Profile avatar reset to preset successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset avatar.');
      console.error(err);
    }
  };

  const avatarUrl = getAvatarUrl(profile?.avatarUrl, profile?.avatar, profile?.gender, profile?.username);

  return (
    <div className="dashboard" style={{ maxWidth: '1200px' }}>
      <header className="dashboard-header" style={{ marginBottom: '2rem' }}>
        <div>
          <h1>User Profile</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
            Manage your account settings and personal details
          </p>
        </div>
      </header>

      {error && (
        <div className="error-container" style={{ marginBottom: '1.5rem' }}>
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div style={{ padding: '1rem 1.2rem', background: 'var(--primary-light)', color: 'var(--primary-color)', borderRadius: '12px', marginBottom: '1.5rem', fontWeight: '750' }}>
          {success}
        </div>
      )}

      {loading ? (
        <p style={{ color: 'var(--text-light)', fontStyle: 'italic' }}>Loading profile details...</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Automated Initial-Face Avatar Card */}
          <section className="chart-card" style={{ padding: '2.2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
              <img
                src={avatarUrl}
                alt="Profile Avatar"
                style={{
                  width: '96px',
                  height: '96px',
                  borderRadius: '50%',
                  border: '3px solid var(--primary-color)',
                  background: 'var(--primary-light)',
                  objectFit: 'cover'
                }}
              />
              <div>
                <h3 style={{ margin: '0 0 0.3rem 0', fontSize: '1.3rem' }}>{profile?.username}</h3>
                <p style={{ margin: '0 0 0.4rem 0', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                  {profile?.email} &bull; <span style={{ textTransform: 'capitalize', color: 'var(--primary-color)', fontWeight: '700' }}>{profile?.role?.replace('ROLE_', '')}</span>
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.6rem' }}>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <input
                      type="file"
                      id="avatar-file-input"
                      accept=".png,.jpg,.jpeg"
                      onChange={handleAvatarUpload}
                      style={{ display: 'none' }}
                    />
                    <label
                      htmlFor="avatar-file-input"
                      style={{
                        padding: '0.55rem 1.2rem',
                        background: 'linear-gradient(135deg, var(--primary-color), #34d399)',
                        color: '#ffffff',
                        borderRadius: '8px',
                        fontSize: '0.82rem',
                        fontWeight: '750',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        transition: 'transform 0.2s'
                      }}
                    >
                      📤 Upload Photo
                    </label>

                    {profile?.avatarUrl && (
                      <button
                        type="button"
                        onClick={handleAvatarReset}
                        style={{
                          padding: '0.55rem 1.2rem',
                          background: 'transparent',
                          border: '1.5px solid var(--border-color)',
                          color: 'var(--text-primary)',
                          borderRadius: '8px',
                          fontSize: '0.82rem',
                          fontWeight: '750',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.4rem'
                        }}
                      >
                        🗑️ Reset Photo
                      </button>
                    )}
                  </div>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-light)', fontWeight: '600' }}>
                    Allowed formats: <strong>PNG, JPG, JPEG</strong>. Max file size: <strong>1MB</strong>.
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* Profile Details Card */}
          <section className="chart-card" style={{ padding: '2.2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.8rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem' }}>{t('profilePersonalInfo', 'Personal Information')}</h3>
              {isUser && !isEditing && (
                <button
                  type="button"
                  onClick={handleStartEdit}
                  style={{
                    padding: '0.55rem 1.4rem',
                    background: 'var(--primary-color)',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '10px',
                    fontWeight: '750',
                    fontSize: '0.88rem',
                    cursor: 'pointer'
                  }}
                >
                  Edit Profile
                </button>
              )}
            </div>

            {isEditing ? (
              <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div className="form-group">
                  <label htmlFor="mobileNumber">Mobile Number (Format: +1999999999)</label>
                  <input
                    id="mobileNumber"
                    type="text"
                    name="mobileNumber"
                    value={editForm.mobileNumber}
                    onChange={handleEditChange}
                    placeholder="+1999999999"
                    className="form-control"
                    required
                  />
                </div>

                <div className="form-row" style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                  <div className="form-group" style={{ flex: 1, minWidth: '180px' }}>
                    <label htmlFor="age">Age (1 - 120)</label>
                    <input
                      id="age"
                      type="number"
                      name="age"
                      min="1"
                      max="120"
                      value={editForm.age}
                      onChange={handleEditChange}
                      placeholder="25"
                      className="form-control"
                      required
                    />
                  </div>

                  <div className="form-group" style={{ flex: 1, minWidth: '180px' }}>
                    <CustomDropdown
                      label="Gender"
                      placeholder="Select Gender"
                      options={[
                        { value: 'Male', label: 'Male' },
                        { value: 'Female', label: 'Female' },
                        { value: 'Other', label: 'Other' }
                      ]}
                      value={editForm.gender}
                      onChange={(val) => setEditForm((prev) => ({ ...prev, gender: val }))}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                  <button
                    type="submit"
                    disabled={saving}
                    className="btn-submit"
                    style={{ padding: '0.75rem 1.8rem', fontWeight: '800' }}
                  >
                    {saving ? 'Saving...' : 'Save Profile'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    style={{
                      padding: '0.75rem 1.5rem',
                      background: 'transparent',
                      border: '1px solid var(--border-color)',
                      color: 'var(--text-secondary)',
                      borderRadius: '10px',
                      fontWeight: '750',
                      cursor: 'pointer'
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
                <div style={{ padding: '1.2rem', background: 'var(--bg-color)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: '700', display: 'block', marginBottom: '0.3rem' }}>Username</span>
                  <span style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--text-primary)' }}>{profile?.username}</span>
                </div>
                <div style={{ padding: '1.2rem', background: 'var(--bg-color)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: '700', display: 'block', marginBottom: '0.3rem' }}>Email Address</span>
                  <span style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--text-primary)' }}>{profile?.email}</span>
                </div>
                {isUser && (
                  <>
                    <div style={{ padding: '1.2rem', background: 'var(--bg-color)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: '700', display: 'block', marginBottom: '0.3rem' }}>Mobile Number</span>
                      <span style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--text-primary)' }}>{profile?.mobileNumber || 'Not set'}</span>
                    </div>
                    <div style={{ padding: '1.2rem', background: 'var(--bg-color)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: '700', display: 'block', marginBottom: '0.3rem' }}>Age</span>
                      <span style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--text-primary)' }}>{profile?.age ? `${profile.age} years` : 'Not set'}</span>
                    </div>
                    <div style={{ padding: '1.2rem', background: 'var(--bg-color)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: '700', display: 'block', marginBottom: '0.3rem' }}>Gender</span>
                      <span style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--text-primary)' }}>{profile?.gender || 'Not set'}</span>
                    </div>
                  </>
                )}
              </div>
            )}
          </section>

        </div>
      )}
    </div>
  );
}
