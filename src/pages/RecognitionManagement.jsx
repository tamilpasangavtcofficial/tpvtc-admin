import React, { useEffect, useState } from 'react';
import { Trophy, Gift, Award, Save, Loader2, User } from 'lucide-react';
import config from '../config';

const RecognitionManagement = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [members, setMembers] = useState([]);
  const [formData, setFormData] = useState({
    month: '',
    winner_name: '',
    winner_role: '',
    winner_tmp_id: '',
    winner_event_id: '',
    winner_dlc: '',
    p1_name: '',
    p1_role: '',
    p1_tmp_id: '',
    p1_distance: '',
    p1_dlc: '',
    p2_name: '',
    p2_role: '',
    p2_tmp_id: '',
    p2_distance: '',
    p2_dlc: '',
    p3_name: '',
    p3_role: '',
    p3_tmp_id: '',
    p3_distance: '',
    p3_dlc: '',
    published: false
  });

  const [existingMonths, setExistingMonths] = useState([]);
  const [message, setMessage] = useState({ type: '', text: '' });

  const fetchMembers = async () => {
    try {
      const res = await fetch(`${config.API_BASE_URL}/api/tmp/vtc/members`);
      const data = await res.json();
      if (!data.error && data.response && data.response.members) {
        setMembers(data.response.members);
      }
    } catch (e) {
      console.error('Failed to fetch members', e);
    }
  };

  // Generate months for dropdown (3 months back, 6 months forward)
  const generateMonths = () => {
    const months = [];
    const date = new Date();
    date.setMonth(date.getMonth() - 3);
    const monthsNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    for (let i = 0; i < 12; i++) {
      const monthName = `${monthsNames[date.getMonth()]} ${date.getFullYear()}`;
      months.push(monthName);
      date.setMonth(date.getMonth() + 1);
    }
    return months;
  };

  const monthOptions = generateMonths();

  useEffect(() => {
    const now = new Date();
    const monthsNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const currentMonth = `${monthsNames[now.getMonth()]} ${now.getFullYear()}`;
    if (!formData.month) {
      setFormData(prev => ({ ...prev, month: currentMonth }));
    }
    fetchMembers();
    fetchExistingMonths();
  }, []);

  const fetchExistingMonths = async () => {
    try {
      const res = await fetch(`${config.API_BASE_URL}/api/achievements/all`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setExistingMonths(data.map(a => a.month));
      }
    } catch (e) {
      console.error("Failed to fetch months list", e);
    }
  };

  const fetchMonthData = async (month) => {
    if (!month) return;
    setLoading(true);
    try {
      const res = await fetch(`${config.API_BASE_URL}/api/achievements/find`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ month: month.trim() })
      });
      
      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        console.error("Non-JSON response received");
        return;
      }

      const data = await res.json();
      console.log("Loaded achievement data:", data);

      if (data && data.winner_name) {
        setFormData({
          month: data.month,
          winner_name: data.winner_name || '',
          winner_role: data.winner_role || '',
          winner_tmp_id: data.winner_tmp_id || '',
          winner_event_id: data.winner_event_id || '',
          winner_dlc: data.winner_dlc || '',
          p1_name: data.p1_name || '',
          p1_role: data.p1_role || '',
          p1_tmp_id: data.p1_tmp_id || '',
          p1_distance: data.p1_distance || '',
          p2_name: data.p2_name || '',
          p2_role: data.p2_role || '',
          p2_tmp_id: data.p2_tmp_id || '',
          p2_distance: data.p2_distance || '',
          p3_name: data.p3_name || '',
          p3_role: data.p3_role || '',
          p3_tmp_id: data.p3_tmp_id || '',
          p3_distance: data.p3_distance || '',
          published: data.published || false
        });
      } else {
        // Reset form for new month (keeping the month name)
        setFormData(prev => ({
          month: prev.month,
          winner_name: '',
          winner_role: '',
          winner_tmp_id: '',
          winner_event_id: '',
          winner_dlc: '',
          p1_name: '',
          p1_role: '',
          p1_tmp_id: '',
          p1_distance: '',
          p1_dlc: '',
          p2_name: '',
          p2_role: '',
          p2_tmp_id: '',
          p2_distance: '',
          p2_dlc: '',
          p3_name: '',
          p3_role: '',
          p3_tmp_id: '',
          p3_distance: '',
          p3_dlc: '',
          published: false
        }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (formData.month) {
      fetchMonthData(formData.month);
    }
  }, [formData.month]);

  const handleMemberSelect = (fieldPrefix, memberId) => {
    const member = members.find(m => m.user_id === parseInt(memberId));
    if (member) {
      setFormData(prev => ({
        ...prev,
        [`${fieldPrefix}_name`]: member.username,
        [`${fieldPrefix}_role`]: member.role,
        [`${fieldPrefix}_tmp_id`]: member.user_id
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });

    const token = sessionStorage.getItem('token');
    try {
      const res = await fetch(`${config.API_BASE_URL}/api/achievements/update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        setMessage({ type: 'success', text: 'Achievements updated successfully!' });
        fetchExistingMonths(); // Refresh list after saving
      } else {
        const data = await res.json();
        setMessage({ type: 'error', text: data.message || 'Update failed' });
      }
    } catch (e) {
      setMessage({ type: 'error', text: 'Server error' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <Loader2 size={48} className="animate-spin text-accent opacity-50 mb-3 mx-auto" />
        <div className="h5 text-white fw-bold">Loading Achievements...</div>
      </div>
    );
  }

  return (
    <div className="container-fluid reveal in">
      <header className="mb-5">
        <h1 className="h3 fw-bold text-white mb-2">Monthly Achievements</h1>
        <p className="text-muted-custom">Manage giveaway winners and top performers of the month.</p>
      </header>

      {message.text && (
        <div className={`alert ${message.type === 'success' ? 'alert-success' : 'alert-danger'} border-0 rounded-4 mb-4`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-5">
          <div className="data-table border-0 shadow-lg rounded-5 p-4 mb-4" style={{ background: 'rgba(255,255,255,0.02)' }}>
            <div className="d-flex align-items-center gap-3 mb-4">
               <div className="p-3 rounded-4 bg-primary bg-opacity-10 text-primary">
                  <Award size={24} />
               </div>
               <h4 className="fw-bold text-white mb-0">General Settings</h4>
            </div>
            <div className="row">
               <div className="card-body p-4">
              <label className="form-label text-muted-custom small fw-bold text-uppercase">Target Month</label>
              <select 
                className="form-select bg-dark text-white border-white border-opacity-10 py-3 rounded-4 mb-3"
                value={formData.month}
                onChange={(e) => setFormData({...formData, month: e.target.value})}
              >
                <optgroup label="Saved in Database">
                  {existingMonths.map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </optgroup>
                <optgroup label="Other Months">
                  {monthOptions.filter(m => !existingMonths.includes(m)).map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </optgroup>
              </select>

              <div className="form-check form-switch mt-3 p-0 d-flex align-items-center gap-3">
                <input 
                  className="form-check-input ms-0" 
                  type="checkbox" 
                  role="switch" 
                  id="publishSwitch"
                  checked={formData.published}
                  onChange={(e) => setFormData({...formData, published: e.target.checked})}
                  style={{ width: '50px', height: '25px', cursor: 'pointer' }}
                />
                <label className="form-check-label text-white fw-bold" htmlFor="publishSwitch">
                  {formData.published ? 'VISIBLE ON WEBSITE' : 'HIDDEN FROM WEBSITE'}
                </label>
              </div>
            </div>
            </div>
          </div>
        </div>

        <div className="row g-4">
          {/* Top Performers Section */}
          <div className="col-12">
            <div className="data-table border-0 shadow-lg rounded-5 h-100 p-4" style={{ background: 'rgba(255,255,255,0.02)' }}>
              <div className="d-flex align-items-center gap-3 mb-4">
                <div className="p-3 rounded-4 bg-success bg-opacity-10 text-success">
                  <Trophy size={24} />
                </div>
                <h4 className="fw-bold text-white mb-0">Top 3 Performers</h4>
              </div>

              {[1, 2, 3].map(num => (
                <div key={num} className={`mb-4 ${num < 3 ? 'pb-4 border-bottom border-white border-opacity-5' : ''}`}>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                     <span className="badge rounded-pill px-3 py-2 bg-accent bg-opacity-10 text-accent"># {num} Performer</span>
                  </div>
                  
                  <div className="mb-3">
                    <select 
                      className="form-select bg-dark text-white border-white border-opacity-10 py-2 rounded-4 small"
                      value={formData[`p${num}_tmp_id`] || ""}
                      onChange={(e) => handleMemberSelect(`p${num}`, e.target.value)}
                    >
                      <option value="">Select Member...</option>
                      {members.map(m => (
                        <option key={m.user_id} value={m.user_id}>
                          {m.username} ({m.role})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="row g-2">
                    <div className="col-md-5">
                      <input type="text" readOnly className="form-control form-control-sm bg-dark bg-opacity-50 text-white border-white border-opacity-10 rounded-4" value={formData[`p${num}_name`]} placeholder="Name" />
                    </div>
                    <div className="col-md-3">
                      <input type="text" readOnly className="form-control form-control-sm bg-dark bg-opacity-50 text-white border-white border-opacity-10 rounded-4" value={formData[`p${num}_role`]} placeholder="Role" />
                    </div>
                    <div className="col-md-4">
                      <input 
                        type="text" 
                        className="form-control form-control-sm bg-dark text-white border-white border-opacity-10 rounded-4" 
                        value={formData[`p${num}_distance`]} 
                        onChange={e => setFormData({...formData, [`p${num}_distance`]: e.target.value})} 
                        placeholder="Distance (e.g. 50,000 KM)"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="mt-2">
                      <input 
                        type="text" 
                        className="form-control form-control-sm bg-dark text-white border-white border-opacity-10 rounded-4" 
                        value={formData[`p${num}_dlc`] || ''} 
                        onChange={e => setFormData({...formData, [`p${num}_dlc`]: e.target.value})} 
                        placeholder="Giveaway Prize DLC (Optional)"
                      />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-5 text-end">
          <button 
            type="submit" 
            disabled={saving}
            className="btn btn-accent px-5 py-3 rounded-4 fw-bold shadow-lg d-inline-flex align-items-center gap-2 transition-all hover:scale-105"
            style={{ backgroundColor: '#66fcf1', color: '#0b0c10' }}
          >
            {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            SAVE MONTHLY ACHIEVEMENTS
          </button>
        </div>
      </form>
    </div>
  );
};

export default RecognitionManagement;
