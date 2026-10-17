import React, { useEffect, useState } from 'react';
import logoUrl from './assets/logo.svg';
import bannerUrl from './assets/banner.svg';

type User = {
  name: string;
  email: string;
  gender: 'Erkek' | 'Kız' | '';
  badges: string[];
};

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [showLogin, setShowLogin] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem('duzcehub_user');
    if (raw) {
      try {
        setUser(JSON.parse(raw));
        return;
      } catch (e) {}
    }
    setShowLogin(true);
  }, []);

  function onLogin(u: User) {
    localStorage.setItem('duzcehub_user', JSON.stringify(u));
    setUser(u);
    setShowLogin(false);
  }

  function logout() {
    localStorage.removeItem('duzcehub_user');
    setUser(null);
    setShowLogin(true);
  }

  return (
    <div>
      <header className="site-header">
        <div className="header-left">
          <img src={logoUrl} alt="DüzceHUB" className="logo" />
        </div>
        <div className="header-center">
          <img src={bannerUrl} alt="banner" className="banner" />
        </div>
        <div className="header-right">
          {user ? (
            <div className="user-mini">
              <div className="avatar">{user.name?.charAt(0).toUpperCase() || 'E'}</div>
              <div className="user-meta">
                <div className="user-name">{user.name}</div>
                <div className="badges">{user.badges.map(b => (<span key={b} className="small-badge">{b}</span>))}</div>
              </div>
              <button className="btn-logout" onClick={logout}>Çıkış</button>
            </div>
          ) : (
            <button className="btn-login" onClick={() => setShowLogin(true)}>Giriş / Kayıt</button>
          )}
        </div>
      </header>

      <main>
        {/* keep existing mockup shell below */}
        <div className="app-shell">
          <aside className="sidebar">
            <div className="brand">
              <div className="brand-mark">D</div>
              <span>DüzceHUB</span>
            </div>

            <nav className="nav-menu">
              {[
                'Akış',
                'Forum',
                'Canlı Sohbet',
                'Mesajlar',
                'Duyurular',
                'Destek',
                'Yardım Rehberi'
              ].map((label) => (
                <button key={label} className={`nav-item`}>
                  <span>{label}</span>
                </button>
              ))}
            </nav>

            <div className="nav-divider" />

            <nav className="nav-menu secondary">
              {['Profilim', 'Ayarlar', 'Admin Panel'].map((label) => (
                <button key={label} className="nav-item">{label}</button>
              ))}
            </nav>

            <div className="profile-card">
              <div className="profile-avatar">E</div>
              <div className="profile-meta">
                <strong>EGEMEN Özdemir</strong>
                <span>DüzceHub Kurucusu</span>
              </div>
            </div>
          </aside>

          <section className="main-panel">
            <header className="topbar">
              <div className="topbar-user">Hoş geldin, <strong>{user?.name || 'Ziyaretçi'}</strong></div>
              <div>
                <button className="join-chat">Sohbete katıl</button>
              </div>
            </header>

            <section className="feed">
              <div className="feed-header">
                <h1>Akış</h1>
                <p>Düzce’den son paylaşımlar</p>
              </div>

              <div className="composer">
                <div className="composer-avatar">{user ? user.name.charAt(0).toUpperCase() : 'E'}</div>
                <div className="composer-box">
                  <div className="input-wrapper">
                    <textarea disabled={!user} placeholder={user ? "Düzce'de neler oluyor? Bir şeyler yaz..." : "Giriş yapmadan paylaşamazsın"} />
                  </div>

                  <div className="composer-actions">
                    <div className="tag-list">
                      {['Serbest','Muhabbet','İlan','Oyun','Ders','Yardım'].map(t => (
                        <button key={t} className={`tag`}>{t}</button>
                      ))}
                    </div>

                    <div className="compose-footer">
                      <button className="attach-btn">Görsel</button>
                      <button className="share-btn" disabled={!user}>Paylaş</button>
                    </div>
                  </div>
                </div>
              </div>

              <article className="post-card">
                <div className="post-head">
                  <div className="avatar">E</div>
                  <div className="post-meta">
                    <div className="user-row">
                      <h3>EGEMEN Özdemir</h3>
                      <span className="badge">#ilan</span>
                    </div>
                    <div className="timestamp">3 sa önce</div>
                  </div>
                </div>

                <div className="post-body">
                  <p className="caption">sELAMAMMMMS</p>
                  <div className="post-image" aria-label="Örnek görsel">
                    <img src="/client_dist/assets/sample-post.jpg" alt="örnek" style={{width:'100%',height:'100%',objectFit:'cover'}}/>
                  </div>
                </div>

                <div className="post-actions">
                  <span>♡ 0</span>
                  <span>💬 0</span>
                </div>
              </article>

            </section>
          </section>

          <aside className="rightbar">
            <div className="card live-chat">
              <div className="card-header">
                <span className="card-icon" />
                <span>Canlı Sohbet</span>
                <span className="dot" />
              </div>
              <p>Genel, erkek ve kız kullanıcılarında mesajlar gecikmesiz düşer.</p>
              <button>Sohbete katıl →</button>
            </div>

            <div className="card announcement">
              <div className="card-header">
                <span className="card-icon" />
                <span>Duyurular</span>
              </div>
              <p>DüzceHUB yayında!</p>
              <small>3 sa önce</small>
            </div>

            <div className="card categories">
              <h4>Forum kategorileri</h4>
              <div className="pill-list">
                {['Oyun','İlan','Ders','Muhabbet','Yardım'].map(t => (<span key={t}>{t}</span>))}
              </div>
            </div>
          </aside>

          <nav className="mobile-nav">
            {['Forum','Sohbet','Mesajlar','Profil'].map((label,i) => (
              <button key={label} className={`mobile-item ${i===0 ? 'active' : ''}`}>
                <span>{label}</span>
              </button>
            ))}
          </nav>
        </div>
      </main>

      {showLogin && <LoginModal onLogin={onLogin} />}
    </div>
  );
}

function LoginModal({ onLogin }: any) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [gender, setGender] = useState<'Erkek'|'Kız'|''>('');
  const [agreeCookies, setAgreeCookies] = useState(false);

  function submit() {
    if (!name || !email || !gender) return alert('İsim, e‑posta ve cinsiyet zorunlu');
    if (!agreeCookies) return alert('Çerezleri kabul etmelisiniz');
    const badges = ['DüzceHub Üye'];
    if (gender === 'Erkek') badges.push('DüzceHub Erkek');
    if (gender === 'Kız') badges.push('DüzceHub Kız');
    const user = { name, email, gender, badges };
    onLogin(user);
  }

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h2>Hoş geldin DüzceHUB</h2>
        <p>Devam etmek için kayıt ol veya giriş yap. Cinsiyet seçimi zorunludur.</p>
        <input placeholder="İsim" value={name} onChange={(e)=>setName(e.target.value)} />
        <input placeholder="E‑posta" value={email} onChange={(e)=>setEmail(e.target.value)} />
        <div className="gender-row">
          <label><input type="radio" name="gender" checked={gender==='Erkek'} onChange={()=>setGender('Erkek')} /> Erkek</label>
          <label><input type="radio" name="gender" checked={gender==='Kız'} onChange={()=>setGender('Kız')} /> Kız</label>
        </div>
        <label className="cookie-row"><input type="checkbox" checked={agreeCookies} onChange={(e)=>setAgreeCookies(e.target.checked)} /> Çerezleri kabul ediyorum</label>
        <div className="modal-actions">
          <button onClick={submit} className="share-btn">Başla</button>
        </div>
      </div>
    </div>
  );
}
