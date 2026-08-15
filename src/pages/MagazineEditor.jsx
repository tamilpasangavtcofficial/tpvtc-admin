import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Save, Plus, Trash2, GripVertical, Image as ImageIcon, ChevronUp, ChevronDown, BookOpen, Edit3, FileText, Bold, Italic, Underline, List, ListOrdered, Quote, Link as LinkIcon, Eye, X } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import config from '../config';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';
import NewspaperTemplate from '../components/NewspaperTemplate';

const editorStyles = `
  .tpvtc-editor-container {
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 12px;
    background: rgba(10, 15, 26, 0.4) !important;
    backdrop-filter: blur(10px);
    overflow: hidden;
    transition: all 0.3s ease;
  }
  .tpvtc-editor-container:focus-within {
    border-color: var(--admin-accent, #66FCF1) !important;
    box-shadow: 0 0 15px rgba(102, 252, 241, 0.15);
  }
  .tpvtc-toolbar {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 4px;
    padding: 10px 14px;
    background: rgba(255, 255, 255, 0.02) !important;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08) !important;
    border-top: none !important;
    border-left: none !important;
    border-right: none !important;
  }
  .tpvtc-toolbar button {
    background: none !important;
    border: none !important;
    color: rgba(255, 255, 255, 0.6) !important;
    padding: 6px !important;
    border-radius: 6px !important;
    cursor: pointer !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    transition: all 0.2s ease !important;
    width: 28px !important;
    height: 28px !important;
  }
  .tpvtc-toolbar button:hover {
    color: #fff !important;
    background: rgba(255, 255, 255, 0.08) !important;
  }
  .tpvtc-toolbar button.ql-active {
    color: var(--admin-accent, #66FCF1) !important;
    background: rgba(102, 252, 241, 0.1) !important;
  }
  .tpvtc-editor {
    min-height: 280px;
    color: #f8f9fa !important;
    font-family: 'Outfit', sans-serif !important;
    font-size: 0.95rem !important;
    background: transparent !important;
    border: none !important;
  }
  .tpvtc-editor .ql-editor {
    padding: 18px !important;
    min-height: 280px;
    color: #f8f9fa !important;
    font-family: 'Outfit', sans-serif !important;
    font-size: 0.95rem !important;
    line-height: 1.6;
  }
  .tpvtc-editor .ql-editor h1, 
  .tpvtc-editor .ql-editor h2, 
  .tpvtc-editor .ql-editor h3 {
    color: #fff !important;
    font-weight: 700 !important;
    margin-top: 1rem !important;
    margin-bottom: 0.5rem !important;
  }
  .tpvtc-editor .ql-editor blockquote {
    border-left: 3px solid var(--admin-accent, #66FCF1) !important;
    padding-left: 1rem !important;
    color: rgba(255, 255, 255, 0.7) !important;
    background: rgba(255, 255, 255, 0.02) !important;
    border-radius: 4px !important;
    margin: 1rem 0 !important;
    padding-top: 8px !important;
    padding-bottom: 8px !important;
  }
  .tpvtc-editor .ql-editor a {
    color: var(--admin-accent, #66FCF1) !important;
    text-decoration: underline !important;
  }
  .tpvtc-editor .ql-blank::before {
    color: rgba(255, 255, 255, 0.3) !important;
    font-style: normal !important;
    left: 18px !important;
  }
  .ql-container.ql-snow {
    border: none !important;
  }
  .tpvtc-toolbar select.ql-header {
    background: rgba(255, 255, 255, 0.05) !important;
    border: 1px solid rgba(255, 255, 255, 0.08) !important;
    color: rgba(255, 255, 255, 0.8) !important;
    padding: 2px 8px !important;
    border-radius: 6px !important;
    outline: none !important;
    cursor: pointer !important;
    font-size: 0.8rem !important;
    height: 26px !important;
  }
  .tpvtc-toolbar select.ql-header option {
    background: #11141a !important;
    color: #fff !important;
  }
`;

// Custom Quill wrapper compatible with React 19 (no findDOMNode)
function QuillEditor({ value, onChange }) {
    const containerRef = useRef(null);
    const toolbarRef = useRef(null);
    const quillRef = useRef(null);
    const onChangeRef = useRef(onChange);

    useEffect(() => {
        onChangeRef.current = onChange;
    }, [onChange]);

    useEffect(() => {
        if (!containerRef.current || !toolbarRef.current) return;

        // Clean up any existing elements inside the container to prevent duplication
        containerRef.current.innerHTML = '';

        const quill = new Quill(containerRef.current, {
            theme: 'snow',
            modules: {
                toolbar: toolbarRef.current
            }
        });
        quillRef.current = quill;

        // Set initial value
        if (value) {
            quill.root.innerHTML = value;
        }

        const handleTextChange = () => {
            if (onChangeRef.current) {
                onChangeRef.current(quill.root.innerHTML);
            }
        };

        quill.on('text-change', handleTextChange);

        return () => {
            quill.off('text-change', handleTextChange);
            quillRef.current = null;
            if (containerRef.current) {
                containerRef.current.innerHTML = '';
            }
        };
    }, []);

    // Sync value from outside
    useEffect(() => {
        if (quillRef.current) {
            const currentContent = quillRef.current.root.innerHTML;
            const normalizedValue = value || '';
            const normalizedCurrent = currentContent === '<p><br></p>' ? '' : currentContent;
            if (normalizedValue !== normalizedCurrent) {
                quillRef.current.root.innerHTML = normalizedValue;
            }
        }
    }, [value]);

    return (
        <div className="tpvtc-editor-container">
            <style>{editorStyles}</style>
            
            {/* Custom React-controlled Toolbar Container */}
            <div ref={toolbarRef} className="tpvtc-toolbar">
                <select className="ql-header" defaultValue="">
                    <option value="1">H1</option>
                    <option value="2">H2</option>
                    <option value="3">H3</option>
                    <option value="">Normal</option>
                </select>
                
                <span style={{ width: '1px', height: '18px', background: 'rgba(255,255,255,0.1)', margin: '0 6px' }} />
                
                <button className="ql-bold" type="button" title="Bold"><Bold size={15} /></button>
                <button className="ql-italic" type="button" title="Italic"><Italic size={15} /></button>
                <button className="ql-underline" type="button" title="Underline"><Underline size={15} /></button>
                
                <span style={{ width: '1px', height: '18px', background: 'rgba(255,255,255,0.1)', margin: '0 6px' }} />
                
                <button className="ql-list" value="ordered" type="button" title="Numbered List"><ListOrdered size={15} /></button>
                <button className="ql-list" value="bullet" type="button" title="Bulleted List"><List size={15} /></button>
                
                <span style={{ width: '1px', height: '18px', background: 'rgba(255,255,255,0.1)', margin: '0 6px' }} />
                
                <button className="ql-blockquote" type="button" title="Quote"><Quote size={15} /></button>
                <button className="ql-link" type="button" title="Insert Link"><LinkIcon size={15} /></button>
                <button className="ql-clean" type="button" title="Clear Formatting"><Trash2 size={15} /></button>
            </div>

            {/* Editor Input Area */}
            <div ref={containerRef} className="tpvtc-editor" />
        </div>
    );
}

// Template definition removed - consolidated into Newspaper template

export default function MagazineEditor() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [magazine, setMagazine] = useState(null);
    const [newsItems, setNewsItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showPreview, setShowPreview] = useState(false);

    const [editingNews, setEditingNews] = useState(null);
    const [formData, setFormData] = useState({ topic: '', sub_topic: '', content: '', images: '', order_index: 0 });
    const [isUploading, setIsUploading] = useState(false);

    const handleImageUpload = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        setIsUploading(true);
        try {
            const token = sessionStorage.getItem('token');
            const signRes = await fetch(`${config.API_BASE_URL}/api/images/upload-sign`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!signRes.ok) throw new Error('Failed to get upload signature');
            const { signature, timestamp, cloud_name, api_key, folder } = await signRes.json();

            const uploadedUrls = [];
            for (const file of files) {
                const formData = new FormData();
                formData.append('file', file);
                formData.append('signature', signature);
                formData.append('timestamp', timestamp);
                formData.append('api_key', api_key);
                formData.append('folder', folder);

                const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${cloud_name}/image/upload`, {
                    method: 'POST',
                    body: formData
                });
                if (!uploadRes.ok) throw new Error('Cloudinary upload failed');
                const uploadData = await uploadRes.json();
                uploadedUrls.push(uploadData.secure_url);
            }

            setFormData(prev => {
                const currentImages = prev.images ? prev.images.split(',').map(u => u.trim()).filter(Boolean) : [];
                const newImages = [...currentImages, ...uploadedUrls].join(', ');
                return { ...prev, images: newImages };
            });
        } catch (err) {
            console.error('Upload Error:', err);
            alert('Failed to upload images. Check console for details.');
        } finally {
            setIsUploading(false);
        }
    };

    const removeImage = (indexToRemove) => {
        setFormData(prev => {
            const currentImages = prev.images ? prev.images.split(',').map(u => u.trim()).filter(Boolean) : [];
            const newImages = currentImages.filter((_, i) => i !== indexToRemove).join(', ');
            return { ...prev, images: newImages };
        });
    };

    const fetchMagazine = async () => {
        try {
            const token = sessionStorage.getItem('token');
            const res = await fetch(`${config.API_BASE_URL}/api/magazines/admin/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok) {
                setMagazine(data);
                setNewsItems(data.news || []);
            } else {
                alert('Magazine not found');
                navigate('/magazines');
            }
        } catch (err) {
            console.error(err);
            alert('Failed to load magazine');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchMagazine(); }, [id]);

    const handleSaveNews = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const token = sessionStorage.getItem('token');
            const payload = {
                ...formData,
                images: formData.images ? formData.images.split(',').map(url => url.trim()).filter(url => url) : []
            };

            let res;
            if (editingNews && editingNews.id) {
                res = await fetch(`${config.API_BASE_URL}/api/magazines/news/${editingNews.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify(payload)
                });
            } else {
                payload.order_index = newsItems.length;
                res = await fetch(`${config.API_BASE_URL}/api/magazines/${id}/news`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify(payload)
                });
            }

            if (res.ok) {
                setEditingNews(null);
                setFormData({ topic: '', sub_topic: '', content: '', images: '', order_index: 0 });
                fetchMagazine();
            } else {
                const data = await res.json();
                alert(data.error || 'Failed to save news');
            }
        } catch (err) {
            alert('Server error');
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteNews = async (newsId) => {
        if (!window.confirm('Delete this news item?')) return;
        try {
            const token = sessionStorage.getItem('token');
            const res = await fetch(`${config.API_BASE_URL}/api/magazines/news/${newsId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                if (editingNews?.id === newsId) {
                    setEditingNews(null);
                    setFormData({ topic: '', sub_topic: '', content: '', images: '', order_index: 0 });
                }
                fetchMagazine();
            } else {
                alert('Failed to delete news');
            }
        } catch (err) {
            alert('Server error');
        }
    };

    const startEditing = (news) => {
        let imagesStr = '';
        if (news.images) {
            if (Array.isArray(news.images)) {
                imagesStr = news.images.join(', ');
            } else if (typeof news.images === 'string') {
                try {
                    const parsed = JSON.parse(news.images);
                    if (Array.isArray(parsed)) {
                        imagesStr = parsed.join(', ');
                    } else {
                        imagesStr = news.images;
                    }
                } catch (e) {
                    imagesStr = news.images;
                }
            }
        }

        setEditingNews(news);
        setFormData({
            topic: news.topic || '',
            sub_topic: news.sub_topic || '',
            content: news.content || '',
            images: imagesStr,
            order_index: news.order_index || 0
        });
    };

    const cancelEditing = () => {
        setEditingNews(null);
        setFormData({ topic: '', sub_topic: '', content: '', images: '', order_index: 0 });
    };

    const moveNews = async (index, direction) => {
        if (index + direction < 0 || index + direction >= newsItems.length) return;
        const newItems = [...newsItems];
        const temp = newItems[index].order_index;
        newItems[index].order_index = newItems[index + direction].order_index;
        newItems[index + direction].order_index = temp;

        try {
            const token = sessionStorage.getItem('token');
            await Promise.all([
                fetch(`${config.API_BASE_URL}/api/magazines/news/${newItems[index].id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify({ order_index: newItems[index].order_index })
                }),
                fetch(`${config.API_BASE_URL}/api/magazines/news/${newItems[index + direction].id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify({ order_index: newItems[index + direction].order_index })
                })
            ]);
            fetchMagazine();
        } catch (err) {
            alert('Failed to reorder');
        }
    };

    if (loading) {
        return (
            <div className="d-flex align-items-center justify-content-center" style={{ minHeight: '60vh' }}>
                <div className="text-center">
                    <div className="spinner-border" style={{ color: 'var(--admin-accent)', width: '2.5rem', height: '2.5rem', borderWidth: '3px' }} role="status"></div>
                    <p className="mt-3" style={{ color: 'var(--admin-muted)', letterSpacing: '2px', fontSize: '0.8rem' }}>LOADING EDITOR...</p>
                </div>
            </div>
        );
    }

    const inputStyle = {
        width: '100%',
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '12px',
        padding: '0.75rem 1rem',
        color: '#fff',
        fontSize: '0.95rem',
        outline: 'none',
        transition: 'border-color 0.2s',
        fontFamily: 'Outfit, sans-serif',
    };

    const labelStyle = {
        fontSize: '0.75rem',
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '1px',
        color: 'var(--admin-muted)',
        marginBottom: '8px',
        display: 'block',
    };

    return (
        <div className="reveal">
            {/* Back Button */}
            <button
                onClick={() => navigate('/magazines')}
                style={{ background: 'none', border: 'none', color: 'var(--admin-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 600, padding: '0', marginBottom: '1.5rem', transition: 'color 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.color = '#fff'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--admin-muted)'}
            >
                <ArrowLeft size={16} /> Back to Magazines
            </button>

            {/* Page Header */}
            <div className="d-flex align-items-start justify-content-between mb-5">
                <div>
                    <div className="d-flex align-items-center gap-3 mb-2">
                        <div className="icon-box" style={{ '--card-color': 'var(--admin-accent)', '--card-rgb': '102,252,241' }}>
                            <Edit3 size={20} />
                        </div>
                        <div>
                            <h1 className="h3 fw-bold mb-0">{magazine?.month_year}</h1>
                            <div className="d-flex align-items-center gap-2 mt-1" style={{ marginLeft: '0' }}>
                                <span style={{
                                    fontSize: '0.65rem', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase',
                                    padding: '2px 8px', borderRadius: '6px',
                                    background: magazine?.published ? 'rgba(46,204,113,0.15)' : 'rgba(255,255,255,0.06)',
                                    color: magazine?.published ? 'var(--admin-green)' : 'var(--admin-muted)',
                                    border: `1px solid ${magazine?.published ? 'rgba(46,204,113,0.25)' : 'rgba(255,255,255,0.1)'}`,
                                }}>
                                    {magazine?.published ? 'Published' : 'Draft'}
                                </span>
                                <span style={{
                                    fontSize: '0.65rem', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase',
                                    padding: '2px 8px', borderRadius: '6px',
                                    background: newsItems.length >= 4 ? 'rgba(46,204,113,0.1)' : 'rgba(255,93,143,0.1)',
                                    color: newsItems.length >= 4 ? 'var(--admin-green)' : 'var(--admin-pink)',
                                    border: `1px solid ${newsItems.length >= 4 ? 'rgba(46,204,113,0.2)' : 'rgba(255,93,143,0.2)'}`,
                                }}>
                                    {newsItems.length} / 4 items
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="d-flex align-items-center gap-2">
                    {/* Preview Button */}
                    <button
                        onClick={() => setShowPreview(true)}
                        style={{
                            background: 'rgba(255,255,255,0.06)',
                            border: '1px solid rgba(255,255,255,0.12)',
                            color: 'rgba(255,255,255,0.8)',
                            borderRadius: '12px',
                            padding: '0.6rem 1.2rem',
                            cursor: 'pointer',
                            fontWeight: 600,
                            fontSize: '0.9rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '7px',
                            transition: 'all 0.2s',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#fff'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = 'rgba(255,255,255,0.8)'; }}
                    >
                        <Eye size={15} /> Preview
                    </button>
                    <button
                        className="btn-admin d-flex align-items-center gap-2"
                        onClick={cancelEditing}
                    >
                        <Plus size={16} /> Add New Item
                    </button>
                </div>
            </div>

            {/* ── PREVIEW MODAL ── */}
            {showPreview && (
                <div
                    style={{
                        position: 'fixed', inset: 0,
                        background: 'rgba(0,0,0,0.92)',
                        backdropFilter: 'blur(8px)',
                        zIndex: 99999,
                        display: 'flex',
                        flexDirection: 'column',
                        overflow: 'hidden',
                    }}
                >
                    {/* Modal top bar */}
                    <div style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '1rem 1.5rem',
                        background: 'rgba(10,15,26,0.95)',
                        borderBottom: '1px solid rgba(255,255,255,0.08)',
                        flexShrink: 0,
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{
                                background: 'rgba(102,252,241,0.1)', border: '1px solid rgba(102,252,241,0.2)',
                                borderRadius: '10px', padding: '6px 10px', display: 'flex', alignItems: 'center', gap: '6px',
                                color: 'var(--admin-accent)', fontSize: '0.8rem', fontWeight: 700,
                            }}>
                                <Eye size={14} /> PREVIEW MODE
                            </div>
                            <div>
                                <div style={{ fontWeight: 700, fontSize: '1rem', color: '#fff' }}>{magazine?.month_year}</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--admin-muted)' }}>
                                    {newsItems.length} news item{newsItems.length !== 1 ? 's' : ''}
                                    {newsItems.length < 4 && (
                                        <span style={{ color: 'var(--admin-pink)', marginLeft: '8px' }}>
                                            ⚠ Need {4 - newsItems.length} more to publish
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={() => setShowPreview(false)}
                            style={{
                                background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                                color: 'rgba(255,255,255,0.6)', borderRadius: '10px', padding: '8px',
                                cursor: 'pointer', display: 'flex', alignItems: 'center', transition: 'all 0.2s',
                            }}
                            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,93,143,0.15)'; e.currentTarget.style.color = 'var(--admin-pink)'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; }}
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Scrollable preview area — full viewport width, no inherited admin CSS */}
                    <div style={{
                        flex: 1,
                        overflowY: 'auto',
                        overflowX: 'hidden',
                        width: '100%',
                        padding: 0,
                        margin: 0,
                    }}>
                        {newsItems.length === 0 ? (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'rgba(255,255,255,0.4)', fontFamily: 'Outfit, sans-serif', fontSize: '1rem', letterSpacing: '1px' }}>
                                <div style={{ textAlign: 'center' }}>
                                    <FileText size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
                                    <p>No news items yet. Add at least 4 items to preview the magazine.</p>
                                </div>
                            </div>
                        ) : (
                            /* Reset all Bootstrap/admin styles before rendering the template */
                            <div style={{
                                all: 'initial',
                                display: 'block',
                                width: '100%',
                                boxSizing: 'border-box',
                            }}>
                                <NewspaperTemplate news={newsItems} monthYear={magazine?.month_year} />
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Two Column Layout */}
            <div className="row g-4">
                {/* LEFT: News List */}
                <div className="col-lg-4">
                    <div className="data-table h-100" style={{ minHeight: '400px' }}>
                        <div className="p-4 pb-3 d-flex align-items-center justify-content-between" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                            <div className="d-flex align-items-center gap-2">
                                <FileText size={16} style={{ color: 'var(--admin-accent)' }} />
                                <span className="fw-bold" style={{ fontSize: '0.95rem' }}>News Items</span>
                            </div>
                            <span style={{ background: 'rgba(102,252,241,0.1)', color: 'var(--admin-accent)', borderRadius: '8px', padding: '2px 10px', fontSize: '0.75rem', fontWeight: 700 }}>
                                {newsItems.length}
                            </span>
                        </div>

                        <div className="p-2">
                            {newsItems.length === 0 ? (
                                <div className="text-center p-5">
                                    <FileText size={28} style={{ color: 'var(--admin-muted)', opacity: 0.4, marginBottom: '0.75rem', display: 'block', margin: '0 auto 0.75rem' }} />
                                    <p style={{ color: 'var(--admin-muted)', fontSize: '0.85rem', margin: 0 }}>No news items yet.<br />Click "Add New Item" to start.</p>
                                </div>
                            ) : (
                                newsItems.map((news, idx) => (
                                    <div
                                        key={news.id}
                                        style={{
                                            borderRadius: '12px',
                                            padding: '12px',
                                            marginBottom: '6px',
                                            background: editingNews?.id === news.id ? 'rgba(102,252,241,0.06)' : 'rgba(255,255,255,0.02)',
                                            border: `1px solid ${editingNews?.id === news.id ? 'rgba(102,252,241,0.2)' : 'rgba(255,255,255,0.04)'}`,
                                            cursor: 'pointer',
                                            transition: 'all 0.2s',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '10px',
                                        }}
                                        onClick={() => startEditing(news)}
                                        onMouseEnter={e => { if (editingNews?.id !== news.id) e.currentTarget.style.background = 'rgba(255,255,255,0.04)' }}
                                        onMouseLeave={e => { if (editingNews?.id !== news.id) e.currentTarget.style.background = 'rgba(255,255,255,0.02)' }}
                                    >
                                        {/* Reorder Controls */}
                                        <div className="d-flex flex-column gap-1" onClick={e => e.stopPropagation()}>
                                            <button
                                                onClick={() => moveNews(idx, -1)}
                                                disabled={idx === 0}
                                                style={{ background: 'none', border: 'none', padding: '2px', cursor: idx === 0 ? 'not-allowed' : 'pointer', color: idx === 0 ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.3)', display: 'flex', lineHeight: 1 }}
                                            >
                                                <ChevronUp size={12} />
                                            </button>
                                            <GripVertical size={12} style={{ color: 'rgba(255,255,255,0.15)' }} />
                                            <button
                                                onClick={() => moveNews(idx, 1)}
                                                disabled={idx === newsItems.length - 1}
                                                style={{ background: 'none', border: 'none', padding: '2px', cursor: idx === newsItems.length - 1 ? 'not-allowed' : 'pointer', color: idx === newsItems.length - 1 ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.3)', display: 'flex', lineHeight: 1 }}
                                            >
                                                <ChevronDown size={12} />
                                            </button>
                                        </div>

                                        {/* Info */}
                                        <div className="flex-grow-1" style={{ minWidth: 0 }}>
                                            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: editingNews?.id === news.id ? 'var(--admin-accent)' : '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                {news.topic}
                                            </div>
                                            {news.sub_topic && (
                                                <div style={{ fontSize: '0.7rem', color: 'var(--admin-muted)', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                    {news.sub_topic}
                                                </div>
                                            )}
                                        </div>

                                        {/* Delete */}
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleDeleteNews(news.id); }}
                                            style={{ background: 'none', border: 'none', color: 'rgba(255,93,143,0.4)', cursor: 'pointer', padding: '4px', display: 'flex', flexShrink: 0, transition: 'color 0.2s' }}
                                            onMouseEnter={e => e.currentTarget.style.color = 'var(--admin-pink)'}
                                            onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,93,143,0.4)'}
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* RIGHT: Editor */}
                <div className="col-lg-8">
                    <div className="data-table">
                        <div className="p-4 pb-3 d-flex align-items-center gap-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                            <BookOpen size={16} style={{ color: 'var(--admin-accent)' }} />
                            <span className="fw-bold" style={{ fontSize: '0.95rem' }}>
                                {editingNews ? `Editing: ${editingNews.topic}` : 'Add New News Item'}
                            </span>
                        </div>

                        <form onSubmit={handleSaveNews} className="p-4">
                            {/* Topic & Sub Topic */}
                            <div className="row g-3 mb-3">
                                <div className="col-md-6">
                                    <label style={labelStyle}>Topic (Title) *</label>
                                    <input
                                        type="text"
                                        style={inputStyle}
                                        value={formData.topic}
                                        onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                                        placeholder="Main headline"
                                        required
                                        onFocus={e => e.target.style.borderColor = 'var(--admin-accent)'}
                                        onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
                                    />
                                </div>
                                <div className="col-md-6">
                                    <label style={labelStyle}>Sub Topic (Optional)</label>
                                    <input
                                        type="text"
                                        style={inputStyle}
                                        value={formData.sub_topic}
                                        onChange={(e) => setFormData({ ...formData, sub_topic: e.target.value })}
                                        placeholder="Category or sub-heading"
                                        onFocus={e => e.target.style.borderColor = 'rgba(102,252,241,0.4)'}
                                        onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
                                    />
                                </div>
                            </div>

                            {/* Images */}
                            <div className="mb-4">
                                <label style={labelStyle}>
                                    <span className="d-flex align-items-center gap-1">
                                        <ImageIcon size={12} /> Images
                                    </span>
                                </label>
                                
                                {/* Uploaded Thumbnails Grid */}
                                {formData.images && (
                                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '10px' }}>
                                        {formData.images.split(',').map(u => u.trim()).filter(Boolean).map((url, i) => (
                                            <div key={i} style={{ position: 'relative', width: '80px', height: '60px', borderRadius: '6px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
                                                <img src={url} alt={`upload-${i}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                <button 
                                                    onClick={() => removeImage(i)}
                                                    title="Remove image"
                                                    style={{ 
                                                        position: 'absolute', top: '2px', right: '2px', 
                                                        background: 'rgba(0,0,0,0.6)', border: 'none', color: '#fff', 
                                                        borderRadius: '50%', width: '18px', height: '18px', 
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center', 
                                                        cursor: 'pointer', fontSize: '10px'
                                                    }}
                                                >
                                                    <X size={12} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Upload Button */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <label style={{
                                        display: 'inline-flex', alignItems: 'center', gap: '6px',
                                        background: 'rgba(255,255,255,0.06)', border: '1px dashed rgba(255,255,255,0.2)',
                                        color: 'rgba(255,255,255,0.8)', padding: '8px 16px', borderRadius: '8px',
                                        cursor: isUploading ? 'not-allowed' : 'pointer', fontSize: '0.8rem', fontWeight: 600,
                                        transition: 'all 0.2s', opacity: isUploading ? 0.6 : 1
                                    }}
                                    onMouseEnter={e => !isUploading && (e.currentTarget.style.borderColor = 'var(--admin-accent)')}
                                    onMouseLeave={e => !isUploading && (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)')}
                                    >
                                        <Plus size={14} />
                                        {isUploading ? 'Uploading...' : 'Upload Images'}
                                        <input 
                                            type="file" 
                                            multiple 
                                            accept="image/*" 
                                            onChange={handleImageUpload} 
                                            disabled={isUploading}
                                            style={{ display: 'none' }} 
                                        />
                                    </label>
                                </div>
                                <p style={{ fontSize: '0.72rem', color: 'var(--admin-muted)', marginTop: '6px', marginBottom: 0 }}>
                                    The first image will be used as the main hero/thumbnail image.
                                </p>
                            </div>

                            {/* Rich Text Content */}
                             <div className="mb-4">
                                 <label style={labelStyle}>Content (Rich Text) *</label>
                                 <QuillEditor
                                     value={formData.content}
                                     onChange={(val) => setFormData(prev => ({ ...prev, content: val }))}
                                 />
                             </div>

                            {/* Actions */}
                            <div className="d-flex gap-3 pt-2">
                                {editingNews && (
                                    <button
                                        type="button"
                                        onClick={cancelEditing}
                                        style={{
                                            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                                            color: 'rgba(255,255,255,0.6)', borderRadius: '12px', padding: '0.75rem 1.5rem',
                                            cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem', transition: 'all 0.2s',
                                        }}
                                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.07)'}
                                        onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
                                    >
                                        Cancel
                                    </button>
                                )}
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="btn-admin d-flex align-items-center gap-2"
                                    style={{ opacity: saving ? 0.7 : 1, cursor: saving ? 'not-allowed' : 'pointer' }}
                                >
                                    {saving ? (
                                        <><span className="spinner-border spinner-border-sm" role="status"></span> Saving...</>
                                    ) : (
                                        <><Save size={16} /> {editingNews ? 'Save Changes' : 'Add News Item'}</>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
