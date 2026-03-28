import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Heart, Plus, Search, Trash2, Upload, Loader2, DollarSign, User, Shield, Check, X, ExternalLink, ImageIcon } from 'lucide-react';
import config from '../config';

const SupporterManagement = () => {
    const [supporters, setSupporters] = useState([]);
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        truckersmp_id: '',
        amount: '',
        evidence: ''
    });

    const fileInputRef = useRef(null);

    const [statusModal, setStatusModal] = useState({ show: false, title: '', message: '', type: 'success' });
    const showStatus = (title, message, type = 'success') => setStatusModal({ show: true, title, message, type });

    const fetchData = async () => {
        setLoading(true);
        const token = sessionStorage.getItem('token');
        try {
            const [sRes, mRes] = await Promise.all([
                fetch(`${config.API_BASE_URL}/api/supporters/admin`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                }),
                fetch(`${config.API_BASE_URL}/api/tmp/vtc/members`)
            ]);

            const sData = await sRes.json();
            const mData = await mRes.json();

            setSupporters(Array.isArray(sData) ? sData : []);
            setMembers(mData.response?.members || []);
        } catch (e) {
            console.error(e);
            showStatus("Sync Failed", "Could not reach the operational database.", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    useEffect(() => {
        document.body.style.overflow = (showAddModal || statusModal.show) ? 'hidden' : 'auto';
        return () => { document.body.style.overflow = 'auto'; };
    }, [showAddModal, statusModal.show]);

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        const token = sessionStorage.getItem('token');

        try {
            const signRes = await fetch(`${config.API_BASE_URL}/api/images/upload-sign`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const signData = await signRes.json();

            const form = new FormData();
            form.append('file', file);
            form.append('api_key', signData.api_key);
            form.append('timestamp', signData.timestamp);
            form.append('signature', signData.signature);
            form.append('folder', signData.folder);

            const cloudRes = await fetch(`https://api.cloudinary.com/v1_1/${signData.cloud_name}/image/upload`, {
                method: 'POST',
                body: form
            });
            const cloudData = await cloudRes.json();

            if (cloudData.secure_url) {
                setFormData({ ...formData, evidence: cloudData.secure_url });
            }
        } catch (err) {
            showStatus("Upload Failed", "Cloudinary handshake interrupted.", "error");
        } finally {
            setUploading(false);
        }
    };

    const handleMemberSelect = (m) => {
        setFormData({
            ...formData,
            name: m.username,
            truckersmp_id: m.user_id
        });
        setSearchTerm('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = sessionStorage.getItem('token');
        try {
            const res = await fetch(`${config.API_BASE_URL}/api/supporters`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                showStatus("Supporter Verified", "Recognition has been successfully published.", "success");
                setShowAddModal(false);
                setFormData({ name: '', truckersmp_id: '', amount: '', evidence: '' });
                fetchData();
            }
        } catch (err) {
            showStatus("Database Error", "Failed to save supporter record.", "error");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Archive this recognition record?")) return;
        const token = sessionStorage.getItem('token');
        try {
            const res = await fetch(`${config.API_BASE_URL}/api/supporters/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) fetchData();
        } catch (e) {
            showStatus("Operation Failed", "Connection timeout.", "error");
        }
    };

    const filteredMembers = searchTerm.length > 1
        ? members.filter(m => m.username.toLowerCase().includes(searchTerm.toLowerCase()))
        : [];

    return (
        <div className="container-fluid p-0 reveal in">
            <header className="mb-5 d-flex justify-content-between align-items-end flex-wrap gap-3">
                <div>
                    <h1 className="h3 fw-bold mb-2 text-white">Our Supporters</h1>
                    <p className="text-muted-custom small mb-0">Manage and honor our dedicated VTC supporters.</p>
                </div>
                <button onClick={() => setShowAddModal(true)} className="btn btn-admin px-4 py-2 rounded-4 fw-bold shadow-lg d-flex align-items-center gap-2">
                    <Plus size={18} /> New Support
                </button>
            </header>

            {loading ? (
                <div className="text-center py-5">
                    <Loader2 size={48} className="animate-spin text-accent opacity-50 mb-3 mx-auto" />
                    <div className="h5 text-white fw-bold mb-1">Synchronizing Recognition Data...</div>
                    <div className="small text-muted-custom">Fetching supporter profiles from production cloud</div>
                </div>
            ) : (
                <div className="row g-4">
                    <div className="col-12">
                        <div className="data-table p-0 border-0 shadow-2xl rounded-5 overflow-hidden">
                            <div className="table-responsive">
                                <table className="table table-dark table-hover mb-0 align-middle">
                                    <thead className="small text-muted-custom text-uppercase fw-600 bg-black bg-opacity-20" style={{ letterSpacing: '1px' }}>
                                        <tr>
                                            <th className="ps-5 py-4">Supporter</th>
                                            <th>TruckersMP ID</th>
                                            <th>Contribution</th>
                                            <th>Evidence</th>
                                            <th>Date Recorded</th>
                                            <th className="text-end pe-5">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {supporters.map(s => (
                                            <tr key={s.id} className="animate-reveal">
                                                <td className="ps-5 py-4">
                                                    <div className="d-flex align-items-center gap-3">
                                                        <div className="rounded-circle bg-accent bg-opacity-10 p-2 text-accent border border-accent border-opacity-10">
                                                            <User size={18} />
                                                        </div>
                                                        <div className="fw-bold text-white">{s.name}</div>
                                                    </div>
                                                </td>
                                                <td>
                                                    <code className="text-accent small">{s.truckersmp_id || 'N/A'}</code>
                                                </td>
                                                <td>
                                                    <div className="badge bg-admin bg-opacity-10 text-accent border border-accent border-opacity-20 px-3 py-2 rounded-pill">
                                                        ₹ {s.amount}
                                                    </div>
                                                </td>
                                                <td>
                                                    {s.evidence ? (
                                                        <a href={s.evidence} target="_blank" rel="noreferrer" className="text-accent hover:opacity-75 transition-all d-inline-flex align-items-center gap-2 small fw-bold text-decoration-none">
                                                            <ImageIcon size={14} /> VIEW PROOF
                                                        </a>
                                                    ) : (
                                                        <span className="text-muted-custom opacity-50 small">NONE</span>
                                                    )}
                                                </td>
                                                <td>
                                                    <span className="small text-muted-custom">
                                                        {new Date(s.created_at).toLocaleDateString()}
                                                    </span>
                                                </td>
                                                <td className="text-end pe-5">
                                                    <button onClick={() => handleDelete(s.id)} className="btn btn-outline-danger btn-sm px-3 rounded-4 fw-bold">
                                                        <Trash2 size={14} className="me-1" /> Remove
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                        {supporters.length === 0 && (
                                            <tr>
                                                <td colSpan="6" className="text-center py-5 text-muted-custom opacity-50">
                                                    No supporters have been recorded yet.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {showAddModal && createPortal(
                <div className="modal-overlay position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-4 z-index-master"
                    style={{ background: 'rgba(3,5,9,0.9)', backdropFilter: 'blur(10px)' }}>
                    <div className="data-table p-0 border-0 shadow-2xl reveal zoom w-100 overflow-hidden" style={{ maxWidth: 500 }}>
                        <div className="p-4 border-bottom border-white border-opacity-10 d-flex justify-content-between align-items-center bg-black bg-opacity-20">
                            <h4 className="fw-bold text-white mb-0 d-flex align-items-center gap-2 font-accent">
                                <Heart size={20} className="text-accent" /> Acknowledge Donor
                            </h4>
                            <button onClick={() => setShowAddModal(false)} className="btn btn-link text-muted-custom pe-0"><X size={24} /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-5">
                            <div className="mb-4 position-relative">
                                <label className="form-label text-muted-custom x-small fw-bold text-uppercase tracking-widest">Search Member (from team)</label>
                                <div className="position-relative">
                                    <input
                                        type="text"
                                        className="form-control bg-dark text-white border-white border-opacity-10 py-3 rounded-4 ps-5"
                                        placeholder="Type username..."
                                        value={searchTerm}
                                        onChange={e => setSearchTerm(e.target.value)}
                                    />
                                    <Search size={18} className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted-custom opacity-50" />
                                </div>

                                {filteredMembers.length > 0 && (
                                    <div className="position-absolute w-100 mt-2 bg-dark border border-white border-opacity-10 rounded-4 shadow-2xl overflow-hidden z-index-master" style={{ top: '100%', left: 0 }}>
                                        {filteredMembers.map(m => (
                                            <button
                                                key={m.user_id}
                                                type="button"
                                                onClick={() => handleMemberSelect(m)}
                                                className="w-100 text-start border-0 bg-transparent text-white p-3 hover:bg-white hover:bg-opacity-5 transition-all d-flex align-items-center justify-content-between"
                                            >
                                                <span className="fw-bold">{m.username}</span>
                                                <span className="small text-accent opacity-50">ID: {m.user_id}</span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="row g-3 mb-4">
                                <div className="col-md-6">
                                    <label className="form-label text-muted-custom x-small fw-bold text-uppercase tracking-widest">Full Name</label>
                                    <input type="text" required className="form-control bg-dark text-white border-white border-opacity-10 py-3 rounded-4" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="Display Name" />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label text-muted-custom x-small fw-bold text-uppercase tracking-widest">TMP ID</label>
                                    <input type="number" required className="form-control bg-dark text-white border-white border-opacity-10 py-3 rounded-4" value={formData.truckersmp_id} onChange={e => setFormData({ ...formData, truckersmp_id: e.target.value })} placeholder="123456" />
                                </div>
                            </div>

                            <div className="mb-4">
                                <label className="form-label text-muted-custom x-small fw-bold text-uppercase tracking-widest">Contribution Amount (₹)</label>
                                <div className="position-relative">
                                    <input type="number" required className="form-control bg-dark text-white border-white border-opacity-10 py-3 rounded-4 ps-5 text-accent fw-bold" value={formData.amount} onChange={e => setFormData({ ...formData, amount: e.target.value })} placeholder="0.00" />
                                    <span className="position-absolute top-50 start-0 translate-middle-y ms-3 text-accent fw-bold">₹</span>
                                </div>
                            </div>

                            <div className="mb-5">
                                <label className="form-label text-muted-custom x-small fw-bold text-uppercase tracking-widest">Evidence / Proof</label>
                                <div className="upload-zone p-4 rounded-4 border border-dashed text-center position-relative transition-all" style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.1)' }}>
                                    {uploading ? (
                                        <div className="py-2"><Loader2 size={24} className="animate-spin text-accent mx-auto" /></div>
                                    ) : formData.evidence ? (
                                        <div className="d-flex align-items-center justify-content-between text-accent small fw-bold">
                                            <span className="d-flex align-items-center gap-2"><Check size={16} /> FILE ATTACHED</span>
                                            <button type="button" onClick={() => setFormData({ ...formData, evidence: '' })} className="btn btn-link p-0 text-danger"><Trash2 size={16} /></button>
                                        </div>
                                    ) : (
                                        <label className="m-0 cursor-pointer w-100">
                                            <input type="file" className="position-absolute opacity-0" onChange={handleFileUpload} accept="image/*" />
                                            <div className="text-muted-custom small"><Upload size={18} className="me-2" /> Select Image Proof</div>
                                        </label>
                                    )}
                                </div>
                            </div>

                            <button type="submit" disabled={uploading || loading} className="btn btn-admin w-100 py-3 rounded-4 fw-bold shadow-lg d-flex align-items-center justify-content-center gap-2">
                                {loading && <Loader2 size={18} className="animate-spin" />} PUBLISH RECOGNITION
                            </button>
                        </form>
                    </div>
                </div>, 
                document.body
            )}

            {/* Status Modal */}
            {statusModal.show && createPortal(
                <div className="modal-overlay position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center z-index-master p-4"
                    style={{ background: 'rgba(3,5,9,0.9)', backdropFilter: 'blur(10px)' }}>
                    <div className="data-table p-0 border-0 shadow-2xl reveal zoom w-100 overflow-hidden" style={{ maxWidth: 400 }}>
                        <div className="p-5 text-center">
                            <div className={`rounded-circle mx-auto d-flex align-items-center justify-content-center mb-4 border-2 border ${statusModal.type === 'error' ? 'text-danger border-danger' : 'text-accent border-accent'}`}
                                style={{ width: 64, height: 64, background: 'rgba(255,255,255,0.03)' }}>
                                {statusModal.type === 'error' ? <X size={32} /> : <Check size={32} />}
                            </div>
                            <h4 className="fw-bold text-white mb-2">{statusModal.title}</h4>
                            <p className="text-muted-custom small mb-4">{statusModal.message}</p>
                            <button onClick={() => setStatusModal({ ...statusModal, show: false })} className="btn btn-admin px-5 py-2 rounded-4 mx-auto">DISMISS</button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};

export default SupporterManagement;
