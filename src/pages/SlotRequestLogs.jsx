import React, { useState, useEffect } from 'react';
import { History, CheckCircle, XCircle, Info, Hash, Loader2, Shield, Calendar, MapPin, Search, Filter } from 'lucide-react';

import config from '../config';

const SlotRequestLogs = () => {
   const [logs, setLogs] = useState([]);
   const [loading, setLoading] = useState(true);
   const [filter, setFilter] = useState('all'); // all, approved, rejected, pending
   const [searchTerm, setSearchTerm] = useState('');
   const [officialEvents, setOfficialEvents] = useState({});

   const fetchLogs = async () => {
      setLoading(true);
      try {
         // Fetch names from official registry
         const eRes = await fetch(`${config.API_BASE_URL}/api/tmp/vtc/events`);
         const eData = await eRes.json();
         const nameMap = {};
         (eData.response || []).forEach(e => { nameMap[e.id] = e.name; });
         setOfficialEvents(nameMap);

         const res = await fetch(`${config.API_BASE_URL}/api/slots/requests/logs`);
         const data = await res.json();
         if (Array.isArray(data)) {
            setLogs(data);
         }
      } catch (e) {
         console.error(e);
      } finally {
         setLoading(false);
      }
   };

   useEffect(() => {
      fetchLogs();
   }, []);

   const filteredLogs = logs.filter(log => {
      const matchesFilter = filter === 'all' || log.status === filter;
      const matchesSearch = log.vtc_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
         log.event_id.toString().includes(searchTerm);
      return matchesFilter && matchesSearch;
   });

   if (loading) return (
      <div className="text-center py-5 reveal in">
         <Loader2 size={40} className="animate-spin text-accent opacity-50 mb-3 mx-auto" />
         <div className="text-muted-custom small fw-bold tracking-widest text-uppercase">LOADING ARCHIVAL DATA...</div>
      </div>
   );

   return (
      <div className="reveal in">
         <div className="d-flex justify-content-between align-items-center mb-5">
            <div>
               <h1 className="h3 fw-bold mb-2 text-white">Slot Request History</h1>
               <p className="text-muted-custom small mb-0 tracking-wider">Audit log of all processed and pending VTC applications.</p>
            </div>
            <div className="d-flex gap-3">
               <div className="position-relative">
                  <Search size={16} className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted-custom" />
                  <input
                     type="text"
                     placeholder="Search VTC or Event ID..."
                     className="form-control bg-dark bg-opacity-20 border-white border-opacity-10 text-white rounded-pill ps-5 py-2 small"
                     style={{ width: '250px' }}
                     value={searchTerm}
                     onChange={(e) => setSearchTerm(e.target.value)}
                  />
               </div>
               <select
                  className="form-select bg-dark bg-opacity-20 border-white border-opacity-10 text-white rounded-pill px-4 py-2 small w-auto"
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
               >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
               </select>
            </div>
         </div>

         <div className="data-table border-0 shadow-xl overflow-hidden reveal">
            <div className="table-responsive">
               <table className="table table-dark table-hover mb-0 border-0">
                  <thead className="small text-muted-custom text-uppercase fw-700 tracking-widest">
                     <tr>
                        <th className="py-4 px-5 border-0">VTC INFORMATION</th>
                        <th className="py-4 px-5 border-0">EVENT & SLOT</th>
                        <th className="py-4 px-5 border-0">ACTION DATE</th>
                        <th className="py-4 px-5 border-0 text-end">STATUS</th>
                     </tr>
                  </thead>
                  <tbody>
                     {filteredLogs.length === 0 ? (
                        <tr className="border-0">
                           <td colSpan="4" className="py-5 text-center text-muted-custom border-0 h6 fw-normal">
                              No matching records found in the archive.
                           </td>
                        </tr>
                     ) : (
                        filteredLogs.map(log => (
                           <tr key={log.id} className="border-bottom border-white border-opacity-5">
                              <td className="py-4 px-5">
                                 <div className="fw-bold text-white mb-1 h6">{log.vtc_name}</div>
                                 <div className="d-flex flex-column gap-2 mt-2">
                                    <div className="small text-white opacity-75 d-flex align-items-center gap-2">
                                       <Shield size={12} className="text-accent" /> {log.vtc_member_count} MBRS
                                    </div>
                                    <div className="x-small text-accent fw-bold d-flex align-items-center gap-2">
                                       <History size={12} /> {log.discord_username || 'NO_DISCORD'}
                                    </div>
                                    <a href={log.vtc_link} target="_blank" rel="noreferrer" className="x-small text-white opacity-50 hover:opacity-100 transition-all text-truncate d-block" style={{ maxWidth: '150px' }}>
                                       {log.vtc_link?.replace('https://truckersmp.com/', '') || 'VTC_LINK'}
                                    </a>
                                 </div>
                              </td>
                              <td className="py-4 px-5">
                                 <div className="d-flex flex-column gap-1">
                                    <a href={`https://truckersmp.com/events/${log.event_id}`} target="_blank" rel="noreferrer"
                                       className="small text-white fw-bold d-flex align-items-center gap-2 hover:text-accent transition-all text-decoration-none shadow-sm">
                                       <Calendar size={14} className="text-accent" /> {officialEvents[log.event_id] || `EVENT #${log.event_id}`}
                                    </a>
                                    <div className="x-small text-accent fw-bold d-flex align-items-center gap-2">
                                       <MapPin size={12} /> SLOT #{log.EventSlot?.slot_no || log.event_slot_id}
                                    </div>
                                 </div>
                              </td>
                              <td className="py-4 px-5 text-muted-custom">
                                 <div className="small fw-600 text-white">{new Date(log.updatedAt).toLocaleDateString()}</div>
                                 <div className="x-small opacity-50 mb-2">{new Date(log.updatedAt).toLocaleTimeString()}</div>
                                 {log.processed_by && (
                                    <div className="badge border border-accent text-accent x-small fw-bold px-2 py-1 rounded shadow-sm" style={{ background: 'rgba(102, 252, 241, 0.05)' }}>
                                       BY: {log.processed_by.toUpperCase()}
                                    </div>
                                 )}
                              </td>
                              <td className="py-4 px-5 text-end">
                                 <span className={`badge px-3 py-2 rounded-pill small fw-bold ${log.status === 'approved' ? 'bg-success bg-opacity-10 text-success border border-success border-opacity-20' :
                                       log.status === 'rejected' ? 'bg-danger bg-opacity-10 text-danger border border-danger border-opacity-20' :
                                          'bg-warning bg-opacity-10 text-warning border border-warning border-opacity-20'
                                    }`}>
                                    {log.status.toUpperCase()}
                                 </span>
                              </td>
                           </tr>
                        ))
                     )}
                  </tbody>
               </table>
            </div>
         </div>
      </div>
   );
};

export default SlotRequestLogs;
