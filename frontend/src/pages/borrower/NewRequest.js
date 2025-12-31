import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loansAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { FiCreditCard, FiClock, FiFileText, FiArrowLeft } from 'react-icons/fi';
import './NewRequest.css';

const NewRequest = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    amount: '',
    duration: '30',
    purpose: '',
    description: ''
  });

  const purposes = [
    'Medical Emergency',
    'Education',
    'Business',
    'Home Repair',
    'Travel',
    'Wedding',
    'Other'
  ];

  const durations = [
    { value: '7', label: '7 Days' },
    { value: '15', label: '15 Days' },
    { value: '30', label: '30 Days' },
    { value: '60', label: '60 Days' },
    { value: '90', label: '90 Days' }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.amount || !formData.purpose) {
      toast.error('Please fill all required fields');
      return;
    }

    if (parseFloat(formData.amount) < 1000) {
      toast.error('Minimum loan amount is ₹1,000');
      return;
    }

    if (parseFloat(formData.amount) > 100000) {
      toast.error('Maximum loan amount is ₹1,00,000');
      return;
    }

    setLoading(true);
    try {
      await loansAPI.createRequest(formData);
      toast.success('Loan request submitted successfully!');
      navigate('/borrower/my-loans');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="new-request-page">
      <div className="page-header">
        <button className="btn btn-link" onClick={() => navigate('/borrower')}>
          <FiArrowLeft /> Back to Dashboard
        </button>
        <div>
          <h1 className="page-title">Request Money</h1>
          <p className="page-subtitle">Fill in the details to create a new loan request</p>
        </div>
      </div>

      <div className="request-form-container">
        <form onSubmit={handleSubmit} className="request-form">
          <div className="form-section">
            <h3 className="section-title">
              <FiCreditCard /> Loan Details
            </h3>

            <div className="form-group">
              <label className="form-label">
                Loan Amount <span className="required">*</span>
              </label>
              <div className="input-with-icon">
                <span className="input-icon">₹</span>
                <input
                  type="number"
                  name="amount"
                  className="form-input"
                  placeholder="Enter amount (₹1,000 - ₹1,00,000)"
                  value={formData.amount}
                  onChange={handleChange}
                  min="1000"
                  max="100000"
                  required
                />
              </div>
              <small className="form-hint">Enter the amount you need to borrow</small>
            </div>

            <div className="form-group">
              <label className="form-label">
                Loan Duration <span className="required">*</span>
              </label>
              <div className="input-with-icon">
                <span className="input-icon"><FiClock /></span>
                <select
                  name="duration"
                  className="form-select"
                  value={formData.duration}
                  onChange={handleChange}
                  required
                >
                  {durations.map(d => (
                    <option key={d.value} value={d.value}>{d.label}</option>
                  ))}
                </select>
              </div>
              <small className="form-hint">Choose how long you need the loan</small>
            </div>
          </div>

          <div className="form-section">
            <h3 className="section-title">
              <FiFileText /> Purpose & Description
            </h3>

            <div className="form-group">
              <label className="form-label">
                Purpose <span className="required">*</span>
              </label>
              <select
                name="purpose"
                className="form-select"
                value={formData.purpose}
                onChange={handleChange}
                required
              >
                <option value="">Select purpose</option>
                {purposes.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
              <small className="form-hint">Select the reason for this loan</small>
            </div>

            <div className="form-group">
              <label className="form-label">Description (Optional)</label>
              <textarea
                name="description"
                className="form-textarea"
                placeholder="Provide additional details about your loan request..."
                value={formData.description}
                onChange={handleChange}
                rows="4"
              />
              <small className="form-hint">Add any additional information that might help lenders understand your request</small>
            </div>
          </div>

          <div className="form-actions">
            <button 
              type="button" 
              className="btn btn-secondary"
              onClick={() => navigate('/borrower')}
              disabled={loading}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner"></span> Submitting...
                </>
              ) : (
                'Submit Request'
              )}
            </button>
          </div>
        </form>

        <div className="request-info">
          <div className="info-card">
            <h4>📋 Loan Request Guidelines</h4>
            <ul>
              <li>Minimum loan amount: ₹1,000</li>
              <li>Maximum loan amount: ₹1,00,000</li>
              <li>Loan duration: 7 to 90 days</li>
              <li>Your trust score affects approval chances</li>
              <li>Be clear and honest in your description</li>
            </ul>
          </div>

          <div className="info-card">
            <h4>⚡ Quick Tips</h4>
            <ul>
              <li>Higher trust scores get faster approvals</li>
              <li>Complete your profile verification</li>
              <li>Provide accurate information</li>
              <li>Respond promptly to lender queries</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewRequest;
