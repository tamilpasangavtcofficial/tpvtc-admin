import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Ticket, Image, UserCheck, Inbox, LogOut, Zap, Brush, ExternalLink, History, Heart, Lock, ShieldCheck, X, Loader2, Trophy } from 'lucide-react';
import logo from '../logo.png';
import config from '../config';

const AdminLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentUser = JSON.parse(sessionStorage.getItem('user') || '{}');
  const role = String(currentUser?.role || 'Guest').toLowerCase();
  const username = currentUser?.username || 'GUEST';

  const isHighRole = role === 'founder' || role === 'developer';
  const isEventTeam = role === 'event team';
  const isMediaTeam = role === 'media team';

  const [pendingCount, setPendingCount] = useState(0);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

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
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    navigate('/login');
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setMessage({ type: 'danger', text: 'Passwords do not match' });
      return;
    }
    if (newPassword.length < 6) {
      setMessage({ type: 'danger', text: 'Password must be at least 6 characters' });
      return;
    }

    setIsUpdating(true);
    setMessage({ type: '', text: '' });

    try {
      const token = sessionStorage.getItem('token');
      const res = await fetch(`${config.API_BASE_URL}/api/auth/users/${currentUser.id}/password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ password: newPassword })
      });

      const data = await res.json();
      if (res.ok) {
        setMessage({ type: 'success', text: 'Password updated successfully!' });
        setTimeout(() => {
          setShowPasswordModal(false);
          setNewPassword('');
          setConfirmPassword('');
          setMessage({ type: '', text: '' });
        }, 2000);
      } else {
        setMessage({ type: 'danger', text: data.message || 'Failed to update password' });
      }
    } catch (err) {
      setMessage({ type: 'danger', text: 'Server error. Please try again later.' });
    } finally {
      setIsUpdating(false);
    }
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
    { name: 'Partners', icon: <UserCheck size={20} />, path: '/partners', roles: ['founder', 'developer'] },
    { name: 'Monthly Recognition', icon: <Trophy size={20} />, path: '/recognition', roles: ['founder', 'developer', 'staff', 'event team'] },
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

          <div className="d-none d-xl-block">
            <button 
              onClick={() => setShowPasswordModal(true)}
              className="btn btn-outline-light border-white border-opacity-10 px-4 py-2 rounded-pill d-flex align-items-center gap-2 transition-all"
              style={{ background: 'rgba(255,255,255,0.03)', fontSize: '0.85rem' }}
            >
              <Lock size={14} className="text-accent" />
              <span className="fw-600">Change Password</span>
            </button>
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

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center z-index-master" style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}>
          <div className="data-table p-5 w-100 shadow-2xl border border-white border-opacity-10" style={{ maxWidth: '450px', background: 'var(--admin-card)' }}>
            <div className="d-flex justify-content-between align-items-center mb-4">
               <div className="d-flex align-items-center gap-3">
                  <div className="p-3 rounded-4 bg-accent bg-opacity-10">
                     <ShieldCheck size={24} className="text-accent"/>
                  </div>
                  <h4 className="fw-bold mb-0">Security Update</h4>
               </div>
               <button onClick={() => setShowPasswordModal(false)} className="btn btn-link text-white p-0 opacity-50 hover-opacity-100">
                  <X size={24} />
               </button>
            </div>

            <p className="text-muted-custom mb-4 small">Update your administrative password. Choose a strong combination to keep your access secure.</p>

            <form onSubmit={handleChangePassword}>
               <div className="mb-3">
                  <label className="small text-muted text-uppercase fw-600 mb-2 ms-2">New Password</label>
                  <input 
                    type="password" 
                    className="form-control bg-black bg-opacity-30 border-white border-opacity-10 text-white p-3 rounded-4"
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
               </div>
               <div className="mb-4">
                  <label className="small text-muted text-uppercase fw-600 mb-2 ms-2">Confirm Password</label>
                  <input 
                    type="password" 
                    className="form-control bg-black bg-opacity-30 border-white border-opacity-10 text-white p-3 rounded-4"
                    placeholder="Repeat new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
               </div>

               {message.text && (
                  <div className={`alert alert-${message.type} border-0 rounded-4 p-3 mb-4 small fw-600`}>
                     {message.text}
                  </div>
               )}

               <button 
                 type="submit" 
                 disabled={isUpdating}
                 className="btn btn-admin w-100 py-3 rounded-4 d-flex align-items-center justify-content-center gap-2"
               >
                  {isUpdating ? <Loader2 size={18} className="animate-spin" /> : <Lock size={18} />}
                  <span>{isUpdating ? 'Updating...' : 'Securely Update Password'}</span>
               </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminLayout;
