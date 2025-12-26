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
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [showCameraMode, setShowCameraMode] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const webcamRef = useRef(null);
  const fileInputRef = useRef(null);
  
  // Verification states
  const [showEmailVerify, setShowEmailVerify] = useState(false);
  const [showPhoneVerify, setShowPhoneVerify] = useState(false);
  const [emailCode, setEmailCode] = useState('');
  const [phoneCode, setPhoneCode] = useState('');
  const [verificationLoading, setVerificationLoading] = useState(false);

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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
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

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCapturedImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadProfilePicture = async () => {
    if (!capturedImage) return;

    setLoading(true);
    try {
      // Convert base64 to blob
      const response = await fetch(capturedImage);
      const blob = await response.blob();
      const file = new File([blob], 'profile-picture.jpg', { type: 'image/jpeg' });

      const formData = new FormData();
      formData.append('profilePhoto', file);

      const result = await authAPI.uploadProfilePicture(formData);
      updateUser(result.data.data);
      toast.success('Profile picture updated successfully!');
      setShowPhotoModal(false);
      setShowCameraMode(false);
      setCapturedImage(null);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to upload profile picture');
    } finally {
      setLoading(false);
    }
  };

  const closePhotoModal = () => {
    setShowPhotoModal(false);
    setShowCameraMode(false);
    setCapturedImage(null);
  };

  const handleSendEmailVerification = async () => {
    setVerificationLoading(true);
    try {
      const response = await authAPI.sendEmailVerification();
      toast.success(response.data.message || 'Verification code sent to your email');
      setShowEmailVerify(true);
      // Show code in development mode
      if (response.data.code) {
        toast.info(`Development mode - Code: ${response.data.code}`, { autoClose: 10000 });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send verification code');
    } finally {
      setVerificationLoading(false);
    }
  };

  const handleVerifyEmail = async (e) => {
    e.preventDefault();
    if (emailCode.length !== 6) {
      toast.error('Please enter a 6-digit code');
      return;
    }
    
    setVerificationLoading(true);
    try {
      const response = await authAPI.verifyEmail({ code: emailCode });
      updateUser(response.data.data);
      toast.success('Email verified successfully!');
      setShowEmailVerify(false);
      setEmailCode('');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to verify email');
    } finally {
      setVerificationLoading(false);
    }
  };

  const handleSendPhoneVerification = async () => {
    setVerificationLoading(true);
    try {
      const response = await authAPI.sendPhoneVerification();
      toast.success(response.data.message || 'Verification code sent to your phone');
      setShowPhoneVerify(true);
      // Show code in development mode
      if (response.data.code) {
        toast.info(`Development mode - Code: ${response.data.code}`, { autoClose: 10000 });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send verification code');
    } finally {
      setVerificationLoading(false);
    }
  };

  const handleVerifyPhone = async (e) => {
    e.preventDefault();
    if (phoneCode.length !== 6) {
      toast.error('Please enter a 6-digit code');
      return;
    }
    
    setVerificationLoading(true);
    try {
      const response = await authAPI.verifyPhone({ code: phoneCode });
      updateUser(response.data.data);
      toast.success('Phone verified successfully!');
      setShowPhoneVerify(false);
      setPhoneCode('');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to verify phone');
    } finally {
      setVerificationLoading(false);
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
              {user?.profilePhoto ? (
                <img src={`http://localhost:5000${user.profilePhoto}`} alt="Profile" />
              ) : user?.selfiePhoto ? (
                <img src={`http://localhost:5000${user.selfiePhoto}`} alt="Profile" />
              ) : (
                <div className="photo-placeholder">
                  <FiUser size={48} />
                </div>
              )}
              <button 
                className="photo-edit-btn" 
                onClick={() => setShowPhotoModal(true)}
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
                {user?.emailVerified ? (
                  <FiCheck className="check" />
                ) : (
                  <button 
                    className="verify-btn"
                    onClick={handleSendEmailVerification}
                    disabled={verificationLoading}
                  >
                    Verify
                  </button>
                )}
              </div>
              <div className={`verification-item ${user?.phoneVerified ? 'verified' : ''}`}>
                <FiPhone />
                <span>Phone</span>
                {user?.phoneVerified ? (
                  <FiCheck className="check" />
                ) : (
                  <button 
                    className="verify-btn"
                    onClick={handleSendPhoneVerification}
                    disabled={verificationLoading}
                  >
                    Verify
                  </button>
                )}
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
                      className="form-input"
                      value={formData.phone}
                      onChange={handleInputChange}
                      disabled={!editMode}
                    />
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
                      className="form-input"
                      value={formData.pincode}
                      onChange={handleInputChange}
                      disabled={!editMode}
                    />
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Photo Upload Modal */}
      {showPhotoModal && (
        <div className="modal-overlay" onClick={closePhotoModal}>
          <div className="modal modal-photo" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Update Profile Photo</h3>
              <button className="modal-close" onClick={closePhotoModal}>&times;</button>
            </div>
            <div className="modal-body">
              {!showCameraMode && !capturedImage ? (
                <div className="upload-options">
                  <button 
                    className="upload-option-btn"
                    onClick={() => setShowCameraMode(true)}
                  >
                    <FiCamera size={32} />
                    <span>Take Photo</span>
                  </button>
                  <button 
                    className="upload-option-btn"
                    onClick={() => fileInputRef.current.click()}
                  >
                    <FiUser size={32} />
                    <span>Choose File</span>
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    style={{ display: 'none' }}
                  />
                </div>
              ) : !capturedImage ? (
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
              {showCameraMode && !capturedImage ? (
                <>
                  <button className="btn btn-secondary" onClick={() => setShowCameraMode(false)}>
                    <FiX /> Back
                  </button>
                  <button className="btn btn-primary" onClick={captureSelfie}>
                    <FiCamera /> Capture Photo
                  </button>
                </>
              ) : capturedImage ? (
                <>
                  <button className="btn btn-secondary" onClick={() => {
                    setCapturedImage(null);
                    setShowCameraMode(false);
                  }}>
                    <FiX /> Retake
                  </button>
                  <button className="btn btn-success" onClick={uploadProfilePicture} disabled={loading}>
                    {loading ? <span className="spinner"></span> : <><FiCheck /> Save Photo</>}
                  </button>
                </>
              ) : null}
            </div>
          </div>
        </div>
      )}

      {/* Email Verification Modal */}
      {showEmailVerify && (
        <div className="modal-overlay" onClick={() => setShowEmailVerify(false)}>
          <div className="modal modal-verify" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Verify Email</h3>
              <button className="modal-close" onClick={() => setShowEmailVerify(false)}>&times;</button>
            </div>
            <form onSubmit={handleVerifyEmail}>
              <div className="modal-body">
                <p className="verify-instructions">
                  Enter the 6-digit verification code sent to <strong>{user?.email}</strong>
                </p>
                <input
                  type="text"
                  className="form-input code-input"
                  placeholder="000000"
                  maxLength="6"
                  value={emailCode}
                  onChange={(e) => setEmailCode(e.target.value.replace(/\D/g, ''))}
                  autoFocus
                />
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setShowEmailVerify(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-success" 
                  disabled={verificationLoading || emailCode.length !== 6}
                >
                  {verificationLoading ? <span className="spinner"></span> : <><FiCheck /> Verify</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Phone Verification Modal */}
      {showPhoneVerify && (
        <div className="modal-overlay" onClick={() => setShowPhoneVerify(false)}>
          <div className="modal modal-verify" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Verify Phone</h3>
              <button className="modal-close" onClick={() => setShowPhoneVerify(false)}>&times;</button>
            </div>
            <form onSubmit={handleVerifyPhone}>
              <div className="modal-body">
                <p className="verify-instructions">
                  Enter the 6-digit verification code sent to <strong>{user?.phone}</strong>
                </p>
                <input
                  type="text"
                  className="form-input code-input"
                  placeholder="000000"
                  maxLength="6"
                  value={phoneCode}
                  onChange={(e) => setPhoneCode(e.target.value.replace(/\D/g, ''))}
                  autoFocus
                />
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setShowPhoneVerify(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-success" 
                  disabled={verificationLoading || phoneCode.length !== 6}
                >
                  {verificationLoading ? <span className="spinner"></span> : <><FiCheck /> Verify</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
