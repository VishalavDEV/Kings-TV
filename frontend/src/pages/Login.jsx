import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LanguageContext } from '../context/LanguageContext';

const Login = () => {
  const { login } = useContext(AuthContext);
  const { t, lang } = useContext(LanguageContext);
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [pwd, setPwd] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedDisplayName, setSelectedDisplayName] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastText, setToastText] = useState('');

  const rolesList = [
    { role: 'admin', labelTa: 'நிர்வாகி (Admin)', labelEn: 'Admin', email: 'admin@king24x7.com', pwd: 'admin123' },
    { role: 'vendor', labelTa: 'வணிகர் (Vendor)', labelEn: 'Vendor', email: 'vendor@king24x7.com', pwd: 'vendor123' },
    { role: 'editor', labelTa: 'ஆசிரியர் (Editor)', labelEn: 'Editor', email: 'editor@king24x7.com', pwd: 'editor123' },
    { role: 'reporter', labelTa: 'செய்தியாளர் (Reporter)', labelEn: 'Reporter', email: 'reporter@king24x7.com', pwd: 'reporter123' },
    { role: 'user', labelTa: 'வாசகர் (User)', labelEn: 'User', email: 'user@king24x7.com', pwd: 'user123' }
  ];

  const handlePillClick = (item) => {
    setEmail(item.email);
    setPwd(item.pwd);
    setSelectedRole(item.role);
    setSelectedDisplayName(lang === 'en' ? item.labelEn : item.labelTa);
  };

  const handleEmailInput = (e) => {
    setEmail(e.target.value);
    setSelectedRole('');
    setSelectedDisplayName('');
  };

  const handlePasswordInput = (e) => {
    setPwd(e.target.value);
    setSelectedRole('');
    setSelectedDisplayName('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const emailVal = email.toLowerCase();
    let role = selectedRole;
    let displayName = selectedDisplayName;

    if (!role) {
      if (emailVal.includes('admin')) {
        role = 'admin';
        displayName = lang === 'en' ? 'Admin' : 'நிர்வாகி (Admin)';
      } else if (emailVal.includes('vendor')) {
        role = 'vendor';
        displayName = lang === 'en' ? 'Vendor' : 'வணிகர் (Vendor)';
      } else if (emailVal.includes('editor')) {
        role = 'editor';
        displayName = lang === 'en' ? 'Editor' : 'ஆசிரியர் (Editor)';
      } else if (emailVal.includes('reporter')) {
        role = 'reporter';
        displayName = lang === 'en' ? 'Reporter' : 'செய்தியாளர் (Reporter)';
      } else {
        role = 'user';
        displayName = lang === 'en' ? 'User' : 'வாசகர் (User)';
      }
    }

    login({
      email,
      username: email.split('@')[0],
      role,
      displayName
    });

    if (lang === 'en') {
      setToastText(`Successfully logged in as ${role.toUpperCase()}!`);
    } else {
      setToastText(`${displayName} வெற்றிகரமாக உள்நுழைந்தார்!`);
    }
    
    setShowToast(true);

    setTimeout(() => {
      setShowToast(false);
      navigate('/');
    }, 1200);
  };

  return (
    <div className="login-wrapper" style={{ background: '#000000', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', position: 'relative', overflow: 'hidden' }}>
      <div className="login-container" style={{ width: '100%', maxWidth: '960px', background: 'rgba(255, 255, 255, 0.03)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '12px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)', zIndex: 2, display: 'grid', gridTemplateColumns: '1.2fr 1.8fr' }}>
        
        <div className="login-left" style={{ background: 'rgba(0, 0, 0, 0.3)', padding: '40px 30px', borderRight: '1px solid rgba(255, 255, 255, 0.05)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div className="login-left-header">
            <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--primary)', letterSpacing: '1px', marginBottom: '8px' }}>KINGS 24x7</div>
            <h2 id="leftTitle" style={{ fontSize: '22px', fontWeight: 800, color: 'white', lineHeight: 1.3, marginBottom: '12px' }}>
              {lang === 'en' ? 'Authentication Hub' : 'அங்கீகார மையம்'}
            </h2>
            <p id="leftDesc" style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.6)', lineHeight: 1.6 }}>
              {lang === 'en' ? 'Truth. Responsibility. In Tamil. Access portal components tailored to your role.' : 'உண்மை. பொறுப்பு. தமிழில். உங்கள் பங்கிற்கு ஏற்ப வடிவமைக்கப்பட்ட பக்கங்களை அணுகவும்.'}
            </p>
          </div>

          <div className="logo-display-section" style={{ marginTop: '40px', flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <img 
              src="/assets/icons/logo-icon-dark.png" 
              alt="Kings TV Logo" 
              style={{ maxWidth: '140px', height: 'auto', borderRadius: '16px', boxShadow: '0 10px 25px rgba(0,0,0,0.3)', filter: 'drop-shadow(0 4px 10px rgba(179,115,42,0.2))' }}
            />
          </div>
        </div>

        <div className="login-right" style={{ padding: '50px 40px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div className="login-right-header" style={{ marginBottom: '32px' }}>
            <h3 id="rightTitle" style={{ fontSize: '28px', fontWeight: 800, color: 'white', marginBottom: '8px' }}>
              {lang === 'en' ? 'Welcome Back!' : 'நல்வரவு!'}
            </h3>
            <p id="rightSubtitle" style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.5)', lineHeight: 1.5 }}>
              {lang === 'en' ? 'Enter your email and password to access your role workspace.' : 'உங்கள் பங்கிற்கான பணியிடத்தை அணுக மின்னஞ்சல் மற்றும் கடவுச்சொல்லை உள்ளிடவும்.'}
            </p>
          </div>

          <form id="loginForm" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="form-group" style={{ position: 'relative' }}>
              <label id="labelEmail" style={{ fontSize: '12px', fontWeight: 600, color: 'rgba(255, 255, 255, 0.7)', display: 'block', marginBottom: '8px' }}>
                {lang === 'en' ? 'Email Address *' : 'மின்னஞ்சல் முகவரி *'}
              </label>
              <div style={{ position: 'relative' }}>
                <i className="fas fa-envelope" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255, 255, 255, 0.4)' }}></i>
                <input 
                  type="email" 
                  value={email}
                  onChange={handleEmailInput}
                  required 
                  placeholder="name@king24x7.com" 
                  style={{
                    width: '100%',
                    padding: '14px 16px 14px 44px',
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '8px',
                    color: 'white',
                    outline: 'none',
                    fontSize: '14px',
                    transition: 'all 0.3s'
                  }}
                />
              </div>
            </div>

            <div className="form-group" style={{ position: 'relative' }}>
              <label id="labelPwd" style={{ fontSize: '12px', fontWeight: 600, color: 'rgba(255, 255, 255, 0.7)', display: 'block', marginBottom: '8px' }}>
                {lang === 'en' ? 'Password *' : 'கடவுச்சொல் *'}
              </label>
              <div style={{ position: 'relative' }}>
                <i className="fas fa-lock" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255, 255, 255, 0.4)' }}></i>
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  value={pwd}
                  onChange={handlePasswordInput}
                  required 
                  placeholder="••••••••" 
                  style={{
                    width: '100%',
                    padding: '14px 44px 14px 44px',
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '8px',
                    color: 'white',
                    outline: 'none',
                    fontSize: '14px',
                    transition: 'all 0.3s'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(prev => !prev)}
                  style={{
                    position: 'absolute',
                    right: '16px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'transparent',
                    border: 'none',
                    color: 'rgba(255, 255, 255, 0.4)',
                    cursor: 'pointer',
                    outline: 'none'
                  }}
                >
                  <i className={showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'}></i>
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px', color: 'rgba(255, 255, 255, 0.5)', marginTop: '8px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input type="checkbox" style={{ accentColor: 'var(--primary)' }} />
                <span id="rememberText">{lang === 'en' ? 'Remember Me' : 'என்னை நினைவில் கொள்'}</span>
              </label>
              <a href="#" id="forgotText" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 600 }}>
                {lang === 'en' ? 'Forgot Password?' : 'கடவுச்சொல் மறந்துவிட்டதா?'}
              </a>
            </div>

            <button 
              type="submit" 
              style={{
                width: '100%',
                padding: '14px',
                background: 'var(--primary)',
                color: 'white',
                fontWeight: 700,
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '15px',
                marginTop: '16px',
                boxShadow: '0 4px 15px rgba(0, 87, 255, 0.3)',
                transition: 'all 0.3s'
              }}
            >
              <span id="submitBtnText">{lang === 'en' ? 'Sign In' : 'உள்நுழைய'}</span>
            </button>
          </form>
        </div>

      </div>

      <div 
        className={`toast ${showToast ? 'show' : ''}`} 
        id="successToast"
        style={{
          position: 'fixed',
          bottom: '24px',
          left: '50%',
          transform: 'translateX(-50%) ' + (showToast ? 'translateY(0)' : 'translateY(100px)'),
          opacity: showToast ? 1 : 0,
          background: '#10B981',
          color: 'white',
          padding: '16px 32px',
          borderRadius: '8px',
          boxShadow: '0 10px 25px -5px rgba(16, 185, 129, 0.3)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          fontWeight: 700,
          zIndex: 9999,
          transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        <i className="fas fa-check-circle" style={{ fontSize: '20px' }}></i>
        <span id="toastText">{toastText}</span>
      </div>
    </div>
  );
};

export default Login;
