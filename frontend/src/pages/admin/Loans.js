

import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { 
  FiUser, 
  FiCalendar,
  FiClock,
  FiCheckCircle,
  FiAlertCircle,
  FiFilter,
  FiEye
} from 'react-icons/fi';
import './Reports.css';

const AdminLoans = () => {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchLoans();
  }, [statusFilter]);

  const fetchLoans = async () => {
    try {
      setLoading(true);
      const params = statusFilter !== 'all' ? { status: statusFilter } : {};
      const response = await adminAPI.getLoans(params);
      setLoans(response.data.data?.loans || response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch loans:', error);
      toast.error('Failed to load loans');
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
      accepted: { class: 'badge-info', label: 'Accepted', icon: FiCheckCircle },
      in_progress: { class: 'badge-primary', label: 'In Progress', icon: FiCheckCircle },
      completed: { class: 'badge-success', label: 'Completed', icon: FiCheckCircle },
      overdue: { class: 'badge-danger', label: 'Overdue', icon: FiAlertCircle },
      defaulted: { class: 'badge-danger', label: 'Defaulted', icon: FiAlertCircle },
      cancelled: { class: 'badge-gray', label: 'Cancelled', icon: null },
      rejected: { class: 'badge-gray', label: 'Rejected', icon: null }
    };
    return badges[status] || { class: 'badge-gray', label: status, icon: null };
  };

  const openModal = (loan) => {
    setSelectedLoan(loan);
    setShowModal(true);
  };

  return (
    <div className="reports-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Loan Management</h1>
          <p className="page-subtitle">View and monitor all loan transactions on the platform</p>
        </div>
      </div>

      {/* Filters */}
      <div className="tabs-container">
        <div className="tabs">
          <button 
            className={`tab ${statusFilter === 'all' ? 'active' : ''}`}
            onClick={() => setStatusFilter('all')}
          >
            <FiEye />
            All Loans
          </button>
          <button 
            className={`tab ${statusFilter === 'in_progress' ? 'active' : ''}`}
            onClick={() => setStatusFilter('in_progress')}
          >
            <FiClock />
            Active
          </button>
          <button 
            className={`tab ${statusFilter === 'completed' ? 'active' : ''}`}
            onClick={() => setStatusFilter('completed')}
          >
            <FiCheckCircle />
            Completed
          </button>
        </div>

        <div className="filter-controls">
          <select
            className="form-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="accepted">Accepted</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="overdue">Overdue</option>
            <option value="defaulted">Defaulted</option>
          </select>
        </div>
      </div>

      {/* Content */}
      <div className="card">
        {loading ? (
          <div className="loading-container">
            <div className="spinner"></div>
          </div>
        ) : loans.length === 0 ? (
          <div className="empty-state">
            <FiCheckCircle size={48} />
            <h3>No loans found</h3>
            <p>There are no {statusFilter !== 'all' ? statusFilter : ''} loans at this time.</p>
          </div>
        ) : (
          <div className="items-list">
            {loans.map((loan) => {
              const status = getStatusBadge(loan.status);
              return (
                <div key={loan.id} className="item-card">
                  <div className="item-header">
                    <div className="item-type">
                      <span className="type-badge loan">{loan.purpose || 'General'}</span>
                      <span className={`badge ${status.class}`}>{status.label}</span>
                    </div>
                    <span className="item-date">{new Date(loan.createdAt).toLocaleDateString()}</span>
                  </div>

                  <div className="item-body">
                    <div className="loan-amount-display">
                      <FiCheckCircle />
                      <span className="amount">{formatCurrency(loan.amount)}</span>
                      {loan.interestRate && (
                        <span className="interest">@ {loan.interestRate}% interest</span>
                      )}
                    </div>
                    <p className="item-description">{loan.description || 'No description provided'}</p>
                  </div>

                  <div className="item-users">
                    <div className="user-info">
                      <FiUser />
                      <div>
                        <span className="label">Borrower:</span>
                        <span className="name">
                          {loan.borrower?.firstName} {loan.borrower?.lastName}
                        </span>
                      </div>
                    </div>
                    {loan.lender && (
                      <div className="user-info">
                        <FiUser />
                        <div>
                          <span className="label">Lender:</span>
                          <span className="name">
                            {loan.lender?.firstName} {loan.lender?.lastName}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="item-footer">
                    <div className="loan-meta">
                      <span><FiCalendar /> Duration: {loan.duration} days</span>
                      {loan.dueDate && (
                        <span><FiClock /> Due: {new Date(loan.dueDate).toLocaleDateString()}</span>
                      )}
                    </div>
                    <button className="btn btn-sm btn-outline" onClick={() => openModal(loan)}>
                      <FiEye /> View Details
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Loan Details Modal */}
      {showModal && selectedLoan && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="loan-detail-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Loan Details</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            
            <div className="modal-body">
              {/* Status & Amount Header */}
              <div className="loan-header-section">
                <div className="loan-amount-box">
                  <span className="amount-label">Loan Amount</span>
                  <span className="amount-value">{formatCurrency(selectedLoan.amount)}</span>
                </div>
                <span className={`status-badge-large ${getStatusBadge(selectedLoan.status).class}`}>
                  {getStatusBadge(selectedLoan.status).label}
                </span>
              </div>

              {/* Loan Details Grid */}
              <div className="loan-details-grid">
                <div className="detail-box">
                  <span className="detail-label">Duration</span>
                  <span className="detail-value">{selectedLoan.duration} days</span>
                </div>
                <div className="detail-box">
                  <span className="detail-label">Interest Rate</span>
                  <span className="detail-value">{selectedLoan.interestRate || 2}%</span>
                </div>
                <div className="detail-box">
                  <span className="detail-label">Purpose</span>
                  <span className="detail-value">{selectedLoan.purpose || 'General'}</span>
                </div>
                <div className="detail-box">
                  <span className="detail-label">Created</span>
                  <span className="detail-value">{new Date(selectedLoan.createdAt).toLocaleDateString()}</span>
                </div>
                {selectedLoan.dueDate && (
                  <div className="detail-box">
                    <span className="detail-label">Due Date</span>
                    <span className="detail-value">{new Date(selectedLoan.dueDate).toLocaleDateString()}</span>
                  </div>
                )}
                {selectedLoan.totalRepayable && (
                  <div className="detail-box">
                    <span className="detail-label">Total Repayable</span>
                    <span className="detail-value">{formatCurrency(selectedLoan.totalRepayable)}</span>
                  </div>
                )}
              </div>

              {/* Borrower & Lender Side by Side */}
              <div className="people-grid">
                {/* Borrower Section */}
                <div className="person-section">
                  <h4 className="person-title">Borrower</h4>
                  <div className="person-card">
                    <div className="person-avatar borrower">
                      {selectedLoan.borrower?.firstName?.[0]}{selectedLoan.borrower?.lastName?.[0]}
                    </div>
                    <div className="person-info">
                      <span className="person-name">
                        {selectedLoan.borrower?.firstName} {selectedLoan.borrower?.lastName}
                      </span>
                      <span className="person-email">{selectedLoan.borrower?.email}</span>
                      {selectedLoan.borrower?.phone && (
                        <span className="person-phone">{selectedLoan.borrower?.phone}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Lender Section */}
                {selectedLoan.lender && (
                  <div className="person-section">
                    <h4 className="person-title">Lender</h4>
                    <div className="person-card">
                      <div className="person-avatar lender">
                        {selectedLoan.lender?.firstName?.[0]}{selectedLoan.lender?.lastName?.[0]}
                      </div>
                      <div className="person-info">
                        <span className="person-name">
                          {selectedLoan.lender?.firstName} {selectedLoan.lender?.lastName}
                        </span>
                        <span className="person-email">{selectedLoan.lender?.email}</span>
                        {selectedLoan.lender?.phone && (
                          <span className="person-phone">{selectedLoan.lender?.phone}</span>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Loan ID */}
              <div className="loan-id-section">
                <span className="id-label">Loan ID</span>
                <span className="id-value">{selectedLoan.id}</span>
              </div>

              {/* Description */}
              {selectedLoan.description && (
                <div className="description-section">
                  <h4 className="description-title">Description</h4>
                  <p className="description-text">{selectedLoan.description}</p>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminLoans;
