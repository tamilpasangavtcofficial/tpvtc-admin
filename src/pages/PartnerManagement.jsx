import React, { useState, useEffect } from 'react';
import { Users, Plus, Edit2, Trash2, X, ExternalLink, Image as ImageIcon } from 'lucide-react';
import config from '../config';

export default function PartnerManagement() {
    const [partners, setPartners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        vtc_link: '',
        partner_type: 'VTC Partner',
        description: '',
        image_url: ''
    });

    const fetchPartners = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${config.API_BASE_URL}/api/partners`);
            const data = await res.json();
            if (res.ok) setPartners(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPartners();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const token = sessionStorage.getItem('token');
            const url = editingId 
                ? `${config.API_BASE_URL}/api/partners/${editingId}`
                : `${config.API_BASE_URL}/api/partners`;
            const method = editingId ? 'PUT' : 'POST';
            
            const res = await fetch(url, {
                method,
                headers: { 
                    'Content-Type': 'application/json', 
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify(formData)
            });
            const data = await res.json();
            if (res.ok) {
                setShowModal(false);
                resetForm();
                fetchPartners();
            } else {
                alert(data.message || 'Failed to save partner');
            }
        } catch (err) {
            alert('Server error');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id, name) => {
        if (!window.confirm(`Delete partner "${name}"?`)) return;
        try {
            const token = sessionStorage.getItem('token');
            const res = await fetch(`${config.API_BASE_URL}/api/partners/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) fetchPartners();
            else alert('Failed to delete partner');
        } catch (err) {
            alert('Server error');
        }
    };

    const openEdit = (p) => {
        setFormData({
            name: p.name,
            vtc_link: p.vtc_link,
            partner_type: p.partner_type,
            description: p.description,
            image_url: p.image_url || ''
        });
        setEditingId(p.id);
        setShowModal(true);
    };

    const resetForm = () => {
        setFormData({
            name: '',
            vtc_link: '',
            partner_type: 'VTC Partner',
            description: '',
            image_url: ''
        });
        setEditingId(null);
    };

    return (
        <div className="reveal">
            {/* Page Header */}
            <div className="d-flex align-items-start justify-content-between mb-5">
                <div>
                    <div className="d-flex align-items-center gap-3 mb-2">
                        <div className="icon-box" style={{ '--card-rgb': '102, 252, 241', '--card-color': 'var(--admin-accent)' }}>
                            <Users size={22} />
                        </div>
                        <h1 className="h3 fw-bold mb-0">Partners Management</h1>
                    </div>
                    <p className="mb-0" style={{ color: 'var(--admin-muted)', marginLeft: '70px' }}>
                        Manage VTC Partners, CCs, and Realops Partners.
                    </p>
                </div>
                <button
                    className="btn-admin d-flex align-items-center gap-2"
                    style={{ whiteSpace: 'nowrap' }}
                    onClick={() => { resetForm(); setShowModal(true); }}
                >
                    <Plus size={18} />
                    Add Partner
                </button>
            </div>

            {/* Partners List */}
            <div className="data-table p-4">
                <div className="d-flex align-items-center justify-content-between mb-4 pb-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <h5 className="mb-0 fw-600">All Partners</h5>
                    <span style={{ color: 'var(--admin-muted)', fontSize: '0.8rem' }}>{partners.length} total</span>
                </div>

                {loading ? (
                    <div className="text-center py-5">
                        <div className="spinner-border" style={{ color: 'var(--admin-accent)', width: '2rem', height: '2rem', borderWidth: '3px' }} role="status"></div>
                        <p className="mt-3" style={{ color: 'var(--admin-muted)', fontSize: '0.85rem', letterSpacing: '2px' }}>LOADING...</p>
                    </div>
                ) : partners.length === 0 ? (
                    <div className="text-center py-5">
                        <p style={{ color: 'var(--admin-muted)' }}>No partners added yet.</p>
                    </div>
                ) : (
                    <div className="row g-4">
                        {partners.map(p => (
                            <div key={p.id} className="col-md-6 col-lg-4">
                                <div className="stat-card p-4" style={{ '--card-color': 'rgba(255,255,255,0.1)', '--card-rgb': '255,255,255', border: '1px solid rgba(255,255,255,0.05)' }}>
                                    <div className="d-flex justify-content-between align-items-start mb-3">
                                        <div>
                                            <span className="badge bg-dark border border-secondary mb-2">{p.partner_type}</span>
                                            <h5 className="fw-bold mb-1">{p.name}</h5>
                                            {p.vtc_link && (
                                                <a href={p.vtc_link} target="_blank" rel="noreferrer" className="small d-inline-flex align-items-center gap-1" style={{ color: 'var(--admin-accent)' }}>
                                                    <ExternalLink size={12} /> VTC Link
                                                </a>
                                            )}
                                        </div>
                                        <div className="d-flex gap-2">
                                            <button className="btn-icon" onClick={() => openEdit(p)}>
                                                <Edit2 size={16} />
                                            </button>
                                            <button className="btn-icon text-danger" onClick={() => handleDelete(p.id, p.name)}>
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                    <p className="small mb-0 text-truncate" style={{ color: 'var(--admin-muted)', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', whiteSpace: 'normal' }}>
                                        {p.description}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(5px)' }}>
                    <div className="modal-dialog modal-dialog-centered modal-lg">
                        <div className="modal-content data-table border-0 shadow-lg">
                            <div className="modal-header border-bottom border-secondary">
                                <h5 className="modal-title fw-bold d-flex align-items-center gap-2">
                                    <Users size={20} style={{ color: 'var(--admin-accent)' }} />
                                    {editingId ? 'Edit Partner' : 'Add New Partner'}
                                </h5>
                                <button type="button" className="btn-close btn-close-white" onClick={() => setShowModal(false)}></button>
                            </div>
                            <form onSubmit={handleSubmit}>
                                <div className="modal-body p-4">
                                    <div className="row g-4">
                                        <div className="col-md-6">
                                            <label className="form-label" style={{ color: 'var(--admin-muted)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Partner Name</label>
                                            <input 
                                                type="text" 
                                                className="form-control admin-input" 
                                                value={formData.name}
                                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                                                required 
                                                placeholder="e.g. New Era Logistics"
                                            />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label" style={{ color: 'var(--admin-muted)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Partner Type</label>
                                            <select 
                                                className="form-control admin-input"
                                                value={formData.partner_type}
                                                onChange={(e) => setFormData({...formData, partner_type: e.target.value})}
                                            >
                                                <option value="VTC Partner">VTC Partner</option>
                                                <option value="CC & Realops Partner">CC & Realops Partner</option>
                                            </select>
                                        </div>
                                        <div className="col-12">
                                            <label className="form-label" style={{ color: 'var(--admin-muted)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>TruckersMP VTC Link</label>
                                            <input 
                                                type="url" 
                                                className="form-control admin-input" 
                                                value={formData.vtc_link || ''}
                                                onChange={(e) => setFormData({...formData, vtc_link: e.target.value})}
                                                placeholder={formData.partner_type === 'VTC Partner' ? "e.g. https://truckersmp.com/vtc/70546 (Required for VTC)" : "Not required for CC & Realops"}
                                                required={formData.partner_type === 'VTC Partner'}
                                            />
                                        </div>
                                        <div className="col-12">
                                            <label className="form-label" style={{ color: 'var(--admin-muted)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Description</label>
                                            <textarea 
                                                className="form-control admin-input" 
                                                rows="5"
                                                value={formData.description}
                                                onChange={(e) => setFormData({...formData, description: e.target.value})}
                                                required 
                                                placeholder="Write about the partner..."
                                            ></textarea>
                                        </div>
                                        <div className="col-12">
                                            <label className="form-label d-flex align-items-center gap-2" style={{ color: 'var(--admin-muted)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                                <ImageIcon size={14} /> Custom Image URL (Optional)
                                            </label>
                                            <input 
                                                type="url" 
                                                className="form-control admin-input" 
                                                value={formData.image_url}
                                                onChange={(e) => setFormData({...formData, image_url: e.target.value})}
                                                placeholder="Leave blank to use TruckersMP logo"
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="modal-footer border-top border-secondary p-4">
                                    <button type="button" className="btn btn-dark px-4" onClick={() => setShowModal(false)}>Cancel</button>
                                    <button type="submit" className="btn-admin px-4" disabled={submitting}>
                                        {submitting ? 'Saving...' : (editingId ? 'Update Partner' : 'Save Partner')}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
