import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { reportsAPI, loansAPI, adminAPI } from '../../services/api';
import { isDemoMode, demoAllUsers } from '../../services/demoData';
import { toast } from 'react-toastify';
import { FiAlertTriangle, FiUser, FiArrowLeft, FiSend } from 'react-icons/fi';
import './ReportUser.css';

const ReportUser = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [reportedUser, setReportedUser] = useState(null);
  const [formData, setFormData] = useState({
    reportType: '',
    description: '',
    loanId: ''
  });
  const [loans, setLoans] = useState([]);

  const reportTypes = [
    { value: 'fraud', label: 'Fraud / Scam', description: 'Suspicious activity or attempted fraud' },
    { value: 'harassment', label: 'Harassment', description: 'Threatening or abusive behavior' },
    { value: 'fake_profile', label: 'Fake Profile', description: 'False identity or fake documents' },
    { value: 'non_payment', label: 'Non-Payment', description: 'Failure to repay or honor agreement' },
    { value: 'payment_issue', label: 'Payment Issue', description: 'Problems with payment or transactions' },
    { value: 'inappropriate', label: 'Inappropriate Behavior', description: 'Unprofessional or inappropriate conduct' },
    { value: 'other', label: 'Other', description: 'Other issues not listed above' }
  ];

  useEffect(() => {
    fetchUserDetails();
    fetchRelatedLoans();
  }, [userId]);

  const fetchUserDetails = async () => {
    setLoading(true);
    try {
      if (isDemoMode()) {
        // In demo mode, find user from demoAllUsers
        const demoUser = demoAllUsers.find(u => u.id === userId);
        if (demoUser) {
          setReportedUser(demoUser);
        } else {
          // Fallback for demo borrower IDs
          setReportedUser({
            id: userId,
            firstName: 'Demo',
            lastName: 'User',
          });
        }
      } else {
        // Real API call
        const response = await adminAPI.getUserDetails(userId);
        setReportedUser(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch user details:', error);
      // Fallback
      setReportedUser({
        id: userId,
        firstName: 'User',
        lastName: '',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedLoans = async () => {
    try {
      // Fetch loans that involve this user
      const response = user?.role === 'lender' 
        ? await loansAPI.getMyLending()
        : await loansAPI.getMyLoans();
      
      const allLoans = response.data.data?.loans || response.data.data || [];
      // Filter loans related to the reported user
      const relatedLoans = allLoans.filter(loan => 
        loan.borrowerId === userId || 
        loan.lenderId === userId ||
        loan.Borrower?.id === userId ||
        loan.Lender?.id === userId
      );
      setLoans(relatedLoans);
    } catch (error) {
      console.error('Failed to fetch loans:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.reportType) {
      toast.error('Please select a report type');
      return;
    }
    
    if (!formData.description.trim()) {
      toast.error('Please provide a description of the issue');
      return;
    }

    if (formData.description.trim().length < 20) {
      toast.error('Please provide a more detailed description (at least 20 characters)');
      return;
    }

    setSubmitting(true);
    try {
      await reportsAPI.create({
        reportedUserId: userId,
        reportType: formData.reportType,
        description: formData.description,
        loanId: formData.loanId || undefined
      });
      
      toast.success('Report submitted successfully! Our team will review it shortly.');
      navigate(-1); // Go back to previous page
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit report');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="report-user-page">
      <div className="page-header">
        <button className="btn btn-back" onClick={() => navigate(-1)}>
          <FiArrowLeft /> Back
        </button>
        <div>
          <h1 className="page-title">
            <FiAlertTriangle className="title-icon" /> Report User
          </h1>
          <p className="page-subtitle">Submit a report about inappropriate behavior or issues</p>
        </div>
      </div>

      <div className="report-form-container">
        <div className="warning-banner">
          <FiAlertTriangle />
          <div>
            <strong>Important:</strong> Please only submit reports for genuine issues. 
            False reports may result in action against your account.
          </div>
        </div>

        <form onSubmit={handleSubmit} className="report-form">
          {/* Reported User Info */}
          <div className="form-section">
            <h3><FiUser /> Reporting User</h3>
            <div className="reported-user-card">
              <div className="user-avatar">
                {reportedUser?.firstName?.[0] || 'U'}
              </div>
              <div className="user-info">
                <p className="user-name">
                  {reportedUser?.firstName} {reportedUser?.lastName}
                </p>
                <p className="user-id">ID: {userId}</p>
              </div>
            </div>
          </div>

          {/* Report Type Selection */}
          <div className="form-section">
            <h3>What would you like to report?</h3>
            <div className="report-types-grid">
              {reportTypes.map((type) => (
                <label 
                  key={type.value} 
                  className={`report-type-option ${formData.reportType === type.value ? 'selected' : ''}`}
                >
                  <input
                    type="radio"
                    name="reportType"
                    value={type.value}
                    checked={formData.reportType === type.value}
                    onChange={handleInputChange}
                  />
                  <div className="option-content">
                    <span className="option-label">{type.label}</span>
                    <span className="option-description">{type.description}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Related Loan (Optional) */}
          {loans.length > 0 && (
            <div className="form-section">
              <h3>Related Loan (Optional)</h3>
              <select
                name="loanId"
                value={formData.loanId}
                onChange={handleInputChange}
                className="form-control"
              >
                <option value="">-- Select a loan if applicable --</option>
                {loans.map((loan) => (
                  <option key={loan.id} value={loan.id}>
                    ₹{loan.amount?.toLocaleString('en-IN')} - {loan.purpose || 'Loan'} ({loan.status})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Description */}
          <div className="form-section">
            <h3>Describe the Issue</h3>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Please provide detailed information about the issue. Include dates, specific incidents, and any relevant context that will help us investigate."
              rows={6}
              className="form-control"
              required
            />
            <p className="input-hint">
              Minimum 20 characters. Be specific and include relevant details.
            </p>
          </div>

          {/* Submit Button */}
          <div className="form-actions">
            <button 
              type="button" 
              className="btn btn-secondary"
              onClick={() => navigate(-1)}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn btn-danger"
              disabled={submitting}
            >
              {submitting ? (
                'Submitting...'
              ) : (
                <>
                  <FiSend /> Submit Report
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReportUser;
