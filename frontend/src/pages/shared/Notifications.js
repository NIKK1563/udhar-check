import React, { useState, useEffect } from 'react';
import { notificationsAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { 
  FiBell, 
  FiCheck, 
  FiCheckCircle, 
  FiAlertCircle,
  FiInfo,
  FiTrash2,
  FiFilter,
  FiCreditCard
} from 'react-icons/fi';
import './Notifications.css';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const loadAndMarkRead = async () => {
      await fetchNotifications();
    };
    loadAndMarkRead();
  }, []);

  // Mark all as read after notifications are loaded
  useEffect(() => {
    if (notifications.length > 0 && !loading) {
      const unread = notifications.filter(n => !n.isRead);
      if (unread.length > 0) {
        // Auto-mark all as read after a short delay
        const timer = setTimeout(() => {
          handleMarkAllAsRead();
        }, 500);
        return () => clearTimeout(timer);
      }
    }
  }, [notifications, loading]);

  const fetchNotifications = async () => {
    try {
      const response = await notificationsAPI.getAll();
      const data = response.data.data;
      // Ensure notifications is always an array
      setNotifications(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      toast.error('Failed to load notifications');
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await notificationsAPI.markAsRead(id);
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, isRead: true } : n)
      );
    } catch (error) {
      toast.error('Failed to mark as read');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationsAPI.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      toast.success('All notifications marked as read');
    } catch (error) {
      toast.error('Failed to mark all as read');
    }
  };

  const handleDelete = async (id) => {
    try {
      await notificationsAPI.delete(id);
      setNotifications(prev => prev.filter(n => n.id !== id));
      toast.success('Notification deleted');
    } catch (error) {
      toast.error('Failed to delete notification');
    }
  };

  const getNotificationIcon = (type) => {
    const icons = {
      loan_request: FiCreditCard,
      loan_accepted: FiCheckCircle,
      loan_rejected: FiAlertCircle,
      payment_received: FiCheckCircle,
      payment_due: FiAlertCircle,
      payment_overdue: FiAlertCircle,
      verification: FiCheckCircle,
      system: FiInfo,
      default: FiBell
    };
    return icons[type] || icons.default;
  };

  const getNotificationClass = (type) => {
    const classes = {
      loan_request: 'primary',
      loan_accepted: 'success',
      loan_rejected: 'danger',
      payment_received: 'success',
      payment_due: 'warning',
      payment_overdue: 'danger',
      verification: 'success',
      system: 'info'
    };
    return classes[type] || 'default';
  };

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !n.isRead;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const formatTimeAgo = (date) => {
    const now = new Date();
    const notifDate = new Date(date);
    const diffMs = now - notifDate;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return notifDate.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="notifications-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">
            Notifications
            {unreadCount > 0 && (
              <span className="unread-badge">{unreadCount}</span>
            )}
          </h1>
          <p className="page-subtitle">Stay updated with your loan activities</p>
        </div>
        {unreadCount > 0 && (
          <button className="btn btn-outline" onClick={handleMarkAllAsRead}>
            <FiCheck /> Mark All as Read
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="filter-tabs">
        <button 
          className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All ({notifications.length})
        </button>
        <button 
          className={`filter-tab ${filter === 'unread' ? 'active' : ''}`}
          onClick={() => setFilter('unread')}
        >
          Unread ({unreadCount})
        </button>
      </div>

      {/* Notifications List */}
      <div className="card">
        {filteredNotifications.length === 0 ? (
          <div className="empty-state">
            <FiBell size={48} />
            <h3>No notifications</h3>
            <p>
              {filter === 'unread' 
                ? "You've read all your notifications" 
                : "You don't have any notifications yet"}
            </p>
          </div>
        ) : (
          <div className="notifications-list">
            {filteredNotifications.map((notification) => {
              const Icon = getNotificationIcon(notification.type);
              const colorClass = getNotificationClass(notification.type);
              
              return (
                <div 
                  key={notification.id} 
                  className={`notification-item ${!notification.isRead ? 'unread' : ''}`}
                  onClick={() => !notification.isRead && handleMarkAsRead(notification.id)}
                >
                  <div className={`notification-icon ${colorClass}`}>
                    <Icon />
                  </div>
                  
                  <div className="notification-content">
                    <h4>{notification.title}</h4>
                    <p>{notification.message}</p>
                    <span className="notification-time">{formatTimeAgo(notification.createdAt)}</span>
                  </div>

                  <div className="notification-actions">
                    {!notification.isRead && (
                      <button 
                        className="action-btn" 
                        title="Mark as read"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMarkAsRead(notification.id);
                        }}
                      >
                        <FiCheck />
                      </button>
                    )}
                    <button 
                      className="action-btn delete" 
                      title="Delete"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(notification.id);
                      }}
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
