import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { notificationsAPI } from '../services/api';
import { 
  FiHome, FiList, FiPlusCircle, FiUsers, FiFileText, 
  FiAlertCircle, FiSettings, FiBell, FiUser, FiLogOut, FiMenu, FiX, FiUserCheck 
} from 'react-icons/fi';
import './MainLayout.css';

const MainLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchUnreadCount();
    // Poll for notifications every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  // Refresh unread count when navigating
  useEffect(() => {
    fetchUnreadCount();
  }, [location.pathname]);

  const fetchUnreadCount = async () => {
    try {
      const response = await notificationsAPI.getUnreadCount();
      setUnreadCount(response.data.data.count);
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getNavItems = () => {
    const basePath = `/${user?.role}`;
    
    if (user?.role === 'lender') {
      return [
        { path: basePath, icon: FiHome, label: 'Dashboard', exact: true },
        { path: `${basePath}/requests`, icon: FiList, label: 'Loan Requests' },
        { path: `${basePath}/history`, icon: FiFileText, label: 'My Lending' }
      ];
    }
    
    if (user?.role === 'borrower') {
      return [
        { path: basePath, icon: FiHome, label: 'Dashboard', exact: true },
        { path: `${basePath}/new-request`, icon: FiPlusCircle, label: 'New Request' },
        { path: `${basePath}/my-loans`, icon: FiList, label: 'My Requests' }
      ];
    }
    
    if (user?.role === 'admin') {
      return [
        { path: basePath, icon: FiHome, label: 'Dashboard', exact: true },
        { path: `${basePath}/users`, icon: FiUsers, label: 'Users' },
        { path: `${basePath}/verifications`, icon: FiUserCheck, label: 'Verifications' },
        { path: `${basePath}/loans`, icon: FiFileText, label: 'Loans' },
        { path: `${basePath}/reports`, icon: FiAlertCircle, label: 'Reports' },
        { path: `${basePath}/disputes`, icon: FiFileText, label: 'Disputes' },
        { path: `${basePath}/settings`, icon: FiSettings, label: 'Settings' }
      ];
    }
    
    return [];
  };

  const navItems = getNavItems();
  const basePath = `/${user?.role}`;

  return (
    <div className="main-layout">
      {/* Mobile Header */}
      <header className="mobile-header">
        <button className="menu-btn" onClick={() => setSidebarOpen(true)}>
          <FiMenu size={24} />
        </button>
        <div className="mobile-brand-section">
          <img src={`${process.env.PUBLIC_URL}/logo.png`} alt="Logo" className="mobile-logo" />
          <h1 className="mobile-brand">उधार  CHECK</h1>
        </div>
        <NavLink to={`${basePath}/notifications`} className="notification-btn">
          <FiBell size={20} />
          {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
        </NavLink>
      </header>

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo-section">
            <img src={`${process.env.PUBLIC_URL}/logo.png`} alt="Logo" className="sidebar-logo" />
            <h1 className="sidebar-brand">उधार CHECK</h1>
          </div>
          <button className="sidebar-close" onClick={() => setSidebarOpen(false)}>
            <FiX size={24} />
          </button>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.exact}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <NavLink
            to={`${basePath}/notifications`}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            onClick={() => setSidebarOpen(false)}
          >
            <FiBell size={20} />
            <span>Notifications</span>
            {unreadCount > 0 && <span className="nav-badge">{unreadCount}</span>}
          </NavLink>
          <NavLink
            to={`${basePath}/profile`}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            onClick={() => setSidebarOpen(false)}
          >
            <FiUser size={20} />
            <span>Profile</span>
          </NavLink>
          <button className="nav-item logout-btn" onClick={handleLogout}>
            <FiLogOut size={20} />
            <span>Logout</span>
          </button>
        </div>

        <div className="sidebar-user">
          <div className="user-avatar">
            {user?.profilePhoto ? (
              <img src={`http://localhost:5000${user.profilePhoto}`} alt="" />
            ) : (
              <span>{user?.firstName?.[0]}{user?.lastName?.[0]}</span>
            )}
          </div>
          <div className="user-info">
            <p className="user-name">{user?.firstName} {user?.lastName}</p>
            <p className="user-role">{user?.role}</p>
          </div>
        </div>
      </aside>

      {/* Sidebar Overlay */}
      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}

      {/* Main Content */}
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;
