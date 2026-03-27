import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Ticket, Image, UserCheck, Inbox, LogOut, Zap, Brush, ExternalLink, History, Heart } from 'lucide-react';
import logo from '../logo.png';
import config from '../config';

const AdminLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const role = String(currentUser?.role || 'Guest').toLowerCase();
  const username = currentUser?.username || 'GUEST';

  const isHighRole = role === 'founder' || role === 'developer';
  const isEventTeam = role === 'event team';
  const isMediaTeam = role === 'media team';

  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    if (isHighRole || isEventTeam) {
      const fetchPending = async () => {
        try {
          const res = await fetch(`${config.API_BASE_URL}/api/slots/requests/pending`);
          if (res.ok) {
            const data = await res.json();
            setPendingCount(data.length);
          }
        } catch (e) { }
      };
      fetchPending();
    }
  }, [isHighRole, isEventTeam]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/', roles: ['founder', 'developer', 'event team', 'media team', 'staff'] },
    { name: 'Official Event Slots', icon: <Ticket size={20} />, path: '/slots', roles: ['founder', 'developer', 'event team'] },
    { name: 'Attending Events', icon: <ExternalLink size={20} />, path: '/attending', roles: ['founder', 'developer', 'event team'] },
    { name: 'VTC Requests', icon: <Inbox size={20} />, path: '/requests', roles: ['founder', 'developer', 'event team'], badge: pendingCount },
    { name: 'Slot Request Logs', icon: <History size={20} />, path: '/request-logs', roles: ['founder', 'developer', 'event team'] },
    { name: 'Header Images', icon: <Zap size={20} />, path: '/header-images', roles: ['founder', 'developer', 'media team'] },
    { name: 'Gallery', icon: <Image size={20} />, path: '/gallery', roles: ['founder', 'developer', 'media team'] },
    { name: 'Our Supporters', icon: <Heart size={20} />, path: '/supporters', roles: ['founder', 'developer'] },
    { name: 'Users', icon: <UserCheck size={20} />, path: '/users', roles: ['founder', 'developer'] },
  ];

  const filteredNav = navItems.filter(item => item.roles.includes(role));

  return (
    <div className="d-flex position-relative">
      {/* Sidebar with Glass Styling */}
      <aside className="admin-sidebar shadow-2xl">
        <div className="p-5">
          <div className="d-flex align-items-center gap-3 mb-1">
            <img src={logo} alt="Logo" style={{ width: '32px', height: '32px', objectFit: 'contain' }} />
            <h4 className="h5 fw-bold mb-0 accent-glow">TP VTC HUB</h4>
          </div>
          <span className="x-small text-muted text-uppercase tracking-widest fw-600">Staff Portal</span>
        </div>

        <nav className="sidebar-nav flex-grow-1 px-2">
            {filteredNav.map(item => (
                <NavLink key={item.path} to={item.path} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''} d-flex align-items-center`}>
                    {item.icon} 
                    <span className="pt-1 flex-grow-1 d-flex justify-content-between align-items-center ms-3">
                        {item.name}
                        {item.badge > 0 && <span className="badge bg-accent text-dark rounded-pill" style={{ fontSize: '0.65rem', padding: '0.35em 0.6em' }}>{item.badge}</span>}
                    </span>
                </NavLink>
            ))}
        </nav>

        <div className="p-4 border-top border-white border-opacity-5">
          <button onClick={handleLogout} className="btn w-100 btn-outline-danger d-flex align-items-center justify-content-center gap-2 border-0 bg-danger bg-opacity-10 py-3 rounded-4">
            <LogOut size={16} /> <span className="fw-600">Disconnect</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="admin-main flex-grow-1">
        <header className="mb-5 d-flex justify-content-between align-items-end">
          <div>
            <span className="small text-muted-custom fw-600 text-uppercase tracking-wider">Tamil Pasanga VTC</span>
            <h2 className="display-6 fw-bold mb-0">Operational Dashboard</h2>
          </div>
          <div className="d-flex align-items-center gap-4">
            <div className="text-end d-none d-md-block border-end border-white border-opacity-10 pe-4">
              <div className="fw-bold h5 mb-0 text-white">{username}</div>
              <div className="x-small text-accent fw-600 text-uppercase tracking-widest">{currentUser?.role || 'Staff'}</div>
            </div>
            <div className="rounded-4 overflow-hidden border-2 border border-accent shadow-lg" style={{ width: '56px', height: '56px' }}>
              <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=1f2833&color=66fcf1`} className="w-100 h-100" alt="Profile" />
            </div>
          </div>
        </header>

        <div className="reveal" key={location.pathname}>
          {children}
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
