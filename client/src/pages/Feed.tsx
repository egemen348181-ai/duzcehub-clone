import React, { useEffect, useState } from 'react';
import { getPosts, createPost } from '../api';
import io from 'socket.io-client';

export default function Feed({ token, onLogout }: any){
  const [posts, setPosts] = useState<any[]>([]);
  const [content, setContent] = useState('');
  const [file, setFile] = useState<File | null>(null);

  useEffect(()=>{ fetchPosts();
    const s = io((import.meta.env.VITE_API_URL || 'http://localhost:4000').replace('/api',''));
    s.on('new_post', (p:any)=> setPosts((cur)=> [p, ...cur]));
    return ()=>{ s.disconnect(); };
  },[]);

  async function fetchPosts(){
    const p = await getPosts();
    setPosts(p);
  }

  async function submit(){
    if(!content && !file) return alert('İçerik veya görsel gerekli');
    // @ts-ignore
    const t = token;
    const created = await createPost(t, content, file || undefined);
    setContent(''); setFile(null);
  }

  return (
    <div className="container">
      <header className="top">
        <h1>Akış</h1>
        <div>
          <button onClick={onLogout}>Çıkış</button>
        </div>
      </header>

      <section className="composer">
        <textarea value={content} onChange={(e)=>setContent(e.target.value)} placeholder="Düzce'de neler oluyor?" />
        <div className="composer-actions">
          <input type="file" onChange={(e)=>setFile(e.target.files?.[0]||null)} />
          <button onClick={submit}>Paylaş</button>
        </div>
      </section>

      <section className="posts">
        {posts.map(p=> (
          <article key={p.id} className="post">
            <div className="meta">{p.author?.email} • {new Date(p.createdAt).toLocaleString()}</div>
            <div className="content">{p.content}</div>
            {p.image && <img src={ (import.meta.env.VITE_API_URL || 'http://localhost:4000') + p.image } alt="upload" />}
          </article>
        ))}
      </section>
    </div>
  );
}
