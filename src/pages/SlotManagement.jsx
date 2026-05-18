import React, { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Check, X, Ticket, Calendar, Clock, Loader2, ChevronRight, Upload, Save, Grid, Map as MapIcon, RotateCcw, Hash } from 'lucide-react';
import config from '../config';

const SlotManagement = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Existing Slots for Setup
  const [existingSlots, setExistingSlots] = useState([]);
  
  // Custom Modal State
  const [statusModal, setStatusModal] = useState({ show: false, title: '', message: '', type: 'success' }); // type: success | error | confirm
  const [confirmAction, setConfirmAction] = useState(null);

  const showStatus = (title, message, type = 'success', onConfirm = null) => {
    setStatusModal({ show: true, title, message, type });
    if (onConfirm) setConfirmAction(() => onConfirm);
    else setConfirmAction(null);
  };
  const [setupEvent, setSetupEvent] = useState(null);
  const [slotUrl, setSlotUrl] = useState('');
  
  // Range State
  const [slotFrom, setSlotFrom] = useState(1);
  const [slotTo, setSlotTo] = useState(50);
  const [slotName, setSlotName] = useState('Main Area');
  
  // Modal States
  const [editModal, setEditModal] = useState({ show: false, slots: [], url: '', name: '', from: 1, to: 1, id: null });
  const [nameModal, setNameModal] = useState({ show: false, id: null, name: '' });
  const [assignModal, setAssignModal] = useState({ show: false, slot: null, vtcName: '' });
  
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (statusModal.show || editModal.show) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  }, [statusModal.show, editModal.show]);

  const fetchData = async () => {
    try {
      const eventRes = await fetch(`${config.API_BASE_URL}/api/tmp/vtc/events`);
      const eData = await eventRes.json();
      
      const now = new Date();
      const filtered = (eData.response || [])
        .filter(e => new Date(e.start_at) >= now)
        .sort((a, b) => new Date(a.start_at) - new Date(b.start_at));
      setEvents(filtered);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  useEffect(() => {
    const fetchExisting = async () => {
      if (!setupEvent) return;
      try {
        const res = await fetch(`${config.API_BASE_URL}/api/slots/${setupEvent.id}`);
        const data = await res.json();
        setExistingSlots(data.sort((a,b) => parseInt(a.slot_no) - parseInt(b.slot_no)));
      } catch(e) { console.error(e); }
    };
    fetchExisting();
  }, [setupEvent]);

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
      if (cloudData.secure_url) setSlotUrl(cloudData.secure_url);
    } catch (err) { showStatus("Upload Error", "Cloudinary access restricted.", "error"); } finally { setUploading(false); }
  };

  const handleSaveSetup = async () => {
    if (!slotUrl || !slotFrom || !slotTo) return showStatus("Setup Required", "Complete map and range fields.", "error");
    if (parseInt(slotFrom) > parseInt(slotTo)) return showStatus("Range Conflict", "The 'From' slot cannot be higher than 'To'.", "error");
    
    setSaving(true);
    try {
      const res = await fetch(`${config.API_BASE_URL}/api/slots/official/setup`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionStorage.getItem('token')}`
        },
        body: JSON.stringify({ 
          event_id: setupEvent.id, 
          slot_url: slotUrl, 
          slot_name: slotName,
          from: slotFrom, 
          to: slotTo 
        })
      });
      if (res.ok) {
        showStatus("Batch Online", `Successfully setup Slots #${slotFrom} to #${slotTo}!`, "success");
        // Update local list
        const updatedRes = await fetch(`${config.API_BASE_URL}/api/slots/${setupEvent.id}`);
        const updatedData = await updatedRes.json();
        setExistingSlots(updatedData.sort((a,b) => parseInt(a.slot_no) - parseInt(b.slot_no)));
      }
    } catch (e) { showStatus("Setup Failed", "Database rejected slot range injection.", "error"); } finally { setSaving(false); }
  };

  const handleEditSector = (slots) => {
    if (!slots || slots.length === 0) return;
    const img = slots[0].EventSlotImage;
    const numbers = slots.map(s => parseInt(s.slot_no));
    
    setEditModal({
      show: true,
      slots: slots,
      id: img.id,
      url: img.slot_url,
      name: img.slot_name || "Main Area",
      from: Math.min(...numbers),
      to: Math.max(...numbers)
    });
  };

  const handleEditName = (sector) => {
    setNameModal({
      show: true,
      id: sector.id,
      name: sector.slot_name || ''
    });
  };

  const handleSaveName = async () => {
    if (!nameModal.name) return showStatus("Required field", "Enter a name for the sector.", "error");
    
    setSaving(true);
    try {
      const res = await fetch(`${config.API_BASE_URL}/api/slots/official/sector/name/${nameModal.id}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionStorage.getItem('token')}`
        },
        body: JSON.stringify({ slot_name: nameModal.name })
      });
      
      const data = await res.json();
      if (res.ok) {
        showStatus("Success", "Sector name updated!", "success");
        setNameModal({ ...nameModal, show: false });
        // Refresh local list
        const updatedRes = await fetch(`${config.API_BASE_URL}/api/slots/${setupEvent.id}`);
        const updatedData = await updatedRes.json();
        setExistingSlots(updatedData.sort((a,b) => parseInt(a.slot_no) - parseInt(b.slot_no)));
      } else {
        showStatus("Update Blocked", data.message || "Failed to update name.", "error");
      }
    } catch (e) { showStatus("Update Failed", "Connection failure.", "error"); } finally { setSaving(false); }
  };

  const handleDeleteSector = (sectorId, sectorName) => {
    showStatus(
      "Remove Parking Zone?",
      `This will completely delete "${sectorName}" and all its slots. This action CANNOT be undone.`,
      "confirm",
      async () => {
        try {
          const res = await fetch(`${config.API_BASE_URL}/api/slots/official/sector/${sectorId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${sessionStorage.getItem('token')}` }
          });
          const data = await res.json();
          if (res.ok) {
            showStatus("Sector Removed", data.message, "success");
            // Refresh
            const updatedRes = await fetch(`${config.API_BASE_URL}/api/slots/${setupEvent.id}`);
            const updatedData = await updatedRes.json();
            setExistingSlots(updatedData.sort((a,b) => parseInt(a.slot_no) - parseInt(b.slot_no)));
          } else {
            showStatus("Action Denied", data.message, "error");
          }
        } catch (e) { showStatus("Error", "Could not remove sector.", "error"); }
      }
    );
  };

  const handleClearSlot = (slot) => {
    showStatus(
      "Clear Reservation?", 
      `Are you sure you want to remove the booking for ${slot.booked_by}? This will make Slot #${slot.slot_no} available again.`,
      "confirm",
      async () => {
        try {
          const res = await fetch(`${config.API_BASE_URL}/api/slots/clear/${slot.id}`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${sessionStorage.getItem('token')}` }
          });
          if (res.ok) {
            // Refresh
            const updatedRes = await fetch(`${config.API_BASE_URL}/api/slots/${setupEvent.id}`);
            const updatedData = await updatedRes.json();
            setExistingSlots(updatedData.sort((a,b) => parseInt(a.slot_no) - parseInt(b.slot_no)));
          }
        } catch (e) { showStatus("Error", "Could not clear slot.", "error"); }
      }
    );
  };

  const handleManualAssign = async () => {
    if (!assignModal.vtcName) return showStatus("Required field", "Enter VTC name to assign.", "error");
    try {
      const res = await fetch(`${config.API_BASE_URL}/api/slots/assign/${assignModal.slot.id}`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionStorage.getItem('token')}` 
        },
        body: JSON.stringify({ vtc_name: assignModal.vtcName })
      });
      if (res.ok) {
        showStatus("Success", `Slot #${assignModal.slot.slot_no} assigned to ${assignModal.vtcName}`, "success");
        setAssignModal({ show: false, slot: null, vtcName: '' });
        // Refresh
        const updatedRes = await fetch(`${config.API_BASE_URL}/api/slots/${setupEvent.id}`);
        const updatedData = await updatedRes.json();
        setExistingSlots(updatedData.sort((a,b) => parseInt(a.slot_no) - parseInt(b.slot_no)));
      }
    } catch(e) { showStatus("Error", "Could not assign slot.", "error"); }
  };

  const handleModalFileUpload = async (e) => {
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
      if (cloudData.secure_url) setEditModal({ ...editModal, url: cloudData.secure_url });
    } catch (err) { showStatus("Upload Error", "Cloudinary access restricted.", "error"); } finally { setUploading(false); }
  };

  return (
    <div className="container-fluid p-0 reveal in">
      <header className="mb-5 d-flex justify-content-between align-items-center">
        <div>
          <h1 className="h3 fw-bold mb-2 text-white">Event Slot Studio</h1>
          <p className="text-muted-custom small mb-0">Design your parking floor and manage incoming VTC reservations.</p>
        </div>
        {setupEvent && (
          <button onClick={() => setSetupEvent(null)} className="btn btn-outline-secondary rounded-pill px-4 d-flex align-items-center gap-2 border-white border-opacity-10">
            <RotateCcw size={16} /> <span className="pt-1 small fw-bold">BACK TO EVENTS</span>
          </button>
        )}
      </header>

      {setupEvent ? (
        <div className="data-table p-5 border-0 shadow-2xl reveal zoom">
           <div className="row">
              <div className="col-lg-5">
                 <div className="rounded-4 overflow-hidden border border-white border-opacity-10 shadow-lg mb-4" style={{ height: 250 }}>
                    <img src={setupEvent.banner} className="w-100 h-100" style={{ objectFit: 'cover' }} alt="" />
                 </div>
                 <h4 className="fw-bold text-white mb-1">{setupEvent.name}</h4>
                 <div className="small text-accent fw-bold text-uppercase tracking-widest mb-4">Targeting: {new Date(setupEvent.start_at).toLocaleDateString()}</div>
                 
                 <div className="mt-5 p-4 rounded-4 border border-white border-opacity-10" style={{ background: 'rgba(255,255,255,0.03)' }}>
                    <div className="d-flex align-items-center gap-3 mb-3">
                       <div className="rounded-circle bg-accent p-1"><Check size={12} className="text-dark" /></div>
                       <span className="small text-muted-custom fw-600">Old slots in this range will be replaced.</span>
                    </div>
                    <div className="d-flex align-items-center gap-3">
                       <div className="rounded-circle bg-accent p-1"><Check size={12} className="text-dark" /></div>
                       <span className="small text-muted-custom fw-600">Public booking form will update at once.</span>
                    </div>
                 </div>
              </div>

              <div className="col-lg-7 ps-lg-5 mt-5 mt-lg-0">
                 <h5 className="fw-bold text-white mb-5 d-flex align-items-center gap-2">
                    <MapIcon size={20} className="text-accent" /> Configure Slot Map
                 </h5>
                 
                 <div className="mb-5">
                    <label className="x-small text-muted-custom d-block mb-3 fw-bold tracking-widest text-uppercase">1. UPLOAD PARKING GRAPHIC</label>
                    <div className="upload-zone p-4 rounded-4 border-2 border-dashed d-flex align-items-center justify-content-center transition-all" 
                         style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.1)', height: 260 }}>
                       {uploading ? (
                          <Loader2 size={32} className="animate-spin text-accent" />
                       ) : slotUrl ? (
                          <div className="text-center w-100 h-100 position-relative">
                             <img src={slotUrl} className="w-100 h-100 object-fit-contain rounded-3" alt="Slot Map" />
                             <label className="position-absolute top-0 end-0 m-2 btn btn-dark btn-sm rounded-circle p-2 shadow-lg cursor-pointer">
                                <input type="file" className="d-none" onChange={handleFileUpload} accept="image/*" />
                                <Upload size={14} />
                             </label>
                          </div>
                       ) : (
                          <label className="cursor-pointer text-center py-5 m-0 w-100 h-100 flex-column d-flex center justify-center">
                             <input type="file" className="d-none" onChange={handleFileUpload} accept="image/*" />
                             <div className="rounded-circle bg-accent bg-opacity-10 p-3 mb-3 text-accent border border-accent border-opacity-10 d-inline-flex mx-auto">
                                <Upload size={24} />
                             </div>
                             <div className="small fw-bold text-white mb-1">Select Map Image</div>
                             <div className="x-small text-muted-custom">Supports JPG/PNG for floor plan</div>
                          </label>
                       )}
                    </div>
                 </div>

                 <div className="mb-5">
                    <label className="x-small text-muted-custom d-block mb-3 fw-bold tracking-widest text-uppercase">2. AREA NAME & RANGE</label>
                    <div className="p-3 rounded-4 bg-dark bg-opacity-20 border border-white border-opacity-10 mb-4">
                       <div className="x-small text-muted-custom fw-bold mb-1">PARKING SECTOR NAME</div>
                       <input 
                          type="text" className="form-control form-control-sm bg-transparent border-0 text-white fw-bold p-0 h5"
                          value={slotName} onChange={e => setSlotName(e.target.value)}
                          placeholder="e.g. Primary Garage / City Center"
                       />
                    </div>
                    <div className="row g-3">
                       <div className="col-6">
                          <div className="d-flex align-items-center gap-3 p-3 rounded-4 bg-dark bg-opacity-20 border border-white border-opacity-10">
                             <div className="p-2 rounded-3 bg-accent bg-opacity-10 text-accent"><Hash size={18} /></div>
                             <div className="flex-grow-1">
                                <div className="x-small text-muted-custom fw-bold">FROM</div>
                                <input 
                                   type="number" className="form-control form-control-sm bg-transparent border-0 text-white fw-bold p-0"
                                   value={slotFrom} onChange={e => setSlotFrom(e.target.value)}
                                />
                             </div>
                          </div>
                       </div>
                       <div className="col-6">
                          <div className="d-flex align-items-center gap-3 p-3 rounded-4 bg-dark bg-opacity-20 border border-white border-opacity-10">
                             <div className="p-2 rounded-3 bg-accent bg-opacity-10 text-accent"><Hash size={18} /></div>
                             <div className="flex-grow-1">
                                <div className="x-small text-muted-custom fw-bold">TO</div>
                                <input 
                                   type="number" className="form-control form-control-sm bg-transparent border-0 text-white fw-bold p-0"
                                   value={slotTo} onChange={e => setSlotTo(e.target.value)}
                                />
                             </div>
                          </div>
                       </div>
                    </div>
                    <div className="mt-4 p-4 rounded-4 border border-accent border-opacity-10 bg-accent bg-opacity-5 animate-pulse">
                       <div className="h6 text-accent d-flex align-items-center gap-2 mb-0">
                          <Check size={16} /> Individual Spots System
                       </div>
                       <div className="small text-muted-custom opacity-75 mt-1">
                          System will generate and link slots **#{slotFrom}** to **#{slotTo}**.
                       </div>
                    </div>
                 </div>

                  <button onClick={handleSaveSetup} disabled={saving || uploading} className="btn btn-admin w-100 py-4 rounded-4 shadow-2xl h4 fw-bold tracking-wider animate-pulse mb-0">
                     {saving ? <Loader2 size={24} className="animate-spin mx-auto" /> : 'GENERATE BOOKING ENGINE'}
                  </button>
               </div>
            </div>

            <div className="pt-5 mt-5 border-top border-white border-opacity-5">
              <div className="d-flex justify-content-between align-items-center mb-5">
                <h6 className="text-white fw-bold mb-0 d-flex align-items-center gap-3">
                  <Grid size={22} className="text-accent" /> 
                  <span className="tracking-tight h5 mb-0">Event Parking Strategy</span>
                </h6>
                <span className="badge-outline text-muted-custom x-small px-3 py-2 border-opacity-10">AUTO-SYNCED WITH DB</span>
              </div>
              
              <div className="row g-4">
               {(() => {
                  const groups = existingSlots.reduce((acc, s) => {
                     const sectorId = s.EventSlotImage?.id || 'default';
                     if(!acc[sectorId]) acc[sectorId] = [];
                     acc[sectorId].push(s);
                     return acc;
                  }, {});

                  return Object.entries(groups).length === 0 ? (
                     <div className="col-12 py-5 text-center data-table border-white border-opacity-5 bg-white bg-opacity-5 rounded-4 border">
                         <MapIcon size={40} className="text-muted-custom opacity-20 mb-3" />
                         <div className="small text-muted-custom opacity-75">No parking configurations detected for this session.</div>
                     </div>
                  ) : Object.entries(groups).map(([sectorId, slots], idx) => (
                     <div key={idx} className="col-12">
                        <div className="data-table p-0 border-0 shadow-2xl overflow-hidden reveal group" style={{ background: 'rgba(255,255,255,0.01)' }}>
                           <div className="row g-0">
                              <div className="col-md-2 border-end border-white border-opacity-5 position-relative">
                                 <div className="w-100 h-100 bg-dark" style={{ minHeight: '140px' }}>
                                    <img src={slots[0]?.EventSlotImage?.slot_url} className="w-100 h-100 object-fit-cover opacity-50 transition-all group-hover:opacity-100 group-hover:scale-105" alt="Sector" />
                                 </div>
                                 <div className="position-absolute top-0 start-0 p-3 w-100">
                                    <div className="x-small px-2 py-1 rounded-2 fw-bold text-white tracking-widest text-truncate" style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)' }}>
                                       {slots[0]?.EventSlotImage?.slot_name || `SECTOR ${idx + 1}`}
                                    </div>
                                 </div>
                              </div>
                              <div className="col-md-10 p-4 d-flex flex-column">
                                  <div className="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom border-white border-opacity-5">
                                     <div className="x-small text-muted-custom fw-bold text-uppercase tracking-widest">ALLOCATED CAPACITY: {slots.length} SPOTS</div>
                                     <div className="d-flex gap-3 align-items-center">
                                        <button onClick={() => handleDeleteSector(slots[0]?.EventSlotImage?.id, slots[0]?.EventSlotImage?.slot_name)} 
                                                className="btn btn-sm btn-outline-danger px-3 py-1 rounded-pill x-small fw-bold transition-all border-opacity-30">
                                           DELETE ZONE
                                        </button>
                                        <button onClick={() => handleEditName(slots[0]?.EventSlotImage)} className="btn btn-sm px-3 py-1 rounded-pill x-small fw-bold transition-all d-flex align-items-center gap-2" 
                                                style={{ background: 'var(--admin-accent)', color: '#000', border: 'none', boxShadow: '0 0 15px rgba(102, 252, 241, 0.2)' }}>
                                           <RotateCcw size={12} /> EDIT NAME
                                        </button>
                                        <div className="d-flex align-items-center gap-2 x-small fw-bold">
                                           <div className="rounded-circle bg-accent shadow-[0_0_10px_var(--admin-accent)]" style={{ width: 6, height: 6 }}></div> AVAILABLE
                                        </div>
                                        <div className="d-flex align-items-center gap-2 x-small fw-bold">
                                           <div className="rounded-circle bg-danger shadow-[0_0_10px_#ff4d4d]" style={{ width: 6, height: 6 }}></div> RESERVED
                                        </div>
                                     </div>
                                  </div>
                                 <div className="d-flex flex-wrap gap-2">
                                    {slots.sort((a,b) => parseInt(a.slot_no) - parseInt(b.slot_no)).map(s => (
                                        <div key={s.id} 
                                             onClick={() => s.booked_by ? handleClearSlot(s) : setAssignModal({ show: true, slot: s, vtcName: '' })}
                                             className={`slot-pill transition-all cursor-pointer d-flex align-items-center gap-3 px-3 py-2 rounded-3 small fw-bold border ${
                                                s.booked_by 
                                                ? 'bg-danger bg-opacity-10 text-danger border-danger border-opacity-30 shadow-[0_0_15px_rgba(255,75,75,0.1)] hover:bg-opacity-20 translate-y-px active:scale-95' 
                                                : 'bg-accent bg-opacity-5 text-white border-white border-opacity-10 hover:border-accent hover:text-accent shadow-sm'
                                             }`} 
                                             title={s.booked_by ? `MANUAL OVERRIDE: ${s.booked_by}` : 'CLICK TO MANUALLY ASSIGN'}>
                                           <div className="d-flex align-items-center gap-2">
                                             <span className="opacity-50 text-white fw-normal x-small">#</span>{s.slot_no}
                                           </div>
                                           {s.booked_by && (
                                             <div className="border-start border-white border-opacity-10 ps-2 d-flex align-items-center gap-2">
                                               <span className="text-white x-small fw-600 opacity-75">{s.booked_by}</span>
                                               <X size={10} className="ms-1 opacity-50" />
                                             </div>
                                           )}
                                        </div>
                                    ))}
                                 </div>
                              </div>
                           </div>
                        </div>
                     </div>
                  ));
              })()}
              </div>
            </div>
         </div>

      ) : (
        <>
          <h5 className="mb-4 d-flex align-items-center gap-3 text-white fw-bold">
            <Calendar size={22} className="text-accent" /> Upcoming Official Events
          </h5>
          <div className="row g-4 mb-5">
            {loading ? (
                <div className="col-12 text-center py-5">
                  <Loader2 size={40} className="animate-spin text-accent opacity-50 mb-3 mx-auto" />
                  <div className="text-muted-custom small">Synchronizing TruckersMP Roster...</div>
                </div>
            ) : events.length === 0 ? (
                <div className="col-12 text-center py-5 data-table border-0 shadow-sm opacity-100 h5 fw-normal text-muted-custom">
                  No official upcoming convoys detected for 73933.
                </div>
            ) : events.map(e => (
                <div key={e.id} className="col-lg-4">
                  <div className="data-table h-100 p-0 overflow-hidden border-0 shadow-lg group">
                      <div className="position-relative" style={{ height: 160 }}>
                        <img src={e.banner} className="w-100 h-100 transition-transform duration-700 group-hover:scale-110" style={{ objectFit: 'cover' }} alt="" />
                        <div className="position-absolute top-0 p-3 w-100 d-flex justify-content-between">
                            <span className="badge bg-dark bg-opacity-80 backdrop-blur-md px-3 py-2 rounded-4 text-accent border border-white border-opacity-10 fw-bold">{new Date(e.start_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="p-4">
                        <h5 className="text-white fw-bold mb-2 text-truncate">{e.name}</h5>
                        <div className="d-flex align-items-center gap-2 text-muted-custom x-small mb-4 tracking-wider fw-700">
                            <Clock size={14} className="text-accent" /> {e.server.name.toUpperCase()}
                        </div>
                        <button onClick={() => setSetupEvent(e)} className="btn btn-admin w-100 d-flex align-items-center justify-content-center gap-3 py-3 rounded-4 transition-all">
                            <Grid size={18} /> SETUP SLOTS
                        </button>
                      </div>
                  </div>
                </div>
            ))}
          </div>
        </>
      )}

      {/* Edit Sector Modal - NO LONGER USED, REPLACED BY NAME MODAL */}
      
      {/* Edit Name Modal - USING PORTAL */}
      {nameModal.show && createPortal(
         <div className="modal-overlay position-fixed top-0 start-0 w-100 h-100 z-index-master">
            <div className="data-table p-0 border-0 shadow-2xl reveal zoom w-100 overflow-hidden" style={{ maxWidth: 450 }}>
               <div className="p-4 border-bottom border-white border-opacity-5 d-flex justify-content-between align-items-center">
                  <h5 className="text-white fw-bold mb-0 d-flex align-items-center gap-3">
                     <Grid size={20} className="text-accent" /> RENAME SECTOR
                  </h5>
                  <button onClick={() => setNameModal({ ...nameModal, show: false })} className="btn btn-dark rounded-circle p-2 border-0"><X size={18} /></button>
               </div>
               <div className="p-5">
                  <div className="mb-5">
                     <label className="x-small text-muted-custom fw-bold mb-2 tracking-widest text-uppercase d-block">NEW ZONE NAME</label>
                     <div className="p-3 rounded-4 bg-dark bg-opacity-20 border border-white border-opacity-10">
                        <input 
                           type="text" className="form-control bg-transparent border-0 text-white fw-bold p-0 shadow-none h5 mb-0"
                           value={nameModal.name} onChange={e => setNameModal({...nameModal, name: e.target.value})}
                           placeholder="e.g. Primary Garage"
                        />
                     </div>
                  </div>

                  <div className="d-flex gap-3">
                     <button onClick={() => setNameModal({ ...nameModal, show: false })} className="btn btn-outline-secondary w-100 py-3 rounded-4 fw-bold">CANCEL</button>
                     <button onClick={handleSaveName} disabled={saving} className="btn btn-admin w-100 py-3 rounded-4 fw-bold">
                        {saving ? <Loader2 size={24} className="animate-spin mx-auto" /> : 'SAVE CHANGES'}
                     </button>
                  </div>
               </div>
            </div>
         </div>,
         document.body
      )}

      {/* Manual Assign Modal - USING PORTAL */}
      {assignModal.show && createPortal(
         <div className="modal-overlay position-fixed top-0 start-0 w-100 h-100 z-index-master">
            <div className="data-table p-0 border-0 shadow-2xl reveal zoom w-100 overflow-hidden" style={{ maxWidth: 450 }}>
               <div className="p-4 border-bottom border-white border-opacity-5 d-flex justify-content-between align-items-center">
                  <h5 className="text-white fw-bold mb-0">Manual Assignment</h5>
                  <button onClick={() => setAssignModal({ ...assignModal, show: false })} className="btn btn-dark rounded-circle p-2 border-0"><X size={18} /></button>
               </div>
               <div className="p-5">
                  <div className="text-center mb-5">
                     <div className="rounded-circle bg-accent bg-opacity-10 text-accent mx-auto d-flex align-items-center justify-content-center mb-3" style={{ width: 50, height: 50 }}>
                        <Ticket size={24} />
                     </div>
                     <h4 className="fw-bold text-white mb-2">Slot #{assignModal.slot.slot_no}</h4>
                     <p className="text-muted-custom small">Bypass requests and directly allocate this spot.</p>
                  </div>

                  <div className="mb-5">
                     <label className="x-small text-muted-custom fw-bold mb-2 tracking-widest text-uppercase d-block">TARGET VTC NAME</label>
                     <div className="p-3 rounded-4 bg-dark bg-opacity-20 border border-white border-opacity-10">
                        <input 
                           type="text" className="form-control bg-transparent border-0 text-white fw-bold p-0 shadow-none h5 mb-0"
                           value={assignModal.vtcName} onChange={e => setAssignModal({...assignModal, vtcName: e.target.value})}
                           placeholder="Enter VTC full name..."
                        />
                     </div>
                  </div>

                  <div className="d-flex gap-3">
                     <button onClick={() => setAssignModal({ ...assignModal, show: false })} className="btn btn-outline-secondary w-100 py-3 rounded-4 fw-bold">CANCEL</button>
                     <button onClick={handleManualAssign} className="btn btn-admin w-100 py-3 rounded-4 fw-bold">ASSIGN NOW</button>
                  </div>
               </div>
            </div>
         </div>,
         document.body
      )}

      {/* Global Status Modal - USING PORTAL */}
      {statusModal.show && createPortal(
         <div className="modal-overlay position-fixed top-0 start-0 w-100 h-100 z-index-master">
            <div className="data-table p-0 border-0 shadow-2xl reveal zoom w-100 overflow-hidden" style={{ maxWidth: 450 }}>
               <div className="p-5 text-center">
                  <div className={`rounded-circle mx-auto d-flex align-items-center justify-content-center mb-4 border-2 border ${statusModal.type === 'error' ? 'text-danger border-danger' : 'text-accent border-accent'}`} 
                       style={{ width: 64, height: 64, background: 'rgba(255,255,255,0.03)' }}>
                     {statusModal.type === 'error' ? <X size={32} /> : statusModal.type === 'confirm' ? <Ticket size={32} /> : <Check size={32} />}
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
         </div>,
         document.body
      )}
    </div>
  );
};

export default SlotManagement;
