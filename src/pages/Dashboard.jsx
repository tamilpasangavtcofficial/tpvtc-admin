import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Users, Calendar, Ticket, Zap, ArrowUpRight, Clock } from 'lucide-react';
import config from '../config';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentRequests, setRecentRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mediaStats, setMediaStats] = useState({ gallery: 0, headers: 0 });

  const user = JSON.parse(sessionStorage.getItem('user') || '{}');
  const role = (user.UserRole?.role || user.role || 'Staff').toLowerCase();
  
  const canViewSlots = ['developer', 'founder', 'event team'].includes(role);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = sessionStorage.getItem('token');
        
        // Parallel fetch for basic stats
        const [profileRes, eventsRes, attendingRes, requestsRes] = await Promise.all([
          fetch(`${config.API_BASE_URL}/api/tmp/vtc/profile`),
          fetch(`${config.API_BASE_URL}/api/tmp/vtc/events`),
          fetch(`${config.API_BASE_URL}/api/tmp/vtc/events/attending`),
          fetch(`${config.API_BASE_URL}/api/slots/requests/pending`, {
            headers: { 'Authorization': `Bearer ${token}` }
          })
        ]);
        
        const p = await profileRes.json().catch(() => ({}));
        const e = await eventsRes.json().catch(() => []);
        const a = await attendingRes.json().catch(() => []);
        const r = await requestsRes.json().catch(() => []);

        // Filter valid events occurring this month for TMP
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        let attendingCount = 0;
        const attendingList = a?.response || [];
        
        attendingCount = attendingList.filter(ev => {
           const d = new Date(ev.start_at);
           return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
        }).length;

        setStats({
          members: p?.response?.members_count || 0,
          officialEvents: e?.response?.length || 0,
          attendingEvents: attendingCount,
          pendingRequests: r?.length || 0
        });

        if (Array.isArray(r)) {
          setRecentRequests(r.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5));
        }

        // Fetch media stats if user is Media Team or Staff (or just fetch anyway for simplicity)
        const [galleryRes, headersRes] = await Promise.all([
          fetch(`${config.API_BASE_URL}/api/images/gallery`),
          fetch(`${config.API_BASE_URL}/api/images/headers`)
        ]);

        const galleyData = await galleryRes.json().catch(() => []);
        const headersData = await headersRes.json().catch(() => []);

        setMediaStats({
          gallery: galleyData.length || 0,
          headers: headersData.length || 0
        });

      } catch (e) {
        console.error("Dashboard Stats Error:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const StatItem = ({ title, value, icon: Icon, color, rgb }) => {
    const [displayValue, setDisplayValue] = useState(0);
    const hasAnimated = useRef(false);

    useEffect(() => {
      const end = parseInt(value) || 0;
      
      if (end === 0) {
        setDisplayValue(0);
        return;
      }

      if (hasAnimated.current) {
        setDisplayValue(end);
        return;
      }
      
      let start = 1;
      const duration = 1200;
      const fps = 60;
      const totalFrames = Math.round((duration / 1000) * fps);
      let frame = 0;

      const easeOutQuad = (x) => 1 - (1 - x) * (1 - x);

      const timer = setInterval(() => {
        frame++;
        const progress = frame / totalFrames;
        setDisplayValue(Math.round(start + (end - start) * easeOutQuad(progress)));

        if (frame >= totalFrames) {
          clearInterval(timer);
          setDisplayValue(end);
          hasAnimated.current = true;
        }
      }, 1000 / fps);

      return () => clearInterval(timer);
    }, [value]);

    return (
      <div className="col-md-6 col-lg-3">
        <div className="stat-card" style={{ '--card-color': color, '--card-rgb': rgb }}>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div className="icon-box">
              <Icon size={24} />
            </div>
          </div>
          <div className="display-6 fw-bold mb-1 tracking-tight">{displayValue}</div>
          <div className="text-muted small fw-bold text-uppercase tracking-wider" style={{ opacity: 0.8 }}>{title}</div>
        </div>
      </div>
    );
  };

  return (
    <div className="container-fluid p-0">
      <div className="row g-4 mb-5">
        <StatItem title="VTC Members" value={stats?.members || 0} icon={Users} color="#66fcf1" rgb="102, 252, 241" />
        <StatItem title="Official Events" value={stats?.officialEvents || 0} icon={Calendar} color="#c77dff" rgb="199, 125, 255" />
        <StatItem title="Events Attending This Month" value={stats?.attendingEvents || 0} icon={Zap} color="#4895ef" rgb="72, 149, 239" />
        <StatItem title="Pending Request For Slots" value={stats?.pendingRequests || 0} icon={Ticket} color="#ff5d8f" rgb="255, 93, 143" />
      </div>

      <div className="row g-4">
        <div className="col-lg-8">
            {canViewSlots ? (
               <div className="data-table p-5 border-0 shadow-lg">
                  <div className="d-flex justify-content-between align-items-center mb-5">
                     <h4 className="fw-bold mb-0">Live Slot Activity</h4>
                     <Link to="/requests" className="btn btn-outline-secondary btn-sm border-opacity-10 rounded-pill px-3">View All</Link>
                  </div>
                  <div className="table-responsive">
                    <table className="table table-dark table-hover mb-0 align-middle">
                      <thead className="small">
                        <tr>
                          <th className="border-0 text-muted-custom tracking-wider">VTC PARTICIPANT</th>
                          <th className="border-0 text-muted-custom tracking-wider">REQUESTED SLOT</th>
                          <th className="border-0 text-muted-custom tracking-wider">DATE</th>
                          <th className="border-0 text-end text-muted-custom tracking-wider">STATUS</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentRequests.length === 0 ? (
                          <tr className="border-0">
                             <td colSpan="4" className="py-5 text-center">
                                <div className="p-5 rounded-4 border border-white border-opacity-10" style={{ background: 'rgba(255,255,255,0.03)' }}>
                                  <Ticket size={40} className="text-muted mb-3 opacity-50" />
                                  <div className="text-muted-custom">No active slot requests found in queue.</div>
                                </div>
                             </td>
                          </tr>
                        ) : (
                          recentRequests.map(req => (
                            <tr key={req.id} className="border-bottom border-white border-opacity-10">
                               <td className="fw-bold text-white py-3">{req.vtc_name}</td>
                               <td className="text-accent fw-600">{req.EventSlot?.EventSlotImage?.slot_name || `Slot #${req.event_slot_id}`}</td>
                               <td className="small text-muted-custom">{new Date(req.createdAt).toLocaleDateString()}</td>
                               <td className="text-end">
                                 <div className="d-inline-flex px-3 py-1 rounded-pill small fw-bold" style={{ background: 'rgba(255, 193, 7, 0.1)', color: '#ffc107', fontSize: '0.7rem' }}>
                                    <div className="rounded-circle me-2 mt-1" style={{ width: 6, height: 6, background: '#ffc107' }}></div> {req.status.toUpperCase()}
                                 </div>
                               </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
               </div>
            ) : (
               <div className="data-table p-5 border-0 shadow-lg">
                  <div className="d-flex justify-content-between align-items-center mb-5">
                     <h4 className="fw-bold mb-0">Media Intelligence</h4>
                     <div className="badge px-3 py-2 rounded-pill bg-accent bg-opacity-10 text-accent small fw-bold">Live Asset Sync</div>
                  </div>
                  
                  <div className="row g-4">
                     <div className="col-md-6">
                        <div className="p-4 rounded-4 border border-white border-opacity-10 h-100" style={{ background: 'rgba(255,255,255,0.02)' }}>
                           <div className="d-flex align-items-start justify-content-between mb-4">
                              <div className="p-3 rounded-4 bg-accent bg-opacity-10">
                                 <Users size={24} className="text-accent"/>
                              </div>
                              <Link to="/gallery" className="btn btn-link text-accent p-0 text-decoration-none small fw-bold">Manage Gallery</Link>
                           </div>
                           <div className="display-5 fw-bold text-white mb-1">{mediaStats.gallery}</div>
                           <div className="text-muted-custom small text-uppercase tracking-widest fw-bold">Gallery Assets</div>
                           <div className="mt-3 small text-muted opacity-50">Publicly visible community memories and event captures.</div>
                        </div>
                     </div>
                     <div className="col-md-6">
                        <div className="p-4 rounded-4 border border-white border-opacity-10 h-100" style={{ background: 'rgba(255,255,255,0.02)' }}>
                           <div className="d-flex align-items-start justify-content-between mb-4">
                              <div className="p-3 rounded-4 bg-primary bg-opacity-10">
                                 <Zap size={24} className="text-primary"/>
                              </div>
                              <Link to="/header-images" className="btn btn-link text-primary p-0 text-decoration-none small fw-bold">Manage Headers</Link>
                           </div>
                           <div className="display-5 fw-bold text-white mb-1">{mediaStats.headers}</div>
                           <div className="text-muted-custom small text-uppercase tracking-widest fw-bold">Active Headers</div>
                           <div className="mt-3 small text-muted opacity-50">Dynamic hero images used across the main portal interface.</div>
                        </div>
                     </div>
                  </div>

                  <div className="mt-5 p-4 rounded-4 bg-black bg-opacity-20 border border-white border-opacity-5">
                     <div className="d-flex align-items-center gap-3">
                        <div className="flex-grow-1">
                           <h6 className="text-white fw-bold mb-1">Upload Pipeline Ready</h6>
                           <p className="small text-muted-custom mb-0">High-fidelity media processing is operational via Cloudinary. All uploads are optimized for performance automatically.</p>
                        </div>
                        <ArrowUpRight size={20} className="text-muted opacity-50" />
                     </div>
                  </div>
               </div>
            )}
        </div>
        <div className="col-lg-4">
           <div className="data-table h-100 p-5 position-relative overflow-hidden">
              <div className="position-absolute top-0 end-0 p-4 opacity-10 text-accent">
                 <Clock size={80} />
              </div>
              <h4 className="fw-bold mb-5 position-relative">System Vitals</h4>
              <div className="d-flex flex-column gap-4 position-relative">
                 <div className="p-4 rounded-4 border border-white border-opacity-10" style={{ background: 'rgba(255,255,255,0.03)' }}>
                    <div className="text-muted-custom small mb-2 text-uppercase fw-600 tracking-wider">Storage & Cloud</div>
                    <div className="d-flex justify-content-between align-items-center">
                       <span className="text-white fw-bold">Cloudinary API</span>
                       <span className="badge-outline text-success" style={{ fontSize: '0.6rem' }}>CONNECTED</span>
                    </div>
                 </div>
                 <div className="p-4 rounded-4 border border-white border-opacity-10" style={{ background: 'rgba(255,255,255,0.03)' }}>
                    <div className="text-muted-custom small mb-2 text-uppercase fw-600 tracking-wider">External Feeds</div>
                    <div className="d-flex justify-content-between align-items-center">
                       <span className="text-white fw-bold">TruckersMP API</span>
                       <span className="badge-outline text-warning" style={{ fontSize: '0.6rem' }}>PROXIED</span>
                    </div>
                 </div>
                 <div className="mt-4 text-center">
                    <div className="small text-muted mb-2">Last system sync</div>
                    <div className="fw-bold text-accent h5 mb-0">Operational</div>
                    <div className="x-small text-muted-custom mt-1">Status Checked 24/7</div>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
