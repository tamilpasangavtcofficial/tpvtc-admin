import React, { useState, useEffect } from 'react';
import { Inbox, CheckCircle, XCircle, ExternalLink, MessageSquare, Users, Hash, Loader2, Check, X, Zap, Shield, Link as LinkIcon, User, Calendar, MapPin } from 'lucide-react';
import config from '../config';

const BookingManagement = () => {
   const [requests, setRequests] = useState([]);
   const [loading, setLoading] = useState(true);
   const [saving, setSaving] = useState(false);
   const [statusModal, setStatusModal] = useState({ show: false, title: '', message: '', type: 'success' });
   const [officialEvents, setOfficialEvents] = useState({});

   const fetchData = async () => {
      setLoading(true);
      try {
         // Fetch names from official registry
         const eRes = await fetch(`${config.API_BASE_URL}/api/tmp/vtc/events`);
         const eData = await eRes.json();
         const nameMap = {};
         (eData.response || []).forEach(e => { nameMap[e.id] = e.name; });
         setOfficialEvents(nameMap);

         // Using the proven direct endpoint from SlotManagement
         const res = await fetch(`${config.API_BASE_URL}/api/slots/requests/pending`);
         const data = await res.json();
         if (Array.isArray(data)) {
            setRequests(data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
         }
      } catch (e) {
         showStatus("Connection Error", "Could not reach the operational server.", "error");
      } finally {
         setLoading(false);
      }
   };

   useEffect(() => {
      fetchData();
   }, []);

   const handleAction = async (id, status) => {
      if (saving) return;
      setSaving(true);
      try {
         const endpoint = status === 'approved'
            ? `${config.API_BASE_URL}/api/slots/approve/${id}`
            : `${config.API_BASE_URL}/api/slots/reject/${id}`;

         const res = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${sessionStorage.getItem('token')}` }
         });

         if (res.ok) {
            showStatus(
               status === 'approved' ? "Slot Reserved!" : "Request Removed",
               status === 'approved' ? "The VTC has been officially assigned their spot." : "The application has been cleared from the queue.",
               status === 'approved' ? "success" : "error"
            );
            fetchData();
         } else {
            showStatus("Action Failed", "Database rejected the command.", "error");
         }
      } catch (e) {
         showStatus("Execution Error", "Check server connectivity.", "error");
      } finally {
         setSaving(false);
      }
   };

   const showStatus = (title, message, type) => {
      setStatusModal({ show: true, title, message, type });
   };

   if (loading && requests.length === 0) return (
      <div className="text-center py-5 reveal in">
         <Loader2 size={40} className="animate-spin text-accent opacity-50 mb-3 mx-auto" />
         <div className="text-muted-custom small fw-bold tracking-widest text-uppercase">SYNCHRONIZING GLOBAL REQUESTS...</div>
      </div>
   );

   return (
      <div className="reveal in">
         <div className="d-flex justify-content-between align-items-center mb-5">
            <div>
               <h1 className="h3 fw-bold mb-2 text-white">VTC Request Hub</h1>
               <p className="text-muted-custom small mb-0 tracking-wider">Review parking applications and manage event participants.</p>
            </div>
            <div className="d-flex gap-4">
               <button onClick={fetchData} className="btn btn-outline-secondary border-0 p-2 text-muted-custom hover:text-white transition-all d-flex align-items-center gap-2">
                  <Zap size={16} /> REFRESH QUEUE
               </button>
               <div className="d-flex gap-3 ps-3 border-start border-white border-opacity-10 align-items-center">
                  <div className="text-end pe-3">
                     <div className="h4 text-white fw-bold mb-0">{requests.length}</div>
                     <div className="x-small text-muted-custom fw-bold text-uppercase tracking-widest">PENDING</div>
                  </div>
               </div>
            </div>
         </div>

         {requests.length === 0 ? (
            <div className="data-table p-5 text-center border-0 shadow-2xl reveal zoom">
               <div className="rounded-circle bg-accent bg-opacity-5 p-4 d-inline-flex mb-4 text-accent opacity-50 border border-accent border-opacity-10">
                  <Inbox size={48} />
               </div>
               <h4 className="text-white fw-bold mb-2">Queue Status: Clear</h4>
               <p className="text-muted-custom small mb-0">No pending VTC applications were detected in the operational registry.</p>
            </div>
         ) : (
            <div className="row g-4">
               {requests.map(req => (
                  <div key={req.id} className="col-lg-6 col-xl-4">
                     <div className="data-table p-0 border-0 shadow-2xl reveal zoom h-100 overflow-hidden group">
                        {/* Card Header: VTC Meta & Slot Image */}
                        <div className="position-relative border-bottom border-white border-opacity-5">
                           <div className="position-relative">
                              {req.EventSlot?.EventSlotImage?.slot_url ? (
                                 <div className="w-100 bg-dark" style={{ height: '160px' }}>
                                    <img src={req.EventSlot.EventSlotImage.slot_url} alt="Slot map" className="w-100 h-100 object-fit-cover opacity-75" />
                                 </div>
                              ) : (
                                 <div className="w-100 bg-dark bg-opacity-50 d-flex align-items-center justify-content-center" style={{ height: '160px' }}>
                                    <Shield size={40} className="text-white opacity-40" />
                                 </div>
                              )}
                              <div className="position-absolute bottom-0 start-0 w-100 p-3 d-flex flex-column gap-2 align-items-start" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0) 100%)' }}>
                                 <a href={`https://truckersmp.com/events/${req.event_id}`} target="_blank" rel="noreferrer"
                                    className="badge border border-white border-opacity-20 px-3 py-2 rounded-pill small fw-bold d-flex align-items-center gap-2 hover:bg-white hover:bg-opacity-10 transition-all text-decoration-none shadow-sm mw-100"
                                    style={{ background: 'rgba(3,5,9,0.9)', backdropFilter: 'blur(10px)', color: '#fff' }}>
                                    <ExternalLink size={14} className="text-accent" />
                                    <span className="text-truncate" style={{ maxWidth: '180px' }}>{officialEvents[req.event_id] || `EVENT #${req.event_id}`}</span>
                                 </a>
                                 <div className="badge border border-accent px-3 py-2 rounded-pill small fw-bold d-flex align-items-center gap-1 shadow-lg"
                                    style={{ background: 'var(--admin-accent)', color: '#000' }}>
                                    <MapPin size={14} /> <span className="pt-1">SLOT #{req.EventSlot?.slot_no || req.event_slot_id}</span>
                                 </div>
                              </div>
                           </div>

                           <div className="p-4" style={{ background: 'rgba(255,255,255,0.02)' }}>
                              <h5 className="text-white fw-bold mb-1 d-flex align-items-center gap-2">
                                 <Shield size={18} className="text-accent shadow-sm" /> {req.vtc_name}
                              </h5>
                              <div className="d-flex align-items-center gap-2 text-white opacity-75 x-small fw-bold text-uppercase tracking-widest mt-2">
                                 <Users size={12} className="text-accent" /> {req.vtc_member_count} PARTICIPANTS
                              </div>
                           </div>
                        </div>

                        {/* Card Body: Credentials */}
                        <div className="p-4">
                           <div className="space-y-4">
                              <div className="d-flex gap-3 align-items-center p-3 rounded-4 bg-dark bg-opacity-20 border border-white border-opacity-10 shadow-sm">
                                 <div className="p-2 rounded-3 d-flex align-items-center justify-content-center text-accent shadow-sm" style={{ background: 'rgba(102, 252, 241, 0.1)', width: 40, height: 40 }}>
                                    <User size={20} />
                                 </div>
                                 <div className="overflow-hidden">
                                    <div className="x-small text-white fw-bold text-uppercase opacity-50 tracking-widest mb-1">DISCORD IDENTITY</div>
                                    <div className="text-white small fw-bold text-truncate">{req.discord_username || 'NOT_PROVIDED'}</div>
                                 </div>
                              </div>

                              <div className="d-flex gap-3 align-items-center p-3 rounded-4 bg-dark bg-opacity-20 border border-white border-opacity-10 shadow-sm">
                                 <div className="p-2 rounded-3 d-flex align-items-center justify-content-center text-accent shadow-sm" style={{ background: 'rgba(102, 252, 241, 0.1)', width: 40, height: 40 }}>
                                    <LinkIcon size={20} />
                                 </div>
                                 <div className="overflow-hidden w-100">
                                    <div className="x-small text-white fw-bold text-uppercase opacity-50 tracking-widest mb-1">TMP PROFILE</div>
                                    <a href={req.vtc_link} target="_blank" rel="noreferrer" className="text-accent small fw-bold text-truncate d-block hover:underline" style={{ color: 'var(--admin-accent)', textDecoration: 'none' }}>
                                       {req.vtc_link?.replace('https://truckersmp.com/', '') || 'VIEW_LINK'}
                                    </a>
                                 </div>
                              </div>
                           </div>

                           {/* Commands */}
                           <div className="row g-3 mt-4">
                              <div className="col-8">
                                 <button
                                    onClick={() => handleAction(req.id, 'approved')}
                                    disabled={saving}
                                    className="btn btn-admin w-100 py-3 rounded-4 d-flex align-items-center justify-content-center gap-2 fw-bold"
                                 >
                                    <Check size={18} /> APPROVE
                                 </button>
                              </div>
                              <div className="col-4">
                                 <button
                                    onClick={() => handleAction(req.id, 'rejected')}
                                    disabled={saving}
                                    className="btn btn-outline-danger w-100 py-3 rounded-4 border-white border-opacity-10 d-flex align-items-center justify-content-center"
                                 >
                                    <X size={18} />
                                 </button>
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>
               ))}
            </div>
         )}

         {/* Modern Status Modal */}
         {statusModal.show && (
            <div className="modal-overlay position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-4"
               style={{ background: 'rgba(3,5,9,0.95)', backdropFilter: 'blur(15px)', zIndex: 100000 }}>
               <div className="data-table p-0 border-0 shadow-2xl reveal zoom w-100 overflow-hidden" style={{ maxWidth: 450, background: '#111' }}>
                  <div className="p-5 text-center">
                     <div className={`rounded-circle mx-auto d-flex align-items-center justify-content-center mb-4 border-2 ${statusModal.type === 'error' ? 'text-danger border-danger' : 'text-accent border-accent'}`}
                        style={{ width: 64, height: 64, background: 'rgba(255,255,255,0.03)' }}>
                        {statusModal.type === 'error' ? <XCircle size={32} /> : <CheckCircle size={32} />}
                     </div>
                     <h4 className="fw-bold text-white mb-2">{statusModal.title}</h4>
                     <p className="text-muted-custom small mb-4 opacity-75">{statusModal.message}</p>
                     <button onClick={() => setStatusModal({ ...statusModal, show: false })} className="btn btn-admin px-5 py-2 rounded-pill fw-bold">UNDERSTOOD</button>
                  </div>
               </div>
            </div>
         )}
      </div>
   );
};

export default BookingManagement;
