import React, { useState, useEffect } from 'react';
import { adminAPI, reportsAPI, disputesAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { 
  FiAlertTriangle, 
  FiFileText, 
  FiUser, 
  FiCheck, 
  FiX, 
  FiEye,
  FiFilter
} from 'react-icons/fi';
import './Reports.css';

const Reports = () => {
  const [activeTab, setActiveTab] = useState('reports');
  const [reports, setReports] = useState([]);
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedItem, setSelectedItem] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [actionNote, setActionNote] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (activeTab === 'reports') {
      fetchReports();
    } else {
      fetchDisputes();
    }
  }, [activeTab, statusFilter]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const params = statusFilter !== 'all' ? { status: statusFilter } : {};
      const response = await adminAPI.getReports(params);
      setReports(response.data.data?.reports || response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch reports:', error);
      toast.error('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

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
      pending: { class: 'badge-warning', label: 'Pending' },
      open: { class: 'badge-warning', label: 'Open' },
      investigating: { class: 'badge-info', label: 'Investigating' },
      under_review: { class: 'badge-info', label: 'Under Review' },
      resolved: { class: 'badge-success', label: 'Resolved' },
      dismissed: { class: 'badge-gray', label: 'Dismissed' },
      closed: { class: 'badge-gray', label: 'Closed' }
    };
    return badges[status] || { class: 'badge-gray', label: status };
  };

  const handleResolve = async (action) => {
    if (!selectedItem) return;
    
    setActionLoading(true);
    try {
      if (activeTab === 'reports') {
        await adminAPI.resolveReport(selectedItem.id, { 
          status: action,
          adminNotes: actionNote 
        });
      } else {
        await adminAPI.resolveDispute(selectedItem.id, { 
          status: action,
          adminNote: actionNote 
        });
      }
      
      toast.success(`${activeTab === 'reports' ? 'Report' : 'Dispute'} ${action === 'resolved' ? 'resolved' : 'dismissed'} successfully`);
      setShowModal(false);
      setSelectedItem(null);
      setActionNote('');
      
      if (activeTab === 'reports') {
        fetchReports();
      } else {
        fetchDisputes();
      }
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

  const data = activeTab === 'reports' ? reports : disputes;

  return (
    <div className="reports-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Reports & Disputes</h1>
          <p className="page-subtitle">Manage user reports and dispute resolution</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs-container">
        <div className="tabs">
          <button 
            className={`tab ${activeTab === 'reports' ? 'active' : ''}`}
            onClick={() => setActiveTab('reports')}
          >
            <FiAlertTriangle />
            Reports
            {reports.filter(r => r.status === 'pending').length > 0 && (
              <span className="tab-badge">{reports.filter(r => r.status === 'pending').length}</span>
            )}
          </button>
          <button 
            className={`tab ${activeTab === 'disputes' ? 'active' : ''}`}
            onClick={() => setActiveTab('disputes')}
          >
            <FiFileText />
            Disputes
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
            <option value={activeTab === 'reports' ? 'pending' : 'open'}>
              {activeTab === 'reports' ? 'Pending' : 'Open'}
            </option>
            <option value="investigating">Investigating</option>
            <option value="resolved">Resolved</option>
            <option value={activeTab === 'reports' ? 'dismissed' : 'closed'}>
              {activeTab === 'reports' ? 'Dismissed' : 'Closed'}
            </option>
          </select>
        </div>
      </div>

      {/* Content */}
      <div className="card">
        {loading ? (
          <div className="loading-container">
            <div className="spinner"></div>
          </div>
        ) : data.length === 0 ? (
          <div className="empty-state">
            {activeTab === 'reports' ? <FiAlertTriangle size={48} /> : <FiFileText size={48} />}
            <h3>No {activeTab} found</h3>
            <p>There are no {statusFilter !== 'all' ? statusFilter : ''} {activeTab} at this time.</p>
          </div>
        ) : (
          <div className="items-list">
            {data.map((item) => {
              const status = getStatusBadge(item.status);
              return (
                <div key={item.id} className="item-card">
                  <div className="item-header">
                    <div className="item-type">
                      {activeTab === 'reports' ? (
                        <span className="type-badge report">{item.reportType || 'General'}</span>
                      ) : (
                        <span className="type-badge dispute">{item.disputeType || 'Loan Dispute'}</span>
                      )}
                      <span className={`badge ${status.class}`}>{status.label}</span>
                    </div>
                    <span className="item-date">{new Date(item.createdAt).toLocaleDateString()}</span>
                  </div>

                  <div className="item-body">
                    <p className="item-description">{item.description || item.reason}</p>
                    
                    <div className="item-users">
                      <div className="user-info">
                        <FiUser />
                        <span>
                          <strong>Reporter:</strong> {item.reporter?.firstName} {item.reporter?.lastName}
                        </span>
                      </div>
                      {item.reportedUser && (
                        <div className="user-info">
                          <FiUser />
                          <span>
                            <strong>Reported:</strong> {item.reportedUser?.firstName} {item.reportedUser?.lastName}
                          </span>
                        </div>
                      )}
                      {item.loan && (
                        <div className="loan-info">
                          <strong>Loan Amount:</strong> ₹{item.loan.amount?.toLocaleString()}
                        </div>
                      )}
                    </div>

                    {item.evidence && (
                      <div className="evidence-section">
                        <strong>Evidence:</strong>
                        <div className="evidence-files">
                          {item.evidence.map((file, idx) => (
                            <a key={idx} href={`http://localhost:5000${file}`} target="_blank" rel="noopener noreferrer">
                              View File {idx + 1}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    {item.adminNote && (
                      <div className="admin-note">
                        <strong>Admin Note:</strong>
                        <p>{item.adminNote}</p>
                      </div>
                    )}
                  </div>

                  <div className="item-actions">
                    <button className="btn btn-outline" onClick={() => openModal(item)}>
                      <FiEye /> View Details
                    </button>
                    {(item.status === 'pending' || item.status === 'open') && (
                      <>
                        <button 
                          className="btn btn-success"
                          onClick={() => {
                            setSelectedItem(item);
                            handleResolve('resolved');
                          }}
                        >
                          <FiCheck /> Resolve
                        </button>
                        <button 
                          className="btn btn-secondary"
                          onClick={() => {
                            setSelectedItem(item);
                            handleResolve('dismissed');
                          }}
                        >
                          <FiX /> Dismiss
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {showModal && selectedItem && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="report-detail-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">
                {activeTab === 'reports' ? 'Report' : 'Dispute'} Details
              </h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            
            <div className="modal-body">
              {/* Status & Type Header */}
              <div className="report-header-row">
                <div className="report-type-box">
                  <span className="type-label">
                    {activeTab === 'reports' ? 'Report Type' : 'Dispute Type'}
                  </span>
                  <span className="type-value">
                    {selectedItem.reportType || selectedItem.disputeType || 'General'}
                  </span>
                </div>
                <span className={`status-badge-lg ${getStatusBadge(selectedItem.status).class}`}>
                  {getStatusBadge(selectedItem.status).label}
                </span>
              </div>

              {/* Description */}
              <div className="report-field">
                <label className="field-label">Description</label>
                <p className="field-value description">
                  {selectedItem.description || selectedItem.reason || 'No description provided'}
                </p>
              </div>

              {/* Users Grid */}
              <div className="report-users-grid">
                <div className="report-user-card">
                  <label className="field-label">Reporter</label>
                  <div className="user-card-content reporter">
                    <div className="user-initials">
                      {selectedItem.reporter?.firstName?.[0] || 'U'}{selectedItem.reporter?.lastName?.[0] || 'U'}
                    </div>
                    <div className="user-info">
                      <span className="user-name">
                        {selectedItem.reporter?.firstName || 'Unknown'} {selectedItem.reporter?.lastName || 'User'}
                      </span>
                      <span className="user-email">{selectedItem.reporter?.email || 'No email provided'}</span>
                      {selectedItem.reporter?.phone && (
                        <span className="user-phone">{selectedItem.reporter.phone}</span>
                      )}
                    </div>
                  </div>
                </div>

                {selectedItem.reportedUser && (
                  <div className="report-user-card">
                    <label className="field-label">Reported User</label>
                    <div className="user-card-content reported">
                      <div className="user-initials">
                        {selectedItem.reportedUser?.firstName?.[0] || 'U'}{selectedItem.reportedUser?.lastName?.[0] || 'U'}
                      </div>
                      <div className="user-info">
                        <span className="user-name">
                          {selectedItem.reportedUser?.firstName || 'Unknown'} {selectedItem.reportedUser?.lastName || 'User'}
                        </span>
                        <span className="user-email">{selectedItem.reportedUser?.email || 'No email provided'}</span>
                        {selectedItem.reportedUser?.phone && (
                          <span className="user-phone">{selectedItem.reportedUser.phone}</span>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Loan Info if exists */}
              {selectedItem.loan && (
                <div className="report-field">
                  <label className="field-label">Related Loan</label>
                  <div className="loan-info-box">
                    <div className="loan-amount-display">₹{selectedItem.loan.amount?.toLocaleString()}</div>
                    {selectedItem.loan.purpose && (
                      <div className="loan-purpose">Purpose: {selectedItem.loan.purpose}</div>
                    )}
                    {selectedItem.loan.id && (
                      <div className="loan-id">Loan ID: {selectedItem.loan.id}</div>
                    )}
                  </div>
                </div>
              )}

              {/* Evidence Section */}
              {selectedItem.evidence && selectedItem.evidence.length > 0 && (
                <div className="report-field">
                  <label className="field-label">Evidence Files</label>
                  <div className="evidence-grid">
                    {selectedItem.evidence.map((file, idx) => (
                      <a 
                        key={idx} 
                        href={`http://localhost:5000${file}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="evidence-link"
                      >
                        <FiFileText />
                        View Evidence {idx + 1}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Date Information */}
              <div className="report-field">
                <label className="field-label">Report Details</label>
                <div className="report-details-grid">
                  <div className="detail-box">
                    <span className="detail-label">Submitted</span>
                    <span className="detail-value">
                      {new Date(selectedItem.createdAt).toLocaleDateString()} at{' '}
                      {new Date(selectedItem.createdAt).toLocaleTimeString()}
                    </span>
                  </div>
                  {selectedItem.updatedAt && selectedItem.updatedAt !== selectedItem.createdAt && (
                    <div className="detail-box">
                      <span className="detail-label">Last Updated</span>
                      <span className="detail-value">
                        {new Date(selectedItem.updatedAt).toLocaleDateString()} at{' '}
                        {new Date(selectedItem.updatedAt).toLocaleTimeString()}
                      </span>
                    </div>
                  )}
                  {selectedItem.id && (
                    <div className="detail-box">
                      <span className="detail-label">
                        {activeTab === 'reports' ? 'Report' : 'Dispute'} ID
                      </span>
                      <span className="detail-value id-value">{selectedItem.id}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Existing Admin Note Display */}
              {selectedItem.adminNote && selectedItem.adminNote.trim() && (
                <div className="report-field">
                  <label className="field-label">Admin Note</label>
                  <div className="admin-note-display">
                    <p>{selectedItem.adminNote}</p>
                  </div>
                </div>
              )}

              {/* Admin Note Input for pending items */}
              {(selectedItem.status === 'pending' || selectedItem.status === 'open') && (
                <div className="report-field">
                  <label className="field-label">Admin Note (Optional)</label>
                  <textarea
                    className="admin-note-input"
                    placeholder="Add a note about your decision..."
                    value={actionNote}
                    onChange={(e) => setActionNote(e.target.value)}
                    rows={3}
                  />
                </div>
              )}
            </div>
            
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>
                Close
              </button>
              {(selectedItem.status === 'pending' || selectedItem.status === 'open') && (
                <>
                  <button 
                    className="btn btn-outline-danger"
                    onClick={() => handleResolve('dismissed')}
                    disabled={actionLoading}
                  >
                    <FiX /> Dismiss
                  </button>
                  <button 
                    className="btn btn-success"
                    onClick={() => handleResolve('resolved')}
                    disabled={actionLoading}
                  >
                    {actionLoading ? (
                      <>
                        <span className="spinner"></span>
                        Processing...
                      </>
                    ) : (
                      <>
                        <FiCheck /> Resolve
                      </>
                    )}
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

export default Reports;
