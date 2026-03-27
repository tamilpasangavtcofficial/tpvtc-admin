import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Lock, Mail, Zap, ArrowRight, Shield, Key } from 'lucide-react';
import logo from '../logo.png';
import config from '../config';

const LoginPage = () => {
   const [email, setEmail] = useState('');
   const [password, setPassword] = useState('');
   const [error, setError] = useState('');
   const [loading, setLoading] = useState(false);
   const navigate = useNavigate();

   const handleLogin = async (e) => {
      e.preventDefault();
      setLoading(true);
      setError('');
      try {
         const res = await fetch(`${config.API_BASE_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
         });
         const data = await res.json();
         if (res.ok) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            navigate('/');
         } else {
            setError(data.message || 'Verification Failed');
         }
      } catch (err) {
         setError('Operational link failed. Check backend connectivity.');
      } finally {
         setLoading(false);
      }
   };

   return (
      <div className="login-wrap overflow-hidden position-relative vh-100 d-flex align-items-center justify-content-center p-3"
         style={{ background: '#020408' }}>

         {/* Immersive Background Effects */}
         <div className="position-absolute top-0 start-0 w-100 h-100 overflow-hidden" style={{ zIndex: 0 }}>
            {/* Orbiting Glows */}
            <div className="position-absolute translate-middle top-0 start-0 opacity-10"
               style={{ width: '80vw', height: '80vh', background: 'radial-gradient(circle, #66fcf1 0%, transparent 60%)', filter: 'blur(120px)' }}></div>
            <div className="position-absolute translate-middle bottom-0 end-0 opacity-5"
               style={{ width: '60vw', height: '60vh', background: 'radial-gradient(circle, #c77dff 0%, transparent 60%)', filter: 'blur(100px)' }}></div>

            {/* Large Emblem Watermark */}
            <div className="position-absolute top-50 start-50 translate-middle opacity-5 scroll-reveal">
               <Shield size={800} strokeWidth={0.5} className="text-white" />
            </div>
         </div>

         <div className="login-card p-0 d-flex flex-column border-0 shadow-2xl reveal in overflow-hidden position-relative"
            style={{ maxWidth: 520, width: '100%', background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(40px)', borderRadius: '48px', border: '1px solid rgba(255,255,255,0.08)', zIndex: 1 }}>

            {/* Dynamic Header Section */}
            <div className="p-5 py-5 text-center bg-black bg-opacity-30 border-bottom border-white border-opacity-5">
               <div className="mb-4 position-relative d-inline-block hover:scale-110 transition-transform cursor-pointer">
                  <div className="position-absolute top-50 start-50 translate-middle w-100 h-100 bg-accent bg-opacity-20 rounded-circle blur-3xl filter animate-pulse" style={{ padding: '45px' }}></div>
                  <img src={logo} alt="Tamil Pasanga VTC" className="position-relative" style={{ width: 140, height: 140, objectFit: 'contain' }} />
               </div>

               <h2 className="display-6 fw-800 text-white mb-2 tracking-tight">Staff Hub</h2>

               <div className="d-flex align-items-center justify-content-center gap-3">
                  <span className="x-small text-accent fw-bold tracking-widest text-uppercase">Login</span>
                  <div className="rounded-circle bg-accent" style={{ width: 5, height: 5, boxShadow: '0 0 10px #66fcf1' }}></div>
                  <span className="x-small text-muted-custom opacity-50 fw-bold tracking-widest text-uppercase">V2.4.0 Final</span>
               </div>
            </div>

            {/* Tactical Input Interface */}
            <div className="p-5 pt-4">
               {error && (
                  <div className="alert alert-danger py-3 w-100 small border-0 bg-danger bg-opacity-10 text-white mb-4 rounded-4 fw-bold text-center d-flex align-items-center justify-content-center gap-3 reveal zoom in shadow-lg border border-danger border-opacity-20">
                     <Zap size={18} className="text-danger shadow-glow-red" />
                     <span className="tracking-wide">{error}</span>
                  </div>
               )}

               <form onSubmit={handleLogin} className="w-100">
                  <div className="mb-4">
                     <div className="d-flex justify-content-between align-items-center mb-3 px-1">
                        <label className="x-small text-muted-custom fw-800 tracking-widest text-uppercase opacity-50">Email</label>
                        <Mail size={12} className="text-accent opacity-30" />
                     </div>
                     <div className="position-relative group">
                        <input
                           type="email"
                           className="form-control ps-4 py-4 rounded-4 bg-black bg-opacity-20 border-white border-opacity-10 text-white fs-6 transition-all hover:bg-opacity-40 focus:border-accent focus:shadow-lg focus:shadow-accent-opacity-10"
                           required placeholder="enter your email"
                           value={email} onChange={e => setEmail(e.target.value)}
                           style={{
                              background: 'rgba(255,255,255,0.03)',
                              borderColor: 'rgba(255,255,255,0.08)',
                              color: '#fff'
                           }}
                        />
                        <style>{`
                      .form-control::placeholder { color: rgba(255,255,255,0.2) !important; font-weight: 500; font-size: 0.95rem; }
                      .form-control:focus::placeholder { opacity: 0.3; }
                    `}</style>
                     </div>
                  </div>

                  <div className="mb-5">
                     <div className="d-flex justify-content-between align-items-center mb-3 px-1">
                        <label className="x-small text-muted-custom fw-800 tracking-widest text-uppercase opacity-50">Password</label>
                        <Key size={12} className="text-accent opacity-30" />
                     </div>
                     <div className="position-relative">
                        <input
                           type="password"
                           className="form-control ps-4 py-4 rounded-4 bg-black bg-opacity-20 border-white border-opacity-10 text-white fs-6 transition-all hover:bg-opacity-40 focus:border-accent focus:shadow-lg focus:shadow-accent-opacity-10"
                           required placeholder="enter your password"
                           value={password} onChange={e => setPassword(e.target.value)}
                           style={{
                              background: 'rgba(255,255,255,0.03)',
                              borderColor: 'rgba(255,255,255,0.08)',
                              color: '#fff'
                           }}
                        />
                     </div>
                  </div>

                  <button
                     type="submit"
                     className="btn btn-admin w-100 py-4 rounded-4 d-flex align-items-center justify-content-center gap-3 h6 mb-0 fw-800 border-0 transition-all active:scale-95 shadow-xl"
                     disabled={loading}
                     style={{
                        background: 'linear-gradient(135deg, #66fcf1 0%, #45a29e 100%)',
                        color: '#0b0c10',
                        boxShadow: '0 8px 32px rgba(102, 252, 241, 0.2)'
                     }}
                  >
                     {loading ? <div className="spinner-border spinner-border-sm"></div> : (
                        <>
                           Login <ArrowRight size={22} className="transition-transform group-hover:translate-x-2" />
                        </>
                     )}
                  </button>
               </form>

               <div className="mt-5 text-center">
                  <a href="/" className="text-muted-custom small text-decoration-none border-bottom border-white border-opacity-5 pb-1 hover:border-accent hover:text-white transition-all opacity-40 hover:opacity-100 fw-800 tracking-widest text-uppercase">
                     ← ABORT TO BASE
                  </a>
               </div>
            </div>
         </div>

         {/* Footer Branding */}
         <div className="position-absolute bottom-0 start-50 translate-middle-x pb-5 opacity-20">
            <p className="x-small text-muted-custom fw-bold tracking-widest mb-0 opacity-50">TAMIL PASANGA GLOBAL HUB • ENCRYPTED SESSION</p>
         </div>
      </div>
   );
};

export default LoginPage;
