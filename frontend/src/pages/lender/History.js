import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { loansAPI } from '../../services/api';
import { FiCalendar, FiUser, FiClock } from 'react-icons/fi';

const LenderHistory = () => {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });

  useEffect(() => {
    fetchLoans();
  }, [pagination.page, filter]);

  const fetchLoans = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.page,
        limit: 10
      };
      if (filter !== 'all') {
        params.status = filter;
      }

      const response = await loansAPI.getMyLending(params);
      setLoans(response.data.data.loans || []);
      setPagination({
        ...pagination,
        total: response.data.data.total,
        totalPages: response.data.data.totalPages
      });
    } catch (error) {
      console.error('Failed to fetch loans:', error);
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
      pending: { class: 'badge-warning', label: 'Pending' },
      accepted: { class: 'badge-info', label: 'Accepted' },
      fulfilled: { class: 'badge-info', label: 'Fulfilled' },
      in_progress: { class: 'badge-primary', label: 'In Progress' },
      completed: { class: 'badge-success', label: 'Completed' },
      defaulted: { class: 'badge-danger', label: 'Defaulted' },
      disputed: { class: 'badge-danger', label: 'Disputed' }
    };
    return badges[status] || { class: 'badge-gray', label: status };
  };

  return (
    <div className="history-page">
      <div className="page-header">
        <h1 className="page-title">My Lending History</h1>
        <p className="page-subtitle">Track all your lending activities</p>
      </div>

      {/* Filter Tabs */}
      <div className="filter-tabs">
        {['all', 'in_progress', 'completed', 'defaulted'].map((status) => (
          <button
            key={status}
            className={`filter-tab ${filter === status ? 'active' : ''}`}
            onClick={() => {
              setFilter(status);
              setPagination({ ...pagination, page: 1 });
            }}
          >
            {status === 'all' ? 'All' : status.replace('_', ' ')}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="spinner" style={{ width: 40, height: 40 }}></div>
        </div>
      ) : loans.length > 0 ? (
        <>
          <div className="card">
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Borrower</th>
                    <th>Amount</th>
                    <th>Duration</th>
                    <th>Repaid</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {loans.map((loan) => {
                    const status = getStatusBadge(loan.status);
                    return (
                      <tr key={loan.id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <div className="avatar avatar-sm avatar-placeholder">
                              {loan.borrower?.firstName?.[0]}{loan.borrower?.lastName?.[0]}
                            </div>
                            <span>{loan.borrower?.firstName} {loan.borrower?.lastName}</span>
                          </div>
                        </td>
                        <td><strong>{formatCurrency(loan.amount)}</strong></td>
                        <td>{loan.duration} days</td>
                        <td>{formatCurrency(loan.amountRepaid || 0)}</td>
                        <td>
                          <span className={`badge ${status.class}`}>{status.label}</span>
                        </td>
                        <td>{new Date(loan.createdAt).toLocaleDateString()}</td>
                        <td>
                          <Link to={`/lender/loan/${loan.id}`} className="btn btn-secondary btn-sm">
                            View
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="pagination">
              <button
                className="btn btn-secondary"
                disabled={pagination.page === 1}
                onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
              >
                Previous
              </button>
              <span className="pagination-info">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <button
                className="btn btn-secondary"
                disabled={pagination.page === pagination.totalPages}
                onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
              >
                Next
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="card">
          <div className="card-body empty-state">
            <FiClock size={48} className="empty-state-icon" />
            <h3 className="empty-state-title">No Lending History</h3>
            <p className="empty-state-text">
              You haven't lent any money yet. Browse loan requests to start lending.
            </p>
            <Link to="/lender/requests" className="btn btn-primary">
              Browse Requests
            </Link>
          </div>
        </div>
      )}

      <style jsx>{`
        .history-page {
          max-width: 1200px;
          margin: 0 auto;
        }

        .filter-tabs {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 1.5rem;
        }

        .filter-tab {
          padding: 0.5rem 1rem;
          background: var(--white);
          border: 1px solid var(--gray-200);
          border-radius: var(--radius);
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--gray-600);
          cursor: pointer;
          transition: all 0.2s;
          text-transform: capitalize;
        }

        .filter-tab:hover {
          border-color: var(--primary);
          color: var(--primary);
        }

        .filter-tab.active {
          background: var(--primary);
          border-color: var(--primary);
          color: white;
        }

        .loading-container {
          display: flex;
          justify-content: center;
          padding: 3rem;
        }
      `}</style>
    </div>
  );
};

export default LenderHistory;
