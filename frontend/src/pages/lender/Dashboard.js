import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { loansAPI } from '../../services/api';
import { FiUsers, FiCheckCircle, FiClock, FiArrowRight, FiTrendingUp } from 'react-icons/fi';
import './Dashboard.css';

const LenderDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalLent: 0,
    activeLoans: 0,
    completedLoans: 0,
    pendingRequests: 0
  });
  const [recentLoans, setRecentLoans] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch lending history
      const lendingRes = await loansAPI.getMyLending({ limit: 5 });
      const loans = lendingRes.data.data.loans || [];
      
      // Calculate stats
      const activeLoans = loans.filter(l => ['accepted', 'in_progress'].includes(l.status)).length;
      const completedLoans = loans.filter(l => l.status === 'completed').length;
      
      setStats({
        totalLent: parseFloat(user?.totalLent || 0),
        availableBalance: parseFloat(user?.availableBalance || 0),
        activeLoans,
        completedLoans
      });
      
      setRecentLoans(loans.slice(0, 3));

      // Fetch pending requests
      const pendingRes = await loansAPI.getPendingRequests({ limit: 5 });
      setPendingRequests(pendingRes.data.data.requests || []);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'badge-warning',
      accepted: 'badge-info',
      in_progress: 'badge-primary',
      completed: 'badge-success',
      defaulted: 'badge-danger'
    };
    return badges[status] || 'badge-gray';
  };

  const getScoreClass = (score) => {
    if (score >= 70) return 'score-high';
    if (score >= 40) return 'score-medium';
    return 'score-low';
  };

  if (loading) {
    return (
      <div className="loading-overlay" style={{ position: 'static', background: 'transparent' }}>
        <div className="spinner" style={{ width: 40, height: 40 }}></div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="page-header">
        <h1 className="page-title">Welcome back, {user?.firstName}!</h1>
        <p className="page-subtitle">Here's your lending overview</p>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(79, 70, 229, 0.1)', color: 'var(--primary)' }}>
            <FiTrendingUp size={24} />
          </div>
          <div className="stat-info">
            <p className="stat-value">{formatCurrency(stats.totalLent)}</p>
            <p className="stat-label">Total Lent</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)' }}>
            <FiCheckCircle size={24} />
          </div>
          <div className="stat-info">
            <p className="stat-value">{formatCurrency(stats.availableBalance)}</p>
            <p className="stat-label">Available Balance</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(59, 130, 246, 0.1)', color: 'var(--info)' }}>
            <FiClock size={24} />
          </div>
          <div className="stat-info">
            <p className="stat-value">{stats.activeLoans}</p>
            <p className="stat-label">Active Loans</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)' }}>
            <FiCheckCircle size={24} />
          </div>
          <div className="stat-info">
            <p className="stat-value">{stats.completedLoans}</p>
            <p className="stat-label">Completed</p>
          </div>
        </div>
      </div>

      
      

      <div className="dashboard-grid">
        {/* Pending Requests */}
        <div className="card">
          <div className="card-header">
            <h3>Loan Requests</h3>
            <Link to="/lender/requests" className="view-all">View All <FiArrowRight /></Link>
          </div>
          <div className="card-body">
            {pendingRequests.length > 0 ? (
              <div className="request-list">
                {pendingRequests.map((request) => (
                  <div key={request.id} className="request-item">
                    <div className="request-user">
                      <div className="avatar avatar-placeholder">
                        {request.borrower?.firstName?.[0]}{request.borrower?.lastName?.[0]}
                      </div>
                      <div className="request-user-info">
                        <p className="request-name">{request.borrower?.firstName} {request.borrower?.lastName}</p>
                        <p className="request-location">{request.borrower?.city}, {request.borrower?.state}</p>
                      </div>
                    </div>
                    <div className="request-details">
                      <p className="request-amount">{formatCurrency(request.amount)}</p>
                      <div className="request-scores">
                        <span className={`score-badge ${getScoreClass(request.borrower?.trustScore)}`}>
                          Trust: {request.borrower?.trustScore}
                        </span>
                        <span className={`score-badge ${getScoreClass(request.borrower?.repaymentScore)}`}>
                          Repay: {request.borrower?.repaymentScore}
                        </span>
                      </div>
                    </div>
                    <Link to={`/lender/loan/${request.id}`} className="btn btn-primary btn-sm">
                      Review
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <FiUsers size={32} className="empty-state-icon" />
                <p className="empty-state-text">No pending loan requests</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Lending */}
        <div className="card">
          <div className="card-header">
            <h3>Recent Lending</h3>
            <Link to="/lender/history" className="view-all">View All <FiArrowRight /></Link>
          </div>
          <div className="card-body">
            {recentLoans.length > 0 ? (
              <div className="loan-list">
                {recentLoans.map((loan) => (
                  <div key={loan.id} className="loan-item">
                    <div className="loan-info">
                      <p className="loan-name">{loan.borrower?.firstName} {loan.borrower?.lastName}</p>
                      <p className="loan-date">{new Date(loan.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="loan-amount">
                      <p>{formatCurrency(loan.amount)}</p>
                      <span className={`badge ${getStatusBadge(loan.status)}`}>
                        {loan.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <FiUsers size={32} className="empty-state-icon" />
                <p className="empty-state-text">No lending history yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Score Display */}
      <div className="card score-card">
        <div className="card-body">
          <div className="score-display">
            <div className="score-item">
              <div className={`score-circle ${getScoreClass(user?.trustScore)}`}>
                {user?.trustScore || 50}
              </div>
              <div className="score-info">
                <h4>Trust Score</h4>
                <p>Based on your activity and ratings</p>
              </div>
            </div>
            <div className="score-item">
              <div className="score-circle" style={{ background: 'rgba(245, 158, 11, 0.1)', color: 'var(--warning)' }}>
                {user?.averageRating ? Number(user.averageRating).toFixed(1) : '0.0'}
              </div>
              <div className="score-info">
                <h4>Average Rating</h4>
                <p>{user?.totalRatings || 0} ratings received</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
  );
};

export default LenderDashboard;
