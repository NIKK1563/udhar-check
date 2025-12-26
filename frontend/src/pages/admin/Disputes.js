import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { 
  FiFileText, 
  FiUser, 
  FiCheck, 
  FiX, 
  FiEye,
  FiMessageSquare
} from 'react-icons/fi';
import './Reports.css';

const AdminDisputes = () => {
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedItem, setSelectedItem] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [actionNote, setActionNote] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchDisputes();
  }, [statusFilter]);

  const fetchDisputes = async () => {
    try {
      setLoading(true);
      const params = statusFilter !== 'all' ? { status: statusFilter } : {};
      const response = await adminAPI.getDisputes(params);
      setDisputes(response.data.data?.disputes || response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch disputes:', error);
      toast.error('Failed to load disputes');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      open: { class: 'badge-warning', label: 'Open' },
      investigating: { class: 'badge-info', label: 'Investigating' },
      under_review: { class: 'badge-info', label: 'Under Review' },
      resolved: { class: 'badge-success', label: 'Resolved' },
      closed: { class: 'badge-gray', label: 'Closed' }
    };
    return badges[status] || { class: 'badge-gray', label: status };
  };

  const handleResolve = async (action) => {
    if (!selectedItem) return;
    
    setActionLoading(true);
    try {
      await adminAPI.resolveDispute(selectedItem.id, { 
        status: action,
        adminNote: actionNote 
      });
      
      toast.success(`Dispute ${action === 'resolved' ? 'resolved' : 'closed'} successfully`);
      setShowModal(false);
      setSelectedItem(null);
      setActionNote('');
      fetchDisputes();
    } catch (error) {
      toast.error('Failed to update status');
    } finally {
      setActionLoading(false);
    }
  };

  const openModal = (item) => {
    setSelectedItem(item);
    setShowModal(true);
  };

  return (
    <div className="reports-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Dispute Management</h1>
          <p className="page-subtitle">Handle and resolve disputes between lenders and borrowers</p>
        </div>
      </div>

      {/* Filters */}
      <div className="tabs-container">
        <div className="tabs">
          <button 
            className={`tab ${statusFilter === 'all' ? 'active' : ''}`}
            onClick={() => setStatusFilter('all')}
          >
            <FiFileText />
            All Disputes
          </button>
          <button 
            className={`tab ${statusFilter === 'open' ? 'active' : ''}`}
            onClick={() => setStatusFilter('open')}
          >
            <FiMessageSquare />
            Open
            {disputes.filter(d => d.status === 'open').length > 0 && (
              <span className="tab-badge">{disputes.filter(d => d.status === 'open').length}</span>
            )}
          </button>
        </div>

        <div className="filter-controls">
          <select
            className="form-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="open">Open</option>
            <option value="investigating">Investigating</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
        </div>
      </div>

      {/* Content */}
      <div className="card">
        {loading ? (
          <div className="loading-container">
            <div className="spinner"></div>
          </div>
        ) : disputes.length === 0 ? (
          <div className="empty-state">
            <FiFileText size={48} />
            <h3>No disputes found</h3>
            <p>There are no {statusFilter !== 'all' ? statusFilter : ''} disputes at this time.</p>
          </div>
        ) : (
          <div className="items-list">
            {disputes.map((item) => {
              const status = getStatusBadge(item.status);
              return (
                <div key={item.id} className="item-card">
                  <div className="item-header">
                    <div className="item-type">
                      <span className="type-badge dispute">{item.disputeType || item.type || 'Loan Dispute'}</span>
                      <span className={`badge ${status.class}`}>{status.label}</span>
                    </div>
                    <span className="item-date">{new Date(item.createdAt).toLocaleDateString()}</span>
                  </div>

                  <div className="item-body">
                    <h4 className="item-title">{item.title || 'Dispute'}</h4>
                    <p className="item-description">{item.description || item.reason}</p>
                  </div>

                  <div className="item-users">
                    <div className="user-info">
                      <FiUser />
                      <div>
                        <span className="label">Raised by:</span>
                        <span className="name">
                          {item.raisedBy?.firstName} {item.raisedBy?.lastName}
                        </span>
                      </div>
                    </div>
                    {item.loan && (
                      <div className="user-info">
                        <FiFileText />
                        <div>
                          <span className="label">Loan Amount:</span>
                          <span className="name">₹{item.loan?.amount?.toLocaleString()}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="item-footer">
                    <span className="item-id">ID: {item.id}</span>
                    <button className="btn btn-sm btn-primary" onClick={() => openModal(item)}>
                      <FiEye /> Review
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Review Modal */}
      {showModal && selectedItem && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Review Dispute</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="detail-section">
                <h4>Dispute Details</h4>
                <div className="detail-row">
                  <span className="label">Type:</span>
                  <span className="value">{selectedItem.disputeType || selectedItem.type}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Status:</span>
                  <span className={`badge ${getStatusBadge(selectedItem.status).class}`}>
                    {getStatusBadge(selectedItem.status).label}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="label">Raised by:</span>
                  <span className="value">
                    {selectedItem.raisedBy?.firstName} {selectedItem.raisedBy?.lastName}
                  </span>
                </div>
                <div className="detail-row full-width">
                  <span className="label">Description:</span>
                  <p className="value">{selectedItem.description || selectedItem.reason}</p>
                </div>
              </div>

              {selectedItem.loan && (
                <div className="detail-section">
                  <h4>Related Loan</h4>
                  <div className="detail-row">
                    <span className="label">Amount:</span>
                    <span className="value">₹{selectedItem.loan?.amount?.toLocaleString()}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Borrower:</span>
                    <span className="value">
                      {selectedItem.loan?.borrower?.firstName} {selectedItem.loan?.borrower?.lastName}
                    </span>
                  </div>
                </div>
              )}

              {selectedItem.status !== 'resolved' && selectedItem.status !== 'closed' && (
                <div className="action-section">
                  <h4>Admin Action</h4>
                  <textarea
                    className="form-input"
                    placeholder="Add resolution notes..."
                    value={actionNote}
                    onChange={(e) => setActionNote(e.target.value)}
                    rows={3}
                  />
                  <div className="action-buttons">
                    <button 
                      className="btn btn-success"
                      onClick={() => handleResolve('resolved')}
                      disabled={actionLoading}
                    >
                      <FiCheck /> Resolve
                    </button>
                    <button 
                      className="btn btn-gray"
                      onClick={() => handleResolve('closed')}
                      disabled={actionLoading}
                    >
                      <FiX /> Close
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDisputes;
