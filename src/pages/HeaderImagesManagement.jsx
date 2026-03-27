import React, { useEffect, useState, useRef } from 'react';
import { Layout, Trash2, Upload, Loader2, Check, X, ImageIcon } from 'lucide-react';
import config from '../config';

const HeaderImagesManagement = () => {
   const [headers, setHeaders] = useState([]);
   const [loading, setLoading] = useState(true);
   const [uploading, setUploading] = useState(false);
   const fileInputRef = useRef(null);

   const MAX_LIMIT = 5;

   const [statusModal, setStatusModal] = useState({ show: false, title: '', message: '', type: 'success' });
   const [confirmAction, setConfirmAction] = useState(null);

   const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
   const role = String(currentUser?.role || 'Guest').toLowerCase();
   const canEditMedia = role === 'founder' || role === 'developer' || role === 'media team';

   const showStatus = (title, message, type = 'success', onConfirm = null) => {
      setStatusModal({ show: true, title, message, type });
      if (onConfirm) setConfirmAction(() => onConfirm);
      else setConfirmAction(null);
   };

   const fetchData = async () => {
      try {
         const res = await fetch(`${config.API_BASE_URL}/api/images/headers`);
         setHeaders(await res.json());
      } catch (e) { console.error(e); } finally { setLoading(false); }
   };

   useEffect(() => { fetchData(); }, []);

   const handleFileUpload = async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      if (headers.length >= MAX_LIMIT) {
         showStatus("Limit Reached", `You can only have up to ${MAX_LIMIT} header images. Please delete one first.`, "error");
         if (fileInputRef.current) fileInputRef.current.value = '';
         return;
      }

      setUploading(true);
      const token = localStorage.getItem('token');

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

         const saveRes = await fetch(`${config.API_BASE_URL}/api/images/headers`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ image_url: cloudData.secure_url })
         });

         if (saveRes.ok) {
            showStatus("Image Hosted", "Media was successfully saved to your VTC database.", "success");
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
      showStatus("Confirm Removal", "Are you sure you want to delete this media asset?", "confirm", async () => {
         const token = localStorage.getItem('token');
         try {
            const res = await fetch(`${config.API_BASE_URL}/api/images/headers/${id}`, {
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
            <h1 className="h3 fw-bold mb-2 text-white">Header Images</h1>
            <p className="text-muted-custom small">Manage homepage hero banners (Limit: {headers.length}/{MAX_LIMIT}).</p>
         </header>

         {loading ? (
            <div className="text-center py-5">
               <Loader2 size={48} className="animate-spin text-accent opacity-50 mb-3 mx-auto" />
               <div className="h5 text-white fw-bold mb-1">Synchronizing Hero Banners...</div>
               <div className="small text-muted-custom">Fetching latest catalog from operational database</div>
            </div>
         ) : (
            <>
               {canEditMedia && (
                  <div className="data-table p-5 mb-5 border-0 position-relative overflow-hidden">
                     <div className="position-absolute translate-middle top-0 start-0 w-100 h-100 opacity-5" style={{ background: 'radial-gradient(circle, var(--admin-accent) 0%, transparent 70%)' }}></div>
                     <div className="row align-items-center position-relative">
                        <div className="col-md-5">
                           <h4 className="fw-bold text-white mb-1">Configure Hero Rotation</h4>
                           <p className="small text-muted-custom mb-4">Host up to {MAX_LIMIT} high-definition banners for the landing page.</p>

                           <div className="p-4 rounded-4 border border-white border-opacity-10 bg-black bg-opacity-20 mb-3">
                              <div className="d-flex justify-content-between align-items-center mb-1">
                                 <span className="x-small text-muted-custom fw-bold text-uppercase tracking-widest">Storage Status</span>
                                 <span className="x-small text-white fw-bold">{headers.length} / {MAX_LIMIT} Slots</span>
                              </div>
                              <div className="progress rounded-pill bg-white bg-opacity-5" style={{ height: 6 }}>
                                 <div className="progress-bar bg-accent rounded-pill" style={{ width: `${(headers.length / MAX_LIMIT) * 100}%` }}></div>
                              </div>
                           </div>

                           {headers.length >= MAX_LIMIT && (
                              <div className="p-3 mb-0 rounded-4 bg-danger bg-opacity-10 border border-danger border-opacity-20 text-danger x-small fw-bold d-flex align-items-center gap-2">
                                 <X size={18} />
                                 Maximum limit of {MAX_LIMIT} reached.
                              </div>
                           )}
                        </div>
                        <div className="col-md-7">
                           <div className={`upload-zone p-5 rounded-4 border-2 border-dashed d-flex flex-column align-items-center justify-content-center gap-3 transition-all ${headers.length >= MAX_LIMIT ? 'opacity-50 pointer-events-none' : ''}`}
                              style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.1)' }}>
                              {uploading ? (
                                 <div className="text-center py-5">
                                    <Loader2 size={48} className="text-accent animate-spin mb-3 mx-auto" />
                                    <div className="h5 text-white fw-bold">Hosting Image...</div>
                                    <div className="small text-muted-custom">Uploading secure signed payload to Cloudinary</div>
                                 </div>
                              ) : (
                                 <label className="w-100 h-100 cursor-pointer text-center py-4 m-0 position-relative">
                                    <input type="file" ref={fileInputRef} className="position-absolute opacity-0 w-100 h-100 top-0 start-0 cursor-pointer" onChange={handleFileUpload} accept="image/*" disabled={headers.length >= MAX_LIMIT} />
                                    <div className="rounded-circle bg-accent bg-opacity-10 d-inline-flex p-4 mb-3 text-accent border border-accent border-opacity-20">
                                       <Upload size={32} />
                                    </div>
                                    <h5 className="text-white fw-bold">Click to Add Header Image</h5>
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
                           <Layout size={24} className="text-accent" /> Active Hero Banners
                        </h5>
                        <div className="row g-4">
                           {headers.map(img => (
                              <div key={img.id} className="col-md-6 col-lg-4 position-relative group animate-reveal">
                                 <div className="overflow-hidden rounded-4 border border-white border-opacity-10 shadow-sm position-relative">
                                    <img src={img.image_url} className="w-100 transition-transform duration-500 hover:scale-110" style={{ height: 200, objectFit: 'cover' }} alt="" />
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
                           {headers.length === 0 && <div className="text-muted-custom small py-5 text-center w-100 h6 opacity-50 fw-normal">No home banners in roster.</div>}
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

export default HeaderImagesManagement;
