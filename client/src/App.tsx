import React, { useEffect, useState } from 'react';

const DEMO_TOKEN = 'demo-token';

export default function App() {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('token');
    if (saved) {
      setToken(saved);
      return;
    }
    localStorage.setItem('token', DEMO_TOKEN);
    setToken(DEMO_TOKEN);
  }, []);

  return <Feed token={token || DEMO_TOKEN} onLogout={() => localStorage.removeItem('token')} />;
}

function Feed({ token, onLogout }: { token: string; onLogout: () => void }) {
  const [activeTab, setActiveTab] = useState('Akış');
  const [draft, setDraft] = useState('');
  const [feedState, setFeedState] = useState<'empty' | 'filled'>('filled');

  const categories = ['Serbest', 'Muhabbet', 'İlan', 'Oyun', 'Ders', 'Yardım'];
  const rightCategories = ['Oyun', 'İlan', 'Ders', 'Muhabbet', 'Yardım'];

  const currentUser = 'EGEMEN Özdemir';

  return (
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
            <button
              key={label}
              className={`nav-item ${activeTab === label ? 'active' : ''}`}
              onClick={() => setActiveTab(label)}
            >
              <span className={`icon ${getNavKey(label)}`} />
              <span>{label}</span>
            </button>
          ))}
        </nav>

        <div className="nav-divider" />

        <nav className="nav-menu secondary">
          {['Profilim', 'Ayarlar', 'Admin Panel'].map((label) => (
            <button
              key={label}
              className="nav-item"
              onClick={() => setActiveTab(label)}
            >
              <span className={`icon ${getNavKey(label)}`} />
              <span>{label}</span>
            </button>
          ))}
        </nav>

        <div className="profile-card">
          <div className="profile-avatar">E</div>
          <div className="profile-meta">
            <strong>{currentUser}</strong>
            <span>DüzceHub Kurucusu</span>
          </div>
        </div>
      </aside>

      <main className="main-panel">
        <header className="topbar">
          <div className="topbar-user">
            Hoş geldin, <strong>{currentUser}</strong>
          </div>
          <button className="join-chat">Sohbete katıl</button>
        </header>

        <section className="feed">
          <div className="feed-header">
            <h1>Akış</h1>
            <p>Düzce’den son paylaşımlar</p>
          </div>

          <div className="composer">
            <div className="composer-avatar">E</div>
            <div className="composer-box">
              <div className="input-wrapper">
                <textarea
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="Düzce’de neler oluyor? Bir şeyler yaz..."
                />
              </div>

              <div className="composer-actions">
                <div className="tag-list">
                  {categories.map((tag, index) => (
                    <button key={tag} className={`tag ${index === 0 ? 'tag-green' : ''}`}>
                      {tag}
                    </button>
                  ))}
                </div>

                <div className="compose-footer">
                  <button className="attach-btn">Görsel</button>
                  <button className="share-btn">Paylaş</button>
                </div>
              </div>
            </div>
          </div>

          {feedState === 'filled' ? (
            <article className="post-card">
              <div className="post-head">
                <div className="avatar">E</div>
                <div className="post-meta">
                  <div className="user-row">
                    <h3>{currentUser}</h3>
                    <span className="badge">#ilan</span>
                  </div>
                  <div className="timestamp">3 sa önce</div>
                </div>
              </div>

              <div className="post-body">
                <p className="caption">sELAMAMMMMS</p>
                <div className="post-image" aria-label="Örnek görsel">
                  <div className="portrait">
                    <div className="halo" />
                    <div className="hair" />
                    <div className="head" />
                    <div className="body" />
                    <div className="arm left" />
                    <div className="arm right" />
                    <div className="weapon" />
                  </div>
                </div>
              </div>

              <div className="post-actions">
                <span>♡ 0</span>
                <span>💬 0</span>
              </div>
            </article>
          ) : (
            <div className="empty-feed-card">
              <div className="empty-bubble">💬</div>
              <div className="empty-title">Henüz konu yok.</div>
              <div className="empty-link">İlk tartışmayı başlat</div>
            </div>
          )}
        </section>
      </main>

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
            {rightCategories.map((tag) => (
              <span key={tag}>{tag}</span>
            ))}
          </div>
        </div>
      </aside>

      <nav className="mobile-nav">
        {['Forum', 'Sohbet', 'Mesajlar', 'Profil'].map((label, i) => (
          <button key={label} className={`mobile-item ${i === 0 ? 'active' : ''}`}>
            <span className={`icon ${getNavKey(label)}`} />
            <span>{label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}

function getNavKey(label: string) {
  const map: Record<string, string> = {
    Akış: 'home',
    Forum: 'forum',
    'Canlı Sohbet': 'chat',
    Mesajlar: 'mail',
    Duyurular: 'announce',
    Destek: 'help',
    'Yardım Rehberi': 'docs',
    Profilim: 'user',
    Ayarlar: 'settings',
    'Admin Panel': 'admin',
    Sohbet: 'chat',
    Profil: 'user'
  };
  return map[label] || 'home';
}
