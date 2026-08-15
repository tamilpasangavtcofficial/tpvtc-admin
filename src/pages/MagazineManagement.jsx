import React, { useState, useEffect } from 'react';
import { BookOpen, Plus, Edit2, Trash2, Eye, EyeOff, ChevronRight, FileText, X, Calendar, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import config from '../config';

// Standard newspaper template used for all VTC magazines

export default function MagazineManagement() {
    const [magazines, setMagazines] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({ month_year: '', template: 'newspaper' });
    const navigate = useNavigate();

    const fetchMagazines = async () => {
        setLoading(true);
        try {
            const token = sessionStorage.getItem('token');
            const res = await fetch(`${config.API_BASE_URL}/api/magazines/admin`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok) setMagazines(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMagazines();
    }, []);

    const handleCreate = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const token = sessionStorage.getItem('token');
            const res = await fetch(`${config.API_BASE_URL}/api/magazines`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(formData)
            });
            const data = await res.json();
            if (res.ok) {
                setShowModal(false);
                setFormData({ month_year: '', template: 'newspaper' });
                fetchMagazines();
            } else {
                alert(data.error || 'Failed to create magazine');
            }
        } catch (err) {
            alert('Server error');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id, name) => {
        if (!window.confirm(`Delete "${name}" magazine? This will also delete all its news items.`)) return;
        try {
            const token = sessionStorage.getItem('token');
            const res = await fetch(`${config.API_BASE_URL}/api/magazines/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) fetchMagazines();
            else alert('Failed to delete magazine');
        } catch (err) {
            alert('Server error');
        }
    };

    const togglePublish = async (id, currentStatus, newsCount) => {
        // Enforce minimum 4 news items before publishing
        if (!currentStatus && newsCount < 4) {
            alert(`Cannot publish yet. This magazine only has ${newsCount} news item${newsCount === 1 ? '' : 's'}. Please add at least ${4 - newsCount} more news item${4 - newsCount === 1 ? '' : 's'} before publishing.`);
            return;
        }
        try {
            const token = sessionStorage.getItem('token');
            const res = await fetch(`${config.API_BASE_URL}/api/magazines/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ published: !currentStatus })
            });
            if (res.ok) fetchMagazines();
            else alert('Failed to update status');
        } catch (err) {
            alert('Server error');
        }
    };

    return (
        <div className="reveal">
            {/* Page Header */}
            <div className="d-flex align-items-start justify-content-between mb-5">
                <div>
                    <div className="d-flex align-items-center gap-3 mb-2">
                        <div className="icon-box" style={{ '--card-rgb': '102, 252, 241', '--card-color': 'var(--admin-accent)' }}>
                            <BookOpen size={22} />
                        </div>
                        <h1 className="h3 fw-bold mb-0">Magazine Management</h1>
                    </div>
                    <p className="mb-0" style={{ color: 'var(--admin-muted)', marginLeft: '70px' }}>
                        Create and publish monthly magazines for your community.
                    </p>
                </div>
                <button
                    className="btn-admin d-flex align-items-center gap-2"
                    style={{ whiteSpace: 'nowrap' }}
                    onClick={() => setShowModal(true)}
                >
                    <Plus size={18} />
                    New Magazine
                </button>
            </div>

            {/* Stats Row */}
            <div className="row g-4 mb-5">
                {[
                    { label: 'Total Editions', value: magazines.length, color: 'var(--admin-accent)', rgb: '102, 252, 241' },
                    { label: 'Published', value: magazines.filter(m => m.published).length, color: 'var(--admin-green)', rgb: '46, 204, 113' },
                    { label: 'Drafts', value: magazines.filter(m => !m.published).length, color: 'var(--admin-pink)', rgb: '255, 93, 143' },
                ].map(s => (
                    <div className="col-md-4" key={s.label}>
                        <div className="stat-card" style={{ '--card-color': s.color, '--card-rgb': s.rgb }}>
                            <div className="icon-box" style={{ '--card-color': s.color, '--card-rgb': s.rgb }}>
                                <FileText size={20} />
                            </div>
                            <div className="h2 fw-bold mb-1" style={{ color: s.color }}>{s.value}</div>
                            <div style={{ color: 'var(--admin-muted)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>{s.label}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Magazine Cards */}
            <div className="data-table p-4">
                <div className="d-flex align-items-center justify-content-between mb-4 pb-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <h5 className="mb-0 fw-600">All Editions</h5>
                    <span style={{ color: 'var(--admin-muted)', fontSize: '0.8rem' }}>{magazines.length} total</span>
                </div>

                {loading ? (
                    <div className="text-center py-5">
                        <div className="spinner-border" style={{ color: 'var(--admin-accent)', width: '2rem', height: '2rem', borderWidth: '3px' }} role="status"></div>
                        <p className="mt-3" style={{ color: 'var(--admin-muted)', fontSize: '0.85rem', letterSpacing: '2px' }}>LOADING...</p>
                    </div>
                ) : magazines.length === 0 ? (
                    <div className="text-center py-5">
                        <div style={{ width: '72px', height: '72px', background: 'rgba(102,252,241,0.05)', borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                            <BookOpen size={32} style={{ color: 'var(--admin-accent)', opacity: 0.5 }} />
                        </div>
                        <p className="fw-bold mb-1">No magazines yet</p>
                        <p style={{ color: 'var(--admin-muted)', fontSize: '0.9rem' }}>Create your first monthly magazine edition.</p>
                        <button className="btn-admin mt-3 d-inline-flex align-items-center gap-2" onClick={() => setShowModal(true)}>
                            <Plus size={16} /> Create First Magazine
                        </button>
                    </div>
                ) : (
                    <div className="row g-3">
                        {magazines.map((mag) => (
                            <div className="col-12" key={mag.id}>
                                <div
                                    className="d-flex align-items-center justify-content-between p-4 rounded-4"
                                    style={{
                                        background: 'rgba(255,255,255,0.02)',
                                        border: `1px solid ${mag.published ? 'rgba(46,204,113,0.15)' : 'rgba(255,255,255,0.05)'}`,
                                        transition: 'all 0.3s ease',
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
                                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                                >
                                    {/* Left: Info */}
                                    <div className="d-flex align-items-center gap-4">
                                        <div style={{
                                            width: '48px', height: '48px', borderRadius: '14px',
                                            background: mag.published ? 'rgba(46,204,113,0.1)' : 'rgba(255,255,255,0.04)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            border: `1px solid ${mag.published ? 'rgba(46,204,113,0.2)' : 'rgba(255,255,255,0.08)'}`,
                                            flexShrink: 0
                                        }}>
                                            <BookOpen size={20} style={{ color: mag.published ? 'var(--admin-green)' : 'var(--admin-muted)' }} />
                                        </div>
                                        <div>
                                            <div className="d-flex align-items-center gap-2 mb-1">
                                                <span className="fw-bold" style={{ fontSize: '1rem' }}>{mag.month_year}</span>
                                                <span style={{
                                                    fontSize: '0.65rem', fontWeight: 700, letterSpacing: '1px',
                                                    textTransform: 'uppercase', padding: '2px 8px', borderRadius: '6px',
                                                    background: mag.published ? 'rgba(46,204,113,0.15)' : 'rgba(255,255,255,0.06)',
                                                    color: mag.published ? 'var(--admin-green)' : 'var(--admin-muted)',
                                                    border: `1px solid ${mag.published ? 'rgba(46,204,113,0.25)' : 'rgba(255,255,255,0.1)'}`,
                                                }}>
                                                    {mag.published ? 'Published' : 'Draft'}
                                                </span>
                                            </div>
                                             <div className="d-flex align-items-center gap-3">
                                                 <span style={{ color: 'var(--admin-muted)', fontSize: '0.8rem' }}>
                                                     Newspaper Layout
                                                 </span>
                                                 <span style={{ color: 'rgba(255,255,255,0.15)' }}>•</span>
                                                 <span style={{
                                                     color: (mag.news ? mag.news.length : 0) >= 4 ? 'var(--admin-green)' : 'var(--admin-pink)',
                                                     fontSize: '0.8rem',
                                                     fontWeight: 600,
                                                 }}>
                                                     {mag.news ? mag.news.length : 0} / 4 news items
                                                 </span>
                                             </div>
                                        </div>
                                    </div>

                                    {/* Right: Actions */}
                                    <div className="d-flex align-items-center gap-2">
                                        {/* Publish Toggle */}
                                        {(() => {
                                            const newsCount = mag.news ? mag.news.length : 0;
                                            const canPublish = mag.published || newsCount >= 4;
                                            return (
                                                <button
                                                    title={mag.published ? 'Unpublish' : (canPublish ? 'Publish' : `Need ${4 - newsCount} more news item(s)`)}
                                                    onClick={() => togglePublish(mag.id, mag.published, newsCount)}
                                                    style={{
                                                        background: mag.published
                                                            ? 'rgba(255,93,143,0.1)'
                                                            : canPublish
                                                                ? 'rgba(46,204,113,0.1)'
                                                                : 'rgba(255,255,255,0.04)',
                                                        border: `1px solid ${mag.published ? 'rgba(255,93,143,0.2)' : canPublish ? 'rgba(46,204,113,0.2)' : 'rgba(255,255,255,0.1)'}`,
                                                        color: mag.published
                                                            ? 'var(--admin-pink)'
                                                            : canPublish
                                                                ? 'var(--admin-green)'
                                                                : 'rgba(255,255,255,0.3)',
                                                        borderRadius: '10px', padding: '8px 14px',
                                                        cursor: canPublish || mag.published ? 'pointer' : 'not-allowed',
                                                        fontSize: '0.8rem', fontWeight: 600,
                                                        display: 'flex', alignItems: 'center', gap: '6px',
                                                        transition: 'all 0.2s ease',
                                                        letterSpacing: '0.5px',
                                                        opacity: !canPublish && !mag.published ? 0.6 : 1,
                                                    }}
                                                    onMouseEnter={e => { if (canPublish || mag.published) e.currentTarget.style.transform = 'translateY(-2px)'; }}
                                                    onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                                                >
                                                    {mag.published ? <EyeOff size={14} /> : <Eye size={14} />}
                                                    {mag.published ? 'Unpublish' : canPublish ? 'Publish' : `${newsCount}/4`}
                                                </button>
                                            );
                                        })()}

                                        {/* Edit Content */}
                                        <button
                                            title="Edit Content"
                                            onClick={() => navigate(`/magazines/${mag.id}/edit`)}
                                            style={{
                                                background: 'rgba(102,252,241,0.08)',
                                                border: '1px solid rgba(102,252,241,0.15)',
                                                color: 'var(--admin-accent)',
                                                borderRadius: '10px', padding: '8px 14px',
                                                cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600,
                                                display: 'flex', alignItems: 'center', gap: '6px',
                                                transition: 'all 0.2s ease',
                                            }}
                                            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(102,252,241,0.15)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                                            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(102,252,241,0.08)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                                        >
                                            <Edit2 size={14} />
                                            Edit
                                            <ChevronRight size={12} />
                                        </button>

                                        {/* Delete */}
                                        <button
                                            title="Delete Magazine"
                                            onClick={() => handleDelete(mag.id, mag.month_year)}
                                            style={{
                                                background: 'rgba(255,93,143,0.06)',
                                                border: '1px solid rgba(255,93,143,0.12)',
                                                color: 'var(--admin-pink)',
                                                borderRadius: '10px', padding: '8px 10px',
                                                cursor: 'pointer',
                                                display: 'flex', alignItems: 'center',
                                                transition: 'all 0.2s ease',
                                            }}
                                            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,93,143,0.15)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                                            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,93,143,0.06)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                                        >
                                            <Trash2 size={15} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Create Modal */}
            {showModal && (
                <div
                    className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
                    style={{ background: 'rgba(3,5,9,0.88)', backdropFilter: 'blur(12px)', zIndex: 99999 }}
                    onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false); }}
                >
                    <div
                        className="p-0 rounded-4 shadow-2xl reveal"
                        style={{ width: '100%', maxWidth: '480px', background: 'var(--admin-card)', border: '1px solid rgba(255,255,255,0.08)', margin: '1rem' }}
                    >
                        {/* Modal Header */}
                        <div className="d-flex align-items-center justify-content-between p-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                            <div className="d-flex align-items-center gap-3">
                                <div className="icon-box" style={{ '--card-color': 'var(--admin-accent)', '--card-rgb': '102,252,241' }}>
                                    <BookOpen size={20} />
                                </div>
                                <div>
                                    <h5 className="mb-0 fw-bold">Create New Magazine</h5>
                                    <p className="mb-0" style={{ color: 'var(--admin-muted)', fontSize: '0.8rem' }}>Set up a new monthly edition</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowModal(false)}
                                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.5)', borderRadius: '10px', padding: '6px', cursor: 'pointer', display: 'flex', transition: 'all 0.2s' }}
                                onMouseEnter={e => e.currentTarget.style.color = '#fff'}
                                onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.5)'}
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <form onSubmit={handleCreate} className="p-4">
                            {/* Month & Year */}
                            <div className="mb-4">
                                <label className="d-flex align-items-center gap-2 mb-2" style={{ fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--admin-muted)' }}>
                                    <Calendar size={14} /> Month & Year
                                </label>
                                <input
                                    type="text"
                                    value={formData.month_year}
                                    onChange={(e) => setFormData({ ...formData, month_year: e.target.value })}
                                    placeholder="e.g. July 2026"
                                    required
                                    style={{
                                        width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                                        borderRadius: '12px', padding: '0.85rem 1rem', color: '#fff', fontSize: '1rem',
                                        outline: 'none', transition: 'border-color 0.2s',
                                    }}
                                    onFocus={e => e.target.style.borderColor = 'var(--admin-accent)'}
                                    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
                                />
                            </div>



                            {/* Info note */}
                            <div className="d-flex align-items-start gap-2 mb-4 p-3 rounded-3" style={{ background: 'rgba(102,252,241,0.04)', border: '1px solid rgba(102,252,241,0.08)' }}>
                                <AlertCircle size={14} style={{ color: 'var(--admin-accent)', marginTop: '2px', flexShrink: 0 }} />
                                <span style={{ fontSize: '0.78rem', color: 'var(--admin-muted)' }}>
                                    The magazine will be saved as a draft. A minimum of <strong style={{ color: 'var(--admin-accent)' }}>4 news items</strong> is required before publishing.
                                </span>
                            </div>

                            {/* Footer Actions */}
                            <div className="d-flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    style={{
                                        flex: 1, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                                        color: 'rgba(255,255,255,0.7)', borderRadius: '12px', padding: '0.85rem',
                                        cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem', transition: 'all 0.2s',
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.07)'}
                                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="btn-admin"
                                    style={{ flex: 2, opacity: submitting ? 0.7 : 1, cursor: submitting ? 'not-allowed' : 'pointer' }}
                                >
                                    {submitting ? (
                                        <span className="d-flex align-items-center justify-content-center gap-2">
                                            <span className="spinner-border spinner-border-sm" role="status"></span>
                                            Creating...
                                        </span>
                                    ) : (
                                        <span className="d-flex align-items-center justify-content-center gap-2">
                                            <Plus size={16} /> Create Magazine
                                        </span>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
