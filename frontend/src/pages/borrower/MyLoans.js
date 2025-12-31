import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { loansAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { 
  FiClock, 
  FiFilter, 
  FiPlus,
  FiAlertCircle,
  FiCheck,
  FiCreditCard
} from 'react-icons/fi';
import './MyLoans.css';

const MyLoans = () => {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestForm, setRequestForm] = useState({
    amount: '',
    duration: '30',
    purpose: '',
    description: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchLoans();
  }, []);

  const fetchLoans = async () => {
    try {
      const response = await loansAPI.getMyBorrowings();
      
      // Handle different response structures
      let loansData = [];
      if (response.data.data) {
        if (Array.isArray(response.data.data)) {
          loansData = response.data.data;
        } else if (response.data.data.loans) {
          loansData = response.data.data.loans;
        } else if (response.data.data.requests) {
          loansData = response.data.data.requests;
        }
      }
      
      setLoans(loansData);
    } catch (error) {
      console.error('Failed to fetch loans:', error);
      toast.error('Failed to load loans');
      setLoans([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { class: 'badge-warning', label: 'Pending', icon: FiClock },
      accepted: { class: 'badge-info', label: 'Accepted', icon: FiCheck },
      in_progress: { class: 'badge-primary', label: 'In Progress', icon: FiCreditCard },
      completed: { class: 'badge-success', label: 'Completed', icon: FiCheck },
      overdue: { class: 'badge-danger', label: 'Overdue', icon: FiAlertCircle },
      defaulted: { class: 'badge-danger', label: 'Defaulted', icon: FiAlertCircle },
      rejected: { class: 'badge-gray', label: 'Rejected', icon: null },
      cancelled: { class: 'badge-gray', label: 'Cancelled', icon: null }
    };
    return badges[status] || { class: 'badge-gray', label: status, icon: null };
  };

  const filteredLoans = Array.isArray(loans) ? loans.filter(loan => {
    if (filter === 'all') return true;
    if (filter === 'active') return ['in_progress', 'accepted'].includes(loan.status);
    if (filter === 'pending') return loan.status === 'pending';
    if (filter === 'completed') return loan.status === 'completed';
    if (filter === 'overdue') return ['overdue', 'defaulted'].includes(loan.status);
    return true;
  }) : [];

  const handleConfirmFulfillment = async (loanId) => {
    try {
      await loansAPI.markFulfilled(loanId);
      toast.success('Money receipt confirmed!');
      fetchLoans();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to confirm');
    }
  };

  const handleCancelRequest = async (loanId) => {
    if (!window.confirm('Are you sure you want to cancel this request?')) return;
    
    try {
      await loansAPI.cancelRequest(loanId);
      toast.success('Request cancelled');
      fetchLoans();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to cancel');
    }
  };

  const handleSubmitRequest = async (e) => {
    e.preventDefault();
    if (!requestForm.amount || !requestForm.purpose) {
      toast.error('Please fill all required fields');
      return;
    }

    setSubmitting(true);
    try {
      await loansAPI.createRequest(requestForm);
      toast.success('Loan request submitted successfully!');
      setShowRequestModal(false);
      setRequestForm({ amount: '', duration: '30', purpose: '', description: '' });
      fetchLoans();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit request');
    } finally {
      setSubmitting(false);
    }
  };

  const getDaysRemaining = (dueDate) => {
    if (!dueDate) return null;
    const now = new Date();
    const due = new Date(dueDate);
    const diff = Math.ceil((due - now) / (1000 * 60 * 60 * 24));
    return diff;
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="my-loans-page">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">My Loans</h1>
          <p className="page-subtitle">Track your loan requests and active borrowings</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowRequestModal(true)}>
          <FiPlus /> New Request
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="filter-tabs">
        <button 
          className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All ({loans.length})
        </button>
        <button 
          className={`filter-tab ${filter === 'pending' ? 'active' : ''}`}
          onClick={() => setFilter('pending')}
        >
          Pending ({loans.filter(l => l.status === 'pending').length})
        </button>
        <button 
          className={`filter-tab ${filter === 'active' ? 'active' : ''}`}
          onClick={() => setFilter('active')}
        >
          Active ({loans.filter(l => ['in_progress', 'accepted'].includes(l.status)).length})
        </button>
        <button 
          className={`filter-tab ${filter === 'completed' ? 'active' : ''}`}
          onClick={() => setFilter('completed')}
        >
          Completed ({loans.filter(l => l.status === 'completed').length})
        </button>
        <button 
          className={`filter-tab ${filter === 'overdue' ? 'active' : ''}`}
          onClick={() => setFilter('overdue')}
        >
          Overdue ({loans.filter(l => ['overdue', 'defaulted'].includes(l.status)).length})
        </button>
      </div>

      {/* Loans List */}
      {filteredLoans.length === 0 ? (
        <div className="card">
          <div className="card-body empty-state">
            <FiCreditCard size={48} />
            <h3>No loans found</h3>
            <p>
              {filter === 'all' 
                ? "You haven't made any loan requests yet"
                : `No ${filter} loans at the moment`}
            </p>
            <button className="btn btn-primary" onClick={() => setShowRequestModal(true)}>
              <FiPlus /> Request Money
            </button>
          </div>
        </div>
      ) : (
        <div className="loans-list">
          {filteredLoans.map((loan) => {
            const status = getStatusBadge(loan.status);
            const daysRemaining = getDaysRemaining(loan.dueDate);
            const progress = loan.totalRepayable 
              ? Math.round((parseFloat(loan.amountRepaid || 0) / parseFloat(loan.totalRepayable)) * 100)
              : 0;

            return (
              <div key={loan.id} className="loan-card">
                <div className="loan-card-header">
                  <div className="loan-amount">
                    <h3>{formatCurrency(loan.amount)}</h3>
                    <span className="loan-purpose">{loan.purpose}</span>
                  </div>
                  <span className={`badge ${status.class}`}>
                    {status.icon && <status.icon size={12} />}
                    {status.label}
                  </span>
                </div>

                <div className="loan-card-body">
                  <div className="loan-details-grid">
                    <div className="detail-item">
                      <span className="detail-label">Duration</span>
                      <span className="detail-value">{loan.duration} days</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Interest</span>
                      <span className="detail-value">{loan.interestRate || 0}%</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Total Repayable</span>
                      <span className="detail-value">{formatCurrency(loan.totalRepayable || loan.amount)}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Requested On</span>
                      <span className="detail-value">{new Date(loan.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* Progress Bar for Active Loans */}
                  {loan.status === 'in_progress' && (
                    <div className="repayment-progress">
                      <div className="progress-header">
                        <span>Repayment Progress</span>
                        <span>{formatCurrency(loan.amountRepaid || 0)} / {formatCurrency(loan.totalRepayable)}</span>
                      </div>
                      <div className="progress-bar">
                        <div 
                          className="progress-fill" 
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                      {daysRemaining !== null && (
                        <div className={`days-remaining ${daysRemaining < 0 ? 'overdue' : daysRemaining <= 7 ? 'urgent' : ''}`}>
                          {daysRemaining < 0 
                            ? `Overdue by ${Math.abs(daysRemaining)} days`
                            : `${daysRemaining} days remaining`}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Lender Info if assigned */}
                  {loan.lender && (
                    <div className="lender-info">
                      <div className="lender-avatar">
                        {loan.lender.firstName?.[0]}{loan.lender.lastName?.[0]}
                      </div>
                      <div className="lender-details">
                        <span className="lender-name">{loan.lender.firstName} {loan.lender.lastName}</span>
                        <span className="lender-label">Lender</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="loan-card-footer">
                  {loan.status === 'pending' && (
                    <button 
                      className="btn btn-outline btn-sm"
                      onClick={() => handleCancelRequest(loan.id)}
                    >
                      Cancel Request
                    </button>
                  )}
                  
                  {loan.status === 'accepted' && (
                    <button 
                      className="btn btn-success btn-sm"
                      onClick={() => handleConfirmFulfillment(loan.id)}
                    >
                      <FiCheck /> Confirm Money Received
                    </button>
                  )}
                  
                  <Link to={`/borrower/loan/${loan.id}`} className="btn btn-primary btn-sm">
                    View Details
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Request Modal */}
      {showRequestModal && (
        <div className="modal-overlay" onClick={() => setShowRequestModal(false)}>
          <div className="modal modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Request Money</h3>
              <button className="modal-close" onClick={() => setShowRequestModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleSubmitRequest}>
              <div className="modal-body">
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Amount (₹) *</label>
                    <input
                      type="number"
                      className="form-input"
                      placeholder="Enter amount"
                      value={requestForm.amount}
                      onChange={(e) => setRequestForm({ ...requestForm, amount: e.target.value })}
                      min="100"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Duration (Days) *</label>
                    <select
                      className="form-input form-select"
                      value={requestForm.duration}
                      onChange={(e) => setRequestForm({ ...requestForm, duration: e.target.value })}
                    >
                      <option value="7">7 Days</option>
                      <option value="14">14 Days</option>
                      <option value="30">30 Days</option>
                      <option value="60">60 Days</option>
                      <option value="90">90 Days</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Purpose *</label>
                  <select
                    className="form-input form-select"
                    value={requestForm.purpose}
                    onChange={(e) => setRequestForm({ ...requestForm, purpose: e.target.value })}
                    required
                  >
                    <option value="">Select Purpose</option>
                    <option value="Medical Emergency">Medical Emergency</option>
                    <option value="Education">Education</option>
                    <option value="Business">Business</option>
                    <option value="Personal">Personal</option>
                    <option value="Home Improvement">Home Improvement</option>
                    <option value="Travel">Travel</option>
                    <option value="Debt Consolidation">Debt Consolidation</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Additional Details</label>
                  <textarea
                    className="form-input form-textarea"
                    placeholder="Provide any additional details..."
                    value={requestForm.description}
                    onChange={(e) => setRequestForm({ ...requestForm, description: e.target.value })}
                    rows={4}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowRequestModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? <span className="spinner"></span> : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyLoans;
