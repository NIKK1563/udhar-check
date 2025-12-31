import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI, loansAPI, reportsAPI, disputesAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { 
  FiUsers, 
  FiAlertTriangle, 
  FiFileText,
  FiTrendingUp,
  FiTrendingDown,
  FiArrowRight,
  FiCheckCircle,
  FiClock,
  FiXCircle,
  FiActivity
} from 'react-icons/fi';
import { Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import './Dashboard.css';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalLenders: 0,
    totalBorrowers: 0,
    totalLoans: 0,
    activeLoans: 0,
    completedLoans: 0,
    defaultedLoans: 0,
    totalLentAmount: 0,
    pendingReports: 0,
    openDisputes: 0
  });
  const [recentUsers, setRecentUsers] = useState([]);
  const [recentLoans, setRecentLoans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, usersRes, loansRes] = await Promise.all([
        adminAPI.getDashboardStats(),
        adminAPI.getUsers({ limit: 5 }),
        adminAPI.getLoans({ limit: 5 })
      ]);

      // Handle stats - could be nested in 'stats' or directly in 'data'
      const statsData = statsRes.data.data?.stats || statsRes.data.data || {};
      setStats({
        totalUsers: statsData.totalUsers || 0,
        totalLenders: statsData.totalLenders || 0,
        totalBorrowers: statsData.totalBorrowers || 0,
        activeLoans: statsData.activeLoans || 0,
        completedLoans: statsData.completedLoans || 0,
        defaultedLoans: statsData.defaultedLoans || 0,
        totalLentAmount: statsData.totalLentAmount || 0,
        pendingReports: statsData.pendingReports || 0,
        openDisputes: statsData.openDisputes || 0,
        totalLoans: (statsData.activeLoans || 0) + (statsData.completedLoans || 0) + (statsData.defaultedLoans || 0)
      });
      
      setRecentUsers(usersRes.data.data?.users || []);
      setRecentLoans(statsRes.data.data?.recentLoans || loansRes.data.data?.loans || []);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      toast.error('Failed to load dashboard data');
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
      pending: { class: 'badge-warning', label: 'Pending' },
      in_progress: { class: 'badge-primary', label: 'In Progress' },
      completed: { class: 'badge-success', label: 'Completed' },
      defaulted: { class: 'badge-danger', label: 'Defaulted' },
      disputed: { class: 'badge-danger', label: 'Disputed' }
    };
    return badges[status] || { class: 'badge-gray', label: status };
  };

  // Chart Data
  const loanChartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Loans Issued',
        data: [12, 19, 15, 25, 22, 30],
        borderColor: 'rgb(99, 102, 241)',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        fill: true,
        tension: 0.4
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    }
  };

  const loanStatusData = {
    labels: ['Active', 'Completed', 'Defaulted', 'Pending'],
    datasets: [
      {
        data: [stats.activeLoans, stats.completedLoans, stats.defaultedLoans, stats.totalLoans - stats.activeLoans - stats.completedLoans - stats.defaultedLoans],
        backgroundColor: [
          'rgba(99, 102, 241, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(245, 158, 11, 0.8)'
        ],
        borderWidth: 0
      }
    ]
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          usePointStyle: true,
          padding: 20
        }
      }
    },
    cutout: '65%'
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner" style={{ width: 40, height: 40 }}></div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="page-header">
        <div>
          <h1 className="page-title">Admin Dashboard</h1>
          <p className="page-subtitle">Welcome back! Here's what's happening on the platform.</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon primary">
            <FiUsers />
          </div>
          <div className="stat-content">
            <h3>{stats.totalUsers || 0}</h3>
            <p>Total Users</p>
          </div>
          <div className="stat-trend up">
            <FiTrendingUp />
            <span>12%</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon success">
            <FiTrendingUp />
          </div>
          <div className="stat-content">
            <h3>{formatCurrency(stats.totalLentAmount)}</h3>
            <p>Total Lent</p>
          </div>
          <div className="stat-trend up">
            <FiTrendingUp />
            <span>8%</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon info">
            <FiActivity />
          </div>
          <div className="stat-content">
            <h3>{stats.activeLoans || 0}</h3>
            <p>Active Loans</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon warning">
            <FiAlertTriangle />
          </div>
          <div className="stat-content">
            <h3>{(stats.pendingReports || 0) + (stats.openDisputes || 0)}</h3>
            <p>Issues to Review</p>
          </div>
          {((stats.pendingReports || 0) + (stats.openDisputes || 0)) > 0 && (
            <Link to="/admin/reports" className="stat-action">View</Link>
          )}
        </div>
      </div>

      {/* User Breakdown */}
      <div className="user-breakdown">
        <div className="breakdown-item">
          <div className="breakdown-icon lender">
            <FiUsers />
          </div>
          <div className="breakdown-content">
            <span className="breakdown-value">{stats.totalLenders || 0}</span>
            <span className="breakdown-label">Lenders</span>
          </div>
        </div>
        <div className="breakdown-divider"></div>
        <div className="breakdown-item">
          <div className="breakdown-icon borrower">
            <FiUsers />
          </div>
          <div className="breakdown-content">
            <span className="breakdown-value">{stats.totalBorrowers || 0}</span>
            <span className="breakdown-label">Borrowers</span>
          </div>
        </div>
        <div className="breakdown-divider"></div>
        <div className="breakdown-item">
          <div className="breakdown-icon completed">
            <FiCheckCircle />
          </div>
          <div className="breakdown-content">
            <span className="breakdown-value">{stats.completedLoans || 0}</span>
            <span className="breakdown-label">Completed</span>
          </div>
        </div>
        <div className="breakdown-divider"></div>
        <div className="breakdown-item">
          <div className="breakdown-icon defaulted">
            <FiXCircle />
          </div>
          <div className="breakdown-content">
            <span className="breakdown-value">{stats.defaultedLoans || 0}</span>
            <span className="breakdown-label">Defaulted</span>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="charts-grid">
        <div className="card chart-card">
          <div className="card-header">
            <h3>Loan Activity</h3>
            <select className="chart-filter">
              <option>Last 6 Months</option>
              <option>Last Year</option>
            </select>
          </div>
          <div className="card-body">
            <div className="chart-container">
              <Line data={loanChartData} options={chartOptions} />
            </div>
          </div>
        </div>

        <div className="card chart-card">
          <div className="card-header">
            <h3>Loan Status Distribution</h3>
          </div>
          <div className="card-body">
            <div className="chart-container doughnut">
              <Doughnut data={loanStatusData} options={doughnutOptions} />
            </div>
          </div>
        </div>
      </div>

      {/* Tables Row */}
      <div className="tables-grid">
        {/* Recent Users */}
        <div className="card">
          <div className="card-header">
            <h3>Recent Users</h3>
            <Link to="/admin/users" className="btn btn-link">
              View All <FiArrowRight />
            </Link>
          </div>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Joined</th>
                </tr>
              </thead>
              <tbody>
                {recentUsers.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="text-center">No users yet</td>
                  </tr>
                ) : (
                  recentUsers.map((user) => (
                    <tr key={user.id}>
                      <td>
                        <div className="user-cell">
                          <div className="user-avatar">
                            {user.firstName?.[0]}{user.lastName?.[0]}
                          </div>
                          <div>
                            <strong>{user.firstName} {user.lastName}</strong>
                            <small>{user.email}</small>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={`role-badge ${user.role}`}>
                          {user.role}
                        </span>
                      </td>
                      <td>
                        <span className={`status-dot ${user.isActive ? 'active' : 'inactive'}`}></span>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </td>
                      <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Loans */}
        <div className="card">
          <div className="card-header">
            <h3>Recent Loans</h3>
            <Link to="/admin/loans" className="btn btn-link">
              View All <FiArrowRight />
            </Link>
          </div>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Amount</th>
                  <th>Borrower</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {recentLoans.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="text-center">No loans yet</td>
                  </tr>
                ) : (
                  recentLoans.map((loan) => (
                    <tr key={loan.id}>
                      <td><strong>{formatCurrency(loan.amount)}</strong></td>
                      <td>
                        {loan.borrower?.firstName} {loan.borrower?.lastName}
                      </td>
                      <td>
                        <span className={`badge ${getStatusBadge(loan.status).class}`}>
                          {getStatusBadge(loan.status).label}
                        </span>
                      </td>
                      <td>{new Date(loan.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <h3>Quick Actions</h3>
        <div className="actions-grid">
          <Link to="/admin/users" className="action-card">
            <FiUsers />
            <span>Manage Users</span>
          </Link>
          <Link to="/admin/reports" className="action-card">
            <FiAlertTriangle />
            <span>Review Reports</span>
          </Link>
          <Link to="/admin/disputes" className="action-card">
            <FiFileText />
            <span>Handle Disputes</span>
          </Link>
          <Link to="/admin/settings" className="action-card">
            <FiActivity />
            <span>Platform Settings</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
