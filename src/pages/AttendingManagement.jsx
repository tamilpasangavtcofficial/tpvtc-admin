import React, { useEffect, useState } from 'react';
import { ExternalLink, Check, Save, Upload, Loader2, Map as MapIcon, X, Shield } from 'lucide-react';
import { createPortal } from 'react-dom';
import config from '../config';

const AttendingManagement = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [statusModal, setStatusModal] = useState({ show: false, title: '', message: '', type: 'success' });
  const showStatus = (title, message, type = 'success') => setStatusModal({ show: true, title, message, type });

  const fetchEvents = async () => {
    try {
      const res = await fetch(`${config.API_BASE_URL}/api/tmp/vtc/events/attending`);
      const data = await res.json();
      // Filter out our own official events (VTC ID: 73933)
      const officialVtcId = 73933;
      const filtered = (data.response || [])
        .filter(e => e.vtc.id !== officialVtcId)
        .sort((a, b) => new Date(a.start_at) - new Date(b.start_at));
      setEvents(filtered);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const EventRow = ({ event }) => {
    const [sno, setSno] = useState('');
    const [surl, setSurl] = useState('');
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
       const fetchLocal = async () => {
          const res = await fetch(`${config.API_BASE_URL}/api/slots/attending/${event.id}`);
          const data = await res.json();
          if (data) {
             setSno(data.slot_number || '');
             setSurl(data.slot_url || '');
          }
       };
       fetchLocal();
    }, [event.id]);

    const handleUpdate = async () => {
      setSaving(event.id);
      try {
        const res = await fetch(`${config.API_BASE_URL}/api/slots/attending/setup`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ event_id: event.id, slot_number: sno, slot_url: surl })
        });
        if (res.ok) showStatus("Update Saved", "Event details updated successfully!", "success");
      } catch (e) { showStatus("Update Failed", "Could not save event details.", "error"); } finally { setSaving(null); }
    };

    const handleFileUpload = async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      setUploading(true);
      const token = sessionStorage.getItem('token');

      try {
        // 1. Get Signature
        const signRes = await fetch(`${config.API_BASE_URL}/api/images/upload-sign`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const signData = await signRes.json();

        // 2. Upload to Cloudinary
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
        if (cloudData.secure_url) setSurl(cloudData.secure_url);

      } catch (err) { showStatus("Upload Failed", "Map upload failed", "error"); } finally { setUploading(false); }
    };

    return (
      <div className="col-12 mb-4">
        <div className="data-table p-5 border-0">
          <div className="row align-items-center">
             <div className="col-lg-4">
                <div className="d-flex align-items-center gap-4">
                   <div className="position-relative overflow-hidden rounded-4 border border-white border-opacity-10 shadow-lg" style={{ width: 140, height: 80 }}>
                      <img src={event.banner} className="w-100 h-100" style={{ objectFit: 'cover' }} alt="" />
                   </div>
                   <div>
                      <h5 className="mb-1 text-white fw-bold">{event.name}</h5>
                      <div className="small text-accent fw-bold text-uppercase tracking-widest">{new Date(event.start_at).toLocaleDateString()}</div>
                   </div>
                </div>
             </div>
             
             <div className="col-lg-1 mt-3 mt-lg-0">
                <label className="x-small text-muted-custom d-block mb-1 fw-700 tracking-wider">SLOT #</label>
                <input 
                  type="text" className="form-control bg-dark text-white border-white border-opacity-10 py-2 rounded-3 text-center"
                  placeholder="-" value={sno} onChange={e => setSno(e.target.value)}
                />
             </div>

             <div className="col-lg-5 mt-3 mt-lg-0">
                <label className="x-small text-muted-custom d-block mb-2 fw-700 tracking-wider">EVENT MAP / PARKING GRAPHIC</label>
                <div className="d-flex gap-3 align-items-center bg-dark bg-opacity-40 p-2 rounded-4 border border-white border-opacity-5">
                   <div className="flex-grow-1 ps-2 d-flex align-items-center">
                      {surl ? (
                         <div className="d-flex align-items-center gap-3 reveal">
                            <div className="rounded-3 overflow-hidden border border-white border-opacity-10 shadow-sm" style={{ width: 50, height: 32 }}>
                               <img src={surl} className="w-100 h-100 object-fit-cover transition-all hover:scale-125" alt="Map Preview" />
                            </div>
                            <div className="d-flex flex-column">
                               <span className="x-small fw-bold text-accent tracking-widest text-uppercase">DIGITAL ASSET READY</span>
                               <span className="x-small text-muted-custom opacity-50 fw-600">Encrypted Cloud Storage</span>
                            </div>
                         </div>
                      ) : (
                         <div className="d-flex align-items-center gap-3 py-1 opacity-50">
                            <div className="rounded-2 bg-white bg-opacity-5 border border-dashed border-white border-opacity-20 d-flex align-items-center justify-content-center" style={{ width: 44, height: 28 }}>
                               <MapIcon size={14} className="text-muted-custom" />
                            </div>
                            <span className="x-small fw-bold text-muted-custom tracking-widest text-uppercase">PENDING MAP UPLOAD</span>
                         </div>
                      )}
                   </div>
                   <label className="btn btn-outline-secondary btn-sm mb-0 rounded-3 d-flex align-items-center gap-2 py-2 px-3 transition-all hover:bg-white hover:bg-opacity-10 cursor-pointer border-white border-opacity-10">
                      <input type="file" className="d-none" onChange={handleFileUpload} accept="image/*" />
                      {uploading ? <Loader2 size={14} className="animate-spin text-accent" /> : <Upload size={14} className="text-accent" />} 
                      <span className="small fw-700">BROWSE LOCAL</span>
                   </label>
                </div>
             </div>

             <div className="col-lg-2 mt-4 mt-lg-0 text-end ps-lg-5">
                <button 
                   onClick={handleUpdate} 
                   disabled={saving === event.id || uploading}
                   className="btn btn-admin w-100 d-flex align-items-center justify-content-center gap-2 py-3 rounded-4 shadow-xl"
                >
                   {saving === event.id ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />} 
                   <span className="fw-bold tracking-wider">SAVE DETAILS</span>
                </button>
             </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="container-fluid p-0 reveal in">
      <header className="mb-5 d-flex justify-content-between align-items-end">
         <div>
            <h1 className="h2 fw-bold mb-2 text-white text-uppercase tracking-tighter">Event Logistics Hub</h1>
            <p className="text-muted-custom small mb-0">Directly upload and manage parking slots for events you're attending.</p>
         </div>
         <div className="d-flex align-items-center gap-4">
            <div className="position-relative">
               <input 
                  type="text" 
                  className="form-control bg-dark text-white border-white border-opacity-10 py-3 rounded-4 px-4 small"
                  style={{ width: 320, background: 'rgba(255,255,255,0.02)' }}
                  placeholder="Search Convoy ID, Title, Tag..." 
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
               />
            </div>
            <div className="badge bg-white bg-opacity-10 text-white p-3 rounded-4 d-flex align-items-center gap-3 border border-white border-opacity-10 shadow-lg px-4">
               <div className="rounded-circle bg-accent p-1 shadow-[0_0_10px_var(--admin-accent)]"><Check size={12} className="text-dark" /></div>
               <span className="small fw-800 text-uppercase tracking-widest text-accent">Real-time Cloud Sync</span>
            </div>
         </div>
      </header>

      {loading ? (
        <div className="py-5 text-center text-white">
           <Loader2 size={48} className="animate-spin text-accent mb-3 mx-auto opacity-20" />
           <div className="h6 text-muted-custom">Fetching convoy data...</div>
        </div>
      ) : (
        <div className="row">
           {events
             .filter(e => 
               e.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
               e.id.toString().includes(searchTerm) ||
               e.vtc.tag?.toLowerCase().includes(searchTerm.toLowerCase())
             )
             .map(e => <EventRow key={e.id} event={e} />)}
           {events.filter(e => 
               e.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
               e.id.toString().includes(searchTerm) ||
               e.vtc.tag?.toLowerCase().includes(searchTerm.toLowerCase())
             ).length === 0 && (
              <div className="col-12 py-5 text-center text-muted-custom opacity-50">No events match your current search criteria.</div>
           )}
        </div>
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
                  
                  <div className="d-flex justify-content-center pt-2">
                     <button onClick={() => setStatusModal({ ...statusModal, show: false })} className="btn px-5 py-2 rounded-4 mx-auto" style={{ backgroundColor: '#66fcf1', color: '#0b0c10' }}>UNDERSTOOD</button>
                  </div>
               </div>
            </div>
         </div>,
         document.body
      )}
    </div>
  );
};

export default AttendingManagement;
