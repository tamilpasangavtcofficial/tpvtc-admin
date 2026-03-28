import React, { useEffect, useState, useRef } from 'react';
import { ImageIcon, Trash2, Upload, Loader2, Check, X } from 'lucide-react';
import config from '../config';

const GalleryManagement = () => {
  const [gallery, setGallery] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const [statusModal, setStatusModal] = useState({ show: false, title: '', message: '', type: 'success' });
  const [confirmAction, setConfirmAction] = useState(null);

  const currentUser = JSON.parse(sessionStorage.getItem('user') || '{}');
  const role = String(currentUser?.role || 'Guest').toLowerCase();
  const canEditMedia = role === 'founder' || role === 'developer' || role === 'media team';

  const showStatus = (title, message, type = 'success', onConfirm = null) => {
    setStatusModal({ show: true, title, message, type });
    if (onConfirm) setConfirmAction(() => onConfirm);
    else setConfirmAction(null);
  };

  const fetchData = async () => {
    try {
      const res = await fetch(`${config.API_BASE_URL}/api/images/gallery`);
      setGallery(await res.json());
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

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

      const formData = new FormData();
      formData.append('file', file);
      formData.append('api_key', signData.api_key);
      formData.append('timestamp', signData.timestamp);
      formData.append('signature', signData.signature);
      formData.append('folder', signData.folder);

      const cloudRes = await fetch(`https://api.cloudinary.com/v1_1/${signData.cloud_name}/image/upload`, {
        method: 'POST',
        body: formData
      });
      const cloudData = await cloudRes.json();

      if (!cloudData.secure_url) throw new Error("Cloudinary upload failed");

      const saveRes = await fetch(`${config.API_BASE_URL}/api/images/gallery`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ image_url: cloudData.secure_url })
      });

      if (saveRes.ok) {
        showStatus("Image Hosted", "Media was successfully saved to your VTC gallery.", "success");
        fetchData();
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    } catch (err) {
      showStatus("Hosting Failed", "Check your Cloudinary link or connection.", "error");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    showStatus("Confirm Removal", "Are you sure you want to delete this gallery image?", "confirm", async () => {
      const token = sessionStorage.getItem('token');
      try {
        const res = await fetch(`${config.API_BASE_URL}/api/images/gallery/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          showStatus("Asset Removed", "The image was permanently deleted.", "success");
          fetchData();
        }
      } catch (e) { showStatus("Command Failed", "Database connection lost.", "error"); }
    });
  };

  return (
    <div className="container-fluid p-0 reveal in">
      <header className="mb-5">
        <h1 className="h3 fw-bold mb-2 text-white">Gallery</h1>
        <p className="text-muted-custom small">Manage images for your public VTC gallery collection.</p>
      </header>

      {loading ? (
        <div className="text-center py-5">
          <Loader2 size={48} className="animate-spin text-accent opacity-50 mb-3 mx-auto" />
          <div className="h5 text-white fw-bold mb-1">Synchronizing Collection...</div>
          <div className="small text-muted-custom">Retrieving latest media assets from the production server</div>
        </div>
      ) : (
        <>
          {canEditMedia && (
            <div className="data-table p-5 mb-5 border-0 position-relative overflow-hidden">
              <div className="position-absolute translate-middle top-0 start-0 w-100 h-100 opacity-5" style={{ background: 'radial-gradient(circle, var(--admin-accent) 0%, transparent 70%)' }}></div>
              <div className="row align-items-center position-relative">
                <div className="col-md-5">
                  <h4 className="fw-bold text-white mb-1">Add Gallery Image</h4>
                  <p className="small text-muted-custom mb-4">Upload a new picture to the official public gallery.</p>
                </div>
                <div className="col-md-7">
                  <div className="upload-zone p-5 rounded-4 border-2 border-dashed d-flex flex-column align-items-center justify-content-center gap-3 transition-all"
                    style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.1)' }}>
                    {uploading ? (
                      <div className="text-center py-5">
                        <Loader2 size={48} className="text-accent animate-spin mb-3 mx-auto" />
                        <div className="h5 text-white fw-bold">Hosting Image...</div>
                        <div className="small text-muted-custom">Uploading secure signed payload to Cloudinary</div>
                      </div>
                    ) : (
                      <label className="w-100 h-100 cursor-pointer text-center py-4 m-0 position-relative">
                        <input type="file" ref={fileInputRef} className="position-absolute opacity-0 w-100 h-100 top-0 start-0 cursor-pointer" onChange={handleFileUpload} accept="image/*" />
                        <div className="rounded-circle bg-accent bg-opacity-10 d-inline-flex p-4 mb-3 text-accent border border-accent border-opacity-20">
                          <Upload size={32} />
                        </div>
                        <h5 className="text-white fw-bold">Click to Add Gallery Image</h5>
                        <p className="small text-muted-custom">Supports JPG, PNG and WebP formats</p>
                      </label>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="row g-4">
            <div className="col-12">
              <div className="data-table p-5 h-100 border-0">
                <h5 className="mb-5 d-flex align-items-center gap-2 text-white fw-bold">
                  <ImageIcon size={24} className="text-accent" /> Active Gallery Collection
                </h5>
                <div className="row g-4">
                  {gallery.map(img => (
                    <div key={img.id} className="col-6 col-md-4 col-lg-3 position-relative group animate-reveal">
                      <div className="overflow-hidden rounded-4 border border-white border-opacity-10 shadow-sm position-relative">
                        <img src={img.image_url} className="w-100 transition-transform duration-500 hover:scale-110" style={{ height: 180, objectFit: 'cover' }} alt="" />
                        {canEditMedia && (
                          <button
                            onClick={() => handleDelete(img.id)}
                            className="btn btn-danger btn-sm rounded-circle p-2 position-absolute top-0 end-0 m-3 shadow-lg opacity-0 group-hover:opacity-100 transition-all border-0"
                            style={{ background: 'rgba(220, 53, 69, 0.9)', backdropFilter: 'blur(5px)' }}
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                  {gallery.length === 0 && <div className="text-muted-custom small py-5 text-center w-100 h6 opacity-50 fw-normal">Gallery collection is empty.</div>}
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {statusModal.show && (
        <div className="modal-overlay position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center z-index-master p-4"
          style={{ background: 'rgba(3,5,9,0.9)', backdropFilter: 'blur(10px)', zIndex: 9999 }}>
          <div className="data-table p-0 border-0 shadow-2xl reveal zoom w-100 overflow-hidden" style={{ maxWidth: 450 }}>
            <div className="p-5 text-center">
              <div className={`rounded-circle mx-auto d-flex align-items-center justify-content-center mb-4 border-2 border ${statusModal.type === 'error' ? 'text-danger border-danger' : 'text-accent border-accent'}`}
                style={{ width: 64, height: 64, background: 'rgba(255,255,255,0.03)' }}>
                {statusModal.type === 'error' ? <X size={32} /> : statusModal.type === 'confirm' ? <ImageIcon size={32} /> : <Check size={32} />}
              </div>
              <h4 className="fw-bold text-white mb-2">{statusModal.title}</h4>
              <p className="text-muted-custom small mb-4">{statusModal.message}</p>

              <div className="d-flex gap-3 justify-content-center pt-2">
                {statusModal.type === 'confirm' ? (
                  <>
                    <button onClick={() => setStatusModal({ ...statusModal, show: false })} className="btn btn-outline-secondary px-4 py-2 rounded-4 fw-bold small">CANCEL</button>
                    <button onClick={() => { confirmAction?.(); setStatusModal({ ...statusModal, show: false }); }} className="btn btn-admin px-4 py-2 rounded-4">EXECUTE</button>
                  </>
                ) : (
                  <button onClick={() => setStatusModal({ ...statusModal, show: false })} className="btn btn-admin px-5 py-2 rounded-4 mx-auto">UNDERSTOOD</button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GalleryManagement;
