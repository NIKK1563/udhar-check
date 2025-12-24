import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../services/api';
import { toast } from 'react-toastify';
import Webcam from 'react-webcam';
import { 
  FiUser, 
  FiMail, 
  FiPhone, 
  FiMapPin,
  FiCamera,
  FiEdit2,
  FiCheck,
  FiX,
  FiShield,
  FiStar,
  FiCreditCard
} from 'react-icons/fi';
import './Profile.css';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [showSelfieModal, setShowSelfieModal] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const webcamRef = useRef(null);
  const [validationErrors, setValidationErrors] = useState({});

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: ''
  });

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        city: user.city || '',
        state: user.state || '',
        pincode: user.pincode || ''
      });
    }
  }, [user]);

  const getScoreClass = (score) => {
    if (score >= 70) return 'score-high';
    if (score >= 40) return 'score-medium';
    return 'score-low';
  };

  // Validate phone number (10 digits only)
  const validatePhone = (value) => {
    if (!value) return '';
    if (!/^\d*$/.test(value)) return 'Only numbers are allowed';
    if (value.length !== 10) return 'Phone number must be exactly 10 digits';
    return '';
  };

  // Validate pincode (6 digits only)
  const validatePincode = (value) => {
    if (!value) return '';
    if (!/^\d*$/.test(value)) return 'Only numbers are allowed';
    if (value.length !== 6) return 'PIN code must be exactly 6 digits';
    return '';
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Special handling for phone - only allow digits, max 10
    if (name === 'phone') {
      const numericValue = value.replace(/\D/g, '').slice(0, 10);
      setFormData(prev => ({ ...prev, [name]: numericValue }));
      setValidationErrors(prev => ({ ...prev, phone: validatePhone(numericValue) }));
      return;
    }
    
    // Special handling for pincode - only allow digits, max 6
    if (name === 'pincode') {
      const numericValue = value.replace(/\D/g, '').slice(0, 6);
      setFormData(prev => ({ ...prev, [name]: numericValue }));
      setValidationErrors(prev => ({ ...prev, pincode: validatePincode(numericValue) }));
      return;
    }
    
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate before submit
    const phoneError = validatePhone(formData.phone);
    const pincodeError = validatePincode(formData.pincode);
    
    if (phoneError || pincodeError) {
      setValidationErrors({ phone: phoneError, pincode: pincodeError });
      if (phoneError) toast.error(phoneError);
      if (pincodeError) toast.error(pincodeError);
      return;
    }
    
    setLoading(true);

    try {
      const response = await authAPI.updateProfile(formData);
      updateUser(response.data.data);
      toast.success('Profile updated successfully!');
      setEditMode(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const captureSelfie = () => {
    const imageSrc = webcamRef.current.getScreenshot();
    setCapturedImage(imageSrc);
  };

  const uploadSelfie = async () => {
    if (!capturedImage) return;

    setLoading(true);
    try {
      // Convert base64 to blob
      const response = await fetch(capturedImage);
      const blob = await response.blob();
      const file = new File([blob], 'selfie.jpg', { type: 'image/jpeg' });

      const formData = new FormData();
      formData.append('selfie', file);

      const result = await authAPI.uploadSelfie(formData);
      updateUser(result.data.data);
      toast.success('Selfie updated successfully!');
      setShowSelfieModal(false);
      setCapturedImage(null);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to upload selfie');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-page">
      <div className="page-header">
        <h1 className="page-title">My Profile</h1>
        {!editMode ? (
          <button className="btn btn-primary" onClick={() => setEditMode(true)}>
            <FiEdit2 /> Edit Profile
          </button>
        ) : (
          <div className="header-actions">
            <button className="btn btn-secondary" onClick={() => setEditMode(false)}>
              <FiX /> Cancel
            </button>
            <button className="btn btn-success" onClick={handleSubmit} disabled={loading}>
              {loading ? <span className="spinner"></span> : <><FiCheck /> Save</>}
            </button>
          </div>
        )}
      </div>

      <div className="profile-grid">
        {/* Left Column - Profile Card */}
        <div className="profile-card">
          <div className="profile-photo-section">
            <div className="profile-photo">
              {user?.selfieUrl ? (
                <img src={`http://localhost:5000${user.selfieUrl}`} alt="Profile" />
              ) : (
                <div className="photo-placeholder">
                  <FiUser size={48} />
                </div>
              )}
              <button 
                className="photo-edit-btn" 
                onClick={() => setShowSelfieModal(true)}
                title="Update Photo"
              >
                <FiCamera />
              </button>
            </div>
            <h2>{user?.firstName} {user?.lastName}</h2>
            <p className="role-badge">{user?.role}</p>
          </div>

          {/* Score Section */}
          <div className="scores-section">
            <div className={`score-item ${getScoreClass(user?.trustScore)}`}>
              <FiShield className="score-icon" />
              <div className="score-content">
                <span className="score-value">{user?.trustScore || 50}</span>
                <span className="score-label">Trust Score</span>
              </div>
            </div>
            {user?.role === 'borrower' && (
              <div className={`score-item ${getScoreClass(user?.repaymentScore)}`}>
                <FiCreditCard className="score-icon" />
                <div className="score-content">
                  <span className="score-value">{user?.repaymentScore || 50}</span>
                  <span className="score-label">Repayment</span>
                </div>
              </div>
            )}
            <div className="score-item rating">
              <FiStar className="score-icon" />
              <div className="score-content">
                <span className="score-value">{user?.averageRating ? Math.round(Number(user.averageRating)) : 0}</span>
                <span className="score-label">Ratings</span>
              </div>
            </div>
          </div>

          {/* Verification Status */}
          <div className="verification-section">
            <h4>Verification Status</h4>
            <div className="verification-items">
              <div className={`verification-item ${user?.emailVerified ? 'verified' : ''}`}>
                <FiMail />
                <span>Email</span>
                {user?.emailVerified ? <FiCheck className="check" /> : <span className="pending">Pending</span>}
              </div>
              <div className={`verification-item ${user?.phoneVerified ? 'verified' : ''}`}>
                <FiPhone />
                <span>Phone</span>
                {user?.phoneVerified ? <FiCheck className="check" /> : <span className="pending">Pending</span>}
              </div>
              <div className={`verification-item ${user?.isFaceVerified ? 'verified' : ''}`}>
                <FiCamera />
                <span>Face</span>
                {user?.isFaceVerified ? <FiCheck className="check" /> : <span className="pending">Pending</span>}
              </div>
              <div className={`verification-item ${user?.isIdVerified ? 'verified' : ''}`}>
                <FiShield />
                <span>ID</span>
                {user?.isIdVerified ? <FiCheck className="check" /> : <span className="pending">Pending</span>}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Details Form */}
        <div className="profile-details">
          <form onSubmit={handleSubmit}>
            {/* Personal Information */}
            <div className="card">
              <div className="card-header">
                <h3><FiUser /> Personal Information</h3>
              </div>
              <div className="card-body">
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">First Name</label>
                    <input
                      type="text"
                      name="firstName"
                      className="form-input"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      disabled={!editMode}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Last Name</label>
                    <input
                      type="text"
                      name="lastName"
                      className="form-input"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      disabled={!editMode}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      name="email"
                      className="form-input"
                      value={formData.email}
                      disabled
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Phone</label>
                    <input
                      type="tel"
                      name="phone"
                      className={`form-input ${validationErrors.phone ? 'error' : ''}`}
                      value={formData.phone}
                      onChange={handleInputChange}
                      disabled={!editMode}
                      placeholder="10 digit number"
                      maxLength={10}
                      inputMode="numeric"
                      pattern="[0-9]*"
                    />
                    {validationErrors.phone && editMode && (
                      <span className="form-error">{validationErrors.phone}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Address Information */}
            <div className="card">
              <div className="card-header">
                <h3><FiMapPin /> Address</h3>
              </div>
              <div className="card-body">
                <div className="form-grid">
                  <div className="form-group full-width">
                    <label className="form-label">Street Address</label>
                    <input
                      type="text"
                      name="address"
                      className="form-input"
                      value={formData.address}
                      onChange={handleInputChange}
                      disabled={!editMode}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">City</label>
                    <input
                      type="text"
                      name="city"
                      className="form-input"
                      value={formData.city}
                      onChange={handleInputChange}
                      disabled={!editMode}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">State</label>
                    <input
                      type="text"
                      name="state"
                      className="form-input"
                      value={formData.state}
                      onChange={handleInputChange}
                      disabled={!editMode}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">PIN Code</label>
                    <input
                      type="text"
                      name="pincode"
                      className={`form-input ${validationErrors.pincode ? 'error' : ''}`}
                      value={formData.pincode}
                      onChange={handleInputChange}
                      disabled={!editMode}
                      placeholder="6 digit PIN"
                      maxLength={6}
                      inputMode="numeric"
                      pattern="[0-9]*"
                    />
                    {validationErrors.pincode && editMode && (
                      <span className="form-error">{validationErrors.pincode}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Selfie Modal */}
      {showSelfieModal && (
        <div className="modal-overlay" onClick={() => setShowSelfieModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Update Profile Photo</h3>
              <button className="modal-close" onClick={() => setShowSelfieModal(false)}>&times;</button>
            </div>
            <div className="modal-body">
              {!capturedImage ? (
                <div className="webcam-container">
                  <Webcam
                    audio={false}
                    ref={webcamRef}
                    screenshotFormat="image/jpeg"
                    videoConstraints={{ facingMode: 'user' }}
                    className="webcam-preview"
                  />
                </div>
              ) : (
                <div className="captured-preview">
                  <img src={capturedImage} alt="Captured" />
                </div>
              )}
            </div>
            <div className="modal-footer">
              {!capturedImage ? (
                <button className="btn btn-primary" onClick={captureSelfie}>
                  <FiCamera /> Capture Photo
                </button>
              ) : (
                <>
                  <button className="btn btn-secondary" onClick={() => setCapturedImage(null)}>
                    Retake
                  </button>
                  <button className="btn btn-success" onClick={uploadSelfie} disabled={loading}>
                    {loading ? <span className="spinner"></span> : <><FiCheck /> Save Photo</>}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
