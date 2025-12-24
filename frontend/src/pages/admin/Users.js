import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { 
  FiSearch, 
  FiFilter, 
  FiMoreVertical, 
  FiEdit2, 
  FiTrash2,
  FiUserCheck,
  FiUserX,
  FiEye,
  FiShield,
  FiMail
} from 'react-icons/fi';
import './Users.css';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 1
  });
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [actionMenuId, setActionMenuId] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, [pagination.page, roleFilter, statusFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        search: searchTerm,
        role: roleFilter !== 'all' ? roleFilter : undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined
      };
      
      const response = await adminAPI.getUsers(params);
      setUsers(response.data.data?.users || []);
      setPagination(prev => ({
        ...prev,
        total: response.data.data?.total || 0,
        pages: response.data.data?.pages || 1
      }));
    } catch (error) {
      console.error('Failed to fetch users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchUsers();
  };

  const handleVerifyUser = async (userId, verificationType) => {
    try {
      await adminAPI.verifyUser(userId, { type: verificationType, verified: true });
      toast.success('User verified successfully');
      fetchUsers();
    } catch (error) {
      toast.error('Failed to verify user');
    }
    setActionMenuId(null);
  };

  const handleApproveUser = async (userId) => {
    if (!window.confirm('Are you sure you want to approve this user\'s verification?')) return;

    try {
      await adminAPI.approveUserVerification(userId, { approve: true });
      toast.success('User verification approved successfully');
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to approve user');
    }
    setActionMenuId(null);
  };

  const handleRejectUser = async (userId) => {
    const reason = window.prompt('Please enter the reason for rejection:');
    if (!reason || !reason.trim()) {
      toast.error('Rejection reason is required');
      return;
    }

    try {
      await adminAPI.rejectUserVerification(userId, { reason: reason.trim() });
      toast.success('User verification rejected');
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reject user');
    }
    setActionMenuId(null);
  };

  const handleBanUser = async (userId, isBanned) => {
    const action = isBanned ? 'unban' : 'ban';
    if (!window.confirm(`Are you sure you want to ${action} this user?`)) return;

    try {
      const response = await adminAPI.banUser(userId, { banned: !isBanned });
      if (response.data.success) {
        toast.success(`User ${action}ned successfully`);
        // Update user in list without refetching
        setUsers(prevUsers => prevUsers.map(user => 
          user.id === userId ? { ...user, isBlocked: !isBanned } : user
        ));
      } else {
        toast.error(response.data.message || `Failed to ${action} user`);
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || `Failed to ${action} user`;
      toast.error(errorMessage);
      console.error('Ban user error:', error);
    }
    setActionMenuId(null);
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;

    try {
      const response = await adminAPI.deleteUser(userId);
      if (response.data.success) {
        toast.success('User deleted successfully');
        // Remove user from list without refetching
        setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
      } else {
        toast.error(response.data.message || 'Failed to delete user');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to delete user';
      toast.error(errorMessage);
      console.error('Delete user error:', error);
    }
    setActionMenuId(null);
  };

  const viewUserDetails = (user) => {
    setSelectedUser(user);
    setShowUserModal(true);
    setActionMenuId(null);
  };

  const getScoreClass = (score) => {
    if (score >= 70) return 'score-high';
    if (score >= 40) return 'score-medium';
    return 'score-low';
  };

  return (
    <div className="users-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Users</h1>
          <p className="page-subtitle">Manage all platform users</p>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-bar">
        <form onSubmit={handleSearch} className="search-form">
          <div className="search-input-wrapper">
            <FiSearch />
            <input
              type="text"
              placeholder="Search by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-primary">Search</button>
        </form>

        <div className="filter-controls">
          <select
            className="form-select"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="all">All Roles</option>
            <option value="lender">Lenders</option>
            <option value="borrower">Borrowers</option>
            <option value="admin">Admins</option>
          </select>

          <select
            className="form-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="banned">Banned</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="card">
        <div className="table-container">
          {loading ? (
            <div className="loading-container">
              <div className="spinner"></div>
            </div>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Role</th>
                  <th>Trust Score</th>
                  <th>Verification</th>
                  <th>Admin Approval</th>
                  <th>Status</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center">No users found</td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.id}>
                      <td>
                        <div className="user-cell">
                          <div className="user-avatar">
                            {user.selfieUrl ? (
                              <img src={`http://localhost:5000${user.selfieUrl}`} alt="" />
                            ) : (
                              `${user.firstName?.[0]}${user.lastName?.[0]}`
                            )}
                          </div>
                          <div>
                            <strong>{user.firstName} {user.lastName}</strong>
                            <small>{user.email}</small>
                            <small className="phone">{user.phone}</small>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={`role-badge ${user.role}`}>
                          {user.role}
                        </span>
                      </td>
                      <td>
                        <span className={`score-badge ${getScoreClass(user.trustScore)}`}>
                          {user.trustScore || 50}
                        </span>
                      </td>
                      <td>
                        <div className="verification-badges">
                          <span className={`mini-badge ${user.isIdVerified ? 'verified' : ''}`} title="ID Verified">
                            ID
                          </span>
                          <span className={`mini-badge ${user.isFaceVerified ? 'verified' : ''}`} title="Face Verified">
                            Face
                          </span>
                          <span className={`mini-badge ${user.emailVerified ? 'verified' : ''}`} title="Email Verified">
                            Email
                          </span>
                        </div>
                      </td>
                      <td>
                        {user.role !== 'admin' && user.isOnboardingComplete && (
                          <span className={`verification-status ${user.verificationStatus || 'pending'}`}>
                            {user.verificationStatus === 'approved' && '✓ Approved'}
                            {user.verificationStatus === 'rejected' && '✗ Rejected'}
                            {(!user.verificationStatus || user.verificationStatus === 'pending') && '⏳ Pending'}
                          </span>
                        )}
                        {!user.isOnboardingComplete && user.role !== 'admin' && (
                          <span className="verification-status incomplete">Not Completed</span>
                        )}
                      </td>
                      <td>
                        <span className={`status-badge ${user.isBanned ? 'banned' : user.isActive ? 'active' : 'inactive'}`}>
                          {user.isBanned ? 'Banned' : user.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                      <td>
                        <div className="action-menu-container">
                          <button 
                            className="action-btn"
                            onClick={() => setActionMenuId(actionMenuId === user.id ? null : user.id)}
                          >
                            <FiMoreVertical />
                          </button>
                          {actionMenuId === user.id && (
                            <div className="action-menu">
                              <button onClick={() => viewUserDetails(user)}>
                                <FiEye /> View Details
                              </button>
                              {user.isOnboardingComplete && user.verificationStatus === 'pending' && user.role !== 'admin' && (
                                <>
                                  <button className="success" onClick={() => handleApproveUser(user.id)}>
                                    <FiUserCheck /> Approve Verification
                                  </button>
                                  <button className="warning" onClick={() => handleRejectUser(user.id)}>
                                    <FiUserX /> Reject Verification
                                  </button>
                                </>
                              )}
                              <button onClick={() => handleBanUser(user.id, user.isBanned)}>
                                {user.isBanned ? <FiUserCheck /> : <FiUserX />}
                                {user.isBanned ? 'Unban User' : 'Ban User'}
                              </button>
                              <button className="danger" onClick={() => handleDeleteUser(user.id)}>
                                <FiTrash2 /> Delete User
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="pagination">
            <button
              className="pagination-btn"
              disabled={pagination.page === 1}
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
            >
              Previous
            </button>
            <span className="pagination-info">
              Page {pagination.page} of {pagination.pages}
            </span>
            <button
              className="pagination-btn"
              disabled={pagination.page === pagination.pages}
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* User Details Modal */}
      {showUserModal && selectedUser && (
        <div className="modal-overlay" onClick={() => setShowUserModal(false)}>
          <div className="modal modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">User Details</h3>
              <button className="modal-close" onClick={() => setShowUserModal(false)}>&times;</button>
            </div>
            <div className="modal-body">
              <div className="user-detail-grid">
                <div className="user-detail-photo">
                  {selectedUser.selfieUrl ? (
                    <img src={`http://localhost:5000${selectedUser.selfieUrl}`} alt="" />
                  ) : (
                    <div className="photo-placeholder">
                      {selectedUser.firstName?.[0]}{selectedUser.lastName?.[0]}
                    </div>
                  )}
                </div>
                <div className="user-detail-info">
                  <h2>{selectedUser.firstName} {selectedUser.lastName}</h2>
                  <p className={`role-badge ${selectedUser.role}`}>{selectedUser.role}</p>
                  
                  <div className="detail-row">
                    <span className="detail-label">Email:</span>
                    <span>{selectedUser.email}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Phone:</span>
                    <span>{selectedUser.phone}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Location:</span>
                    <span>{selectedUser.city}, {selectedUser.state}</span>
                  </div>
                </div>
              </div>

              <div className="scores-row">
                <div className={`score-box ${getScoreClass(selectedUser.trustScore)}`}>
                  <span className="score-value">{selectedUser.trustScore || 50}</span>
                  <span className="score-label">Trust Score</span>
                </div>
                <div className={`score-box ${getScoreClass(selectedUser.repaymentScore)}`}>
                  <span className="score-value">{selectedUser.repaymentScore || 50}</span>
                  <span className="score-label">Repayment Score</span>
                </div>
                <div className="score-box rating">
                  <span className="score-value">⭐ {selectedUser.averageRating ? Number(selectedUser.averageRating).toFixed(1) : '0.0'}</span>
                  <span className="score-label">{selectedUser.totalRatings || 0} Ratings</span>
                </div>
              </div>

              {selectedUser.governmentIdUrl && (
                <div className="id-document">
                  <h4>Government ID</h4>
                  <img src={`http://localhost:5000${selectedUser.governmentIdUrl}`} alt="Government ID" />
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowUserModal(false)}>
                Close
              </button>
              <button 
                className={`btn ${selectedUser.isBanned ? 'btn-success' : 'btn-danger'}`}
                onClick={() => {
                  handleBanUser(selectedUser.id, selectedUser.isBanned);
                  setShowUserModal(false);
                }}
              >
                {selectedUser.isBanned ? 'Unban User' : 'Ban User'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
