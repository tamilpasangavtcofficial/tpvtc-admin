import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { UserCheck, Trash2, Shield, User, UserPlus, Edit2, X, Check, Loader2 } from 'lucide-react';
import config from '../config';

const StaffManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal States
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  
  // Form State
  const [formData, setFormData] = useState({ username: '', email: '', password: '', role: 'Event Team' });
  const [passwordData, setPasswordData] = useState({ password: '' });

  const [statusModal, setStatusModal] = useState({ show: false, title: '', message: '', type: 'success' });
  const [confirmAction, setConfirmAction] = useState(null);

  const showStatus = (title, message, type = 'success', onConfirm = null) => {
    setStatusModal({ show: true, title, message, type });
    if (onConfirm) setConfirmAction(() => onConfirm);
    else setConfirmAction(null);
  };

  const currentUser = JSON.parse(sessionStorage.getItem('user') || '{}');
  const role = String(currentUser?.role || 'Guest').toLowerCase();
  const isHighRole = role === 'founder' || role === 'developer';

  const fetchData = async () => {
    const token = sessionStorage.getItem('token');
    try {
      const res = await fetch(`${config.API_BASE_URL}/api/auth/users`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    const token = sessionStorage.getItem('token');
    try {
      const res = await fetch(`${config.API_BASE_URL}/api/auth/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setShowAddModal(false);
        setFormData({ username: '', email: '', password: '', role: 'Event Team' });
        fetchData();
      } else {
        const err = await res.json();
        showStatus("Creation Failed", err.message || "Failed to create user", "error");
      }
    } catch (e) { showStatus("Server Error", "Could not reach database", "error"); }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    const token = sessionStorage.getItem('token');
    try {
      const res = await fetch(`${config.API_BASE_URL}/api/auth/users/${selectedUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ role: formData.role, username: formData.username })
      });
      if (res.ok) {
        setShowEditModal(false);
        fetchData();
      } else { showStatus("Permission Error", "Failed to update permissions", "error"); }
    } catch (e) { showStatus("Server Error", "Could not reach database", "error"); }
  };

  const handleDelete = async (id) => {
    showStatus(
      "Confirm Removal",
      "Are you sure you want to delete this staff member? This will immediately revoke their dashboard access and permanently remove their account.",
      "confirm",
      async () => {
         const token = sessionStorage.getItem('token');
         try {
           const res = await fetch(`${config.API_BASE_URL}/api/auth/users/${id}`, {
             method: 'DELETE',
             headers: { 'Authorization': `Bearer ${token}` }
           });
           if (res.ok) fetchData();
           else showStatus("Deletion Failed", "Failed to delete user", "error");
         } catch (e) { showStatus("Server Error", "Could not reach database", "error"); }
      }
    );
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    const token = sessionStorage.getItem('token');
    try {
      const res = await fetch(`${config.API_BASE_URL}/api/auth/users/${selectedUser.id}/password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ password: passwordData.password })
      });
      if (res.ok) {
        setShowPasswordModal(false);
        showStatus("Security Key Updated", "Password updated successfully.", "success");
      } else { showStatus("Security Error", "Failed to change password", "error"); }
    } catch (e) { showStatus("Server Error", "Could not reach database", "error"); }
  };

  const roleColors = {
    'founder': '#e74c3c',
    'developer': '#66fcf1',
    'event team': '#2ecc71',
    'media team': '#9b59b6',
    'staff': '#f1c40f'
  };

  return (
    <div className="container-fluid p-0 reveal in">
      <header className="mb-5 d-flex justify-content-between align-items-end flex-wrap gap-3">
         <div>
           <h1 className="h3 fw-bold mb-2 text-white">Team Manager</h1>
           <p className="text-muted-custom small mb-0">Manage staff access and operational roles.</p>
         </div>
         {isHighRole && (
           <button onClick={() => { setFormData({ username: '', email: '', password: '', role: 'Event Team' }); setShowAddModal(true); }} className="btn px-4 py-2 rounded-4 fw-bold shadow-lg d-flex align-items-center gap-2 transition-all hover:scale-105" style={{ backgroundColor: '#66fcf1', color: '#0b0c10' }}>
             <UserPlus size={18} /> Add User
           </button>
         )}
      </header>

      {loading ? (
        <div className="text-center py-5">
          <Loader2 size={48} className="animate-spin text-accent opacity-50 mb-3 mx-auto" />
          <div className="h5 text-white fw-bold mb-1">Synchronizing Staff Records...</div>
          <div className="small text-muted-custom">Retrieving latest personnel data from the secure database</div>
        </div>
      ) : (
        <div className="data-table border-0 shadow-2xl rounded-5 overflow-hidden">
          <div className="table-responsive">
          <table className="table table-dark table-hover mb-0 align-middle">
            <thead className="small text-muted-custom text-uppercase fw-600 bg-black bg-opacity-20" style={{ letterSpacing: '1px' }}>
               <tr>
                  <th className="py-4 px-5 border-0 rounded-start">Staff Member</th>
                  <th className="py-4 px-4 border-0">Email Account</th>
                  <th className="py-4 px-4 border-0">Operational Role</th>
                  <th className="py-4 px-5 border-0 text-end rounded-end">Action Interface</th>
               </tr>
            </thead>
            <tbody>
               {loading ? (
                  <tr><td colSpan="4" className="py-5 text-center text-white"><div className="spinner-border text-accent spinner-border-sm me-2" /> Fetching roster...</td></tr>
               ) : users.length === 0 ? (
                  <tr><td colSpan="4" className="py-5 text-center text-muted-custom">No staff found.</td></tr>
               ) : users.map(u => (
                  <tr key={u.id} className="border-bottom border-white border-opacity-5">
                     <td className="py-4 px-5">
                        <div className="fw-bold text-white mb-0 h6">{u.username}</div>
                     </td>
                     <td className="py-4 px-4 text-muted-custom small">{u.email}</td>
                     <td className="py-4 px-4">
                        {(() => {
                           const roleName = u.UserRole?.role || u.role || 'Guest';
                           const roleKey = String(roleName).toLowerCase();
                           return (
                              <span className="badge rounded-pill px-3 py-2 border fw-bold shadow-sm" 
                                    style={{ color: roleColors[roleKey] || 'var(--admin-accent)', borderColor: 'rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.03)' }}>
                                 <Shield size={12} className="me-2 d-inline-block" style={{ marginTop: '-2px' }} />
                                 <span className="text-uppercase" style={{ letterSpacing: '1px' }}>{roleName}</span>
                              </span>
                           );
                        })()}
                     </td>
                     <td className="py-4 px-5 text-end">
                        <div className="d-flex justify-content-end gap-2">
                           {(currentUser.id === u.id || isHighRole) && (
                              <button onClick={() => { setSelectedUser(u); setPasswordData({ password: '' }); setShowPasswordModal(true); }} className="btn btn-outline-light btn-sm px-3 rounded-4 fw-bold border-opacity-25 text-opacity-75">
                                 Key
                              </button>
                           )}
                           {isHighRole && (
                              <>
                                <button onClick={() => { setSelectedUser(u); setFormData({ ...u, role: u.UserRole?.role || 'Event Team' }); setShowEditModal(true); }} className="btn btn-outline-secondary btn-sm px-3 rounded-4 fw-bold">
                                   <Edit2 size={14} className="me-1" /> Edit
                                </button>
                                <button onClick={() => handleDelete(u.id)} className="btn btn-outline-danger btn-sm px-3 rounded-4 fw-bold">
                                   <Trash2 size={14} className="me-1" /> Delete
                                </button>
                              </>
                           )}
                           {!isHighRole && currentUser.id !== u.id && (
                              <span className="text-muted-custom opacity-25 small fst-italic">Restricted</span>
                           )}
                        </div>
                     </td>
                  </tr>
               ))}
            </tbody>
          </table>
        </div>
      </div>
      )}

      {/* Add User Modal */}
      {showAddModal && createPortal(
         <div className="modal-overlay position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-4" style={{ background: 'rgba(3,5,9,0.9)', backdropFilter: 'blur(10px)', zIndex: 9999 }}>
            <div className="data-table p-0 border-0 shadow-2xl reveal zoom in w-100 overflow-hidden" style={{ maxWidth: 500 }}>
               <div className="p-4 border-bottom border-white border-opacity-10 d-flex justify-content-between align-items-center bg-black bg-opacity-20">
                  <h4 className="fw-bold text-white mb-0 d-flex align-items-center gap-2"><UserPlus size={20} className="text-accent"/> Register New Staff</h4>
                  <button onClick={() => setShowAddModal(false)} className="btn btn-link text-muted-custom pe-0"><X size={24} /></button>
               </div>
               <form onSubmit={handleAddSubmit} className="p-5">
                  <div className="mb-4">
                     <label className="form-label text-muted-custom x-small fw-bold text-uppercase tracking-widest">Username</label>
                     <input type="text" required className="form-control bg-dark text-white border-white border-opacity-10 py-3 rounded-4" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} placeholder="e.g. SRINIVAS" />
                  </div>
                  <div className="mb-4">
                     <label className="form-label text-muted-custom x-small fw-bold text-uppercase tracking-widest">Email Address</label>
                     <input type="email" required className="form-control bg-dark text-white border-white border-opacity-10 py-3 rounded-4" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="staff@tamilpasanga.com" />
                  </div>
                  <div className="mb-4">
                     <label className="form-label text-muted-custom x-small fw-bold text-uppercase tracking-widest">Initial Password</label>
                     <input type="password" required className="form-control bg-dark text-white border-white border-opacity-10 py-3 rounded-4" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} placeholder="••••••••" />
                  </div>
                  <div className="mb-5">
                     <label className="form-label text-muted-custom x-small fw-bold text-uppercase tracking-widest">Operational Role</label>
                     <select className="form-control bg-dark text-white border-white border-opacity-10 py-3 rounded-4 fw-bold" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} style={{ color: roleColors[formData.role?.toLowerCase()] }}>
                        <option value="Founder">Founder</option>
                        <option value="Developer">Developer</option>
                        <option value="Staff">Staff</option>
                        <option value="Event Team">Event Team</option>
                        <option value="Media Team">Media Team</option>
                     </select>
                  </div>
                  <button type="submit" className="btn w-100 py-3 rounded-4 fw-bold tracking-wider shadow-lg" style={{ backgroundColor: '#66fcf1', color: '#0b0c10' }}>CREATE PROFILE</button>
               </form>
            </div>
         </div>,
         document.body
      )}

      {/* Edit Role Modal */}
      {showEditModal && selectedUser && createPortal(
         <div className="modal-overlay position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-4" style={{ background: 'rgba(3,5,9,0.9)', backdropFilter: 'blur(10px)', zIndex: 9999 }}>
            <div className="data-table p-0 border-0 shadow-2xl reveal zoom in w-100 overflow-hidden" style={{ maxWidth: 450 }}>
               <div className="p-4 border-bottom border-white border-opacity-10 d-flex justify-content-between align-items-center bg-black bg-opacity-20">
                  <h4 className="fw-bold text-white mb-0 d-flex align-items-center gap-2"><Edit2 size={20} className="text-accent"/> Modify Permissions</h4>
                  <button onClick={() => setShowEditModal(false)} className="btn btn-link text-muted-custom pe-0"><X size={24} /></button>
               </div>
               <form onSubmit={handleEditSubmit} className="p-5">
                  <div className="text-center mb-4">
                     <div className="text-muted-custom small text-uppercase tracking-widest fw-bold">{selectedUser.email}</div>
                  </div>
                  <div className="mb-4">
                     <label className="form-label text-muted-custom x-small fw-bold text-uppercase tracking-widest">Username</label>
                     <input type="text" required className="form-control bg-dark text-white border-white border-opacity-10 py-3 rounded-4" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} />
                  </div>
                  <div className="mb-5">
                     <label className="form-label text-muted-custom x-small fw-bold text-uppercase tracking-widest">New Assigned Role</label>
                     <select className="form-control bg-dark text-white border-white border-opacity-10 py-3 rounded-4 fw-bold" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} style={{ color: roleColors[formData.role?.toLowerCase()] }}>
                        <option value="Founder">Founder</option>
                        <option value="Developer">Developer</option>
                        <option value="Staff">Staff</option>
                        <option value="Event Team">Event Team</option>
                        <option value="Media Team">Media Team</option>
                     </select>
                  </div>
                  <button type="submit" className="btn w-100 py-3 rounded-4 fw-bold tracking-wider shadow-lg transition-transform hover:scale-105" style={{ backgroundColor: '#66fcf1', color: '#0b0c10' }}>UPDATE PERMISSIONS</button>
               </form>
            </div>
         </div>,
         document.body
      )}

      {/* Change Password Modal */}
      {showPasswordModal && selectedUser && createPortal(
         <div className="modal-overlay position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-4" style={{ background: 'rgba(3,5,9,0.9)', backdropFilter: 'blur(10px)', zIndex: 9999 }}>
            <div className="data-table p-0 border-0 shadow-2xl reveal zoom in w-100 overflow-hidden" style={{ maxWidth: 450 }}>
               <div className="p-4 border-bottom border-white border-opacity-10 d-flex justify-content-between align-items-center bg-black bg-opacity-20">
                  <h4 className="fw-bold text-white mb-0 d-flex align-items-center gap-2">Change Password</h4>
                  <button onClick={() => setShowPasswordModal(false)} className="btn btn-link text-muted-custom pe-0"><X size={24} /></button>
               </div>
               <form onSubmit={handlePasswordSubmit} className="p-5">
                  <div className="mb-5">
                     <label className="form-label text-muted-custom x-small fw-bold text-uppercase tracking-widest">New Security Key</label>
                     <input type="password" required minLength={4} className="form-control bg-dark text-white border-white border-opacity-10 py-3 rounded-4 fw-bold" value={passwordData.password} onChange={e => setPasswordData({ password: e.target.value })} placeholder="••••••••" />
                  </div>
                  <button type="submit" className="btn w-100 py-3 rounded-4 fw-bold tracking-wider shadow-lg transition-transform hover:scale-105" style={{ backgroundColor: '#66fcf1', color: '#0b0c10' }}>SET NEW PASSWORD</button>
               </form>
            </div>
         </div>,
         document.body
      )}
      {statusModal.show && createPortal(
         <div className="modal-overlay position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center z-index-master p-4" 
              style={{ background: 'rgba(3,5,9,0.9)', backdropFilter: 'blur(10px)', zIndex: 9999 }}>
            <div className="data-table p-0 border-0 shadow-2xl reveal zoom in w-100 overflow-hidden" style={{ maxWidth: 450 }}>
               <div className="p-5 text-center">
                  <div className={`rounded-circle mx-auto d-flex align-items-center justify-content-center mb-4 border-2 border ${statusModal.type === 'error' ? 'text-danger border-danger' : 'text-accent border-accent'}`} 
                       style={{ width: 64, height: 64, background: 'rgba(255,255,255,0.03)' }}>
                     {statusModal.type === 'error' ? <X size={32} /> : statusModal.type === 'confirm' ? <Shield size={32} /> : <Check size={32} />}
                  </div>
                  <h4 className="fw-bold text-white mb-2">{statusModal.title}</h4>
                  <p className="text-muted-custom small mb-4">{statusModal.message}</p>
                  
                  <div className="d-flex gap-3 justify-content-center pt-2">
                     {statusModal.type === 'confirm' ? (
                        <>
                           <button onClick={() => setStatusModal({ ...statusModal, show: false })} className="btn btn-outline-secondary px-4 py-2 rounded-4 fw-bold small">CANCEL</button>
                           <button onClick={() => { confirmAction?.(); setStatusModal({ ...statusModal, show: false }); }} className="btn btn-danger px-4 py-2 rounded-4">EXECUTE</button>
                        </>
                     ) : (
                        <button onClick={() => setStatusModal({ ...statusModal, show: false })} className="btn px-5 py-2 rounded-4 mx-auto" style={{ backgroundColor: '#66fcf1', color: '#0b0c10' }}>UNDERSTOOD</button>
                     )}
                  </div>
               </div>
            </div>
         </div>,
         document.body
      )}

    </div>
  );
};

export default StaffManagement;

