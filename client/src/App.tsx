import React, { useEffect, useState } from 'react';
import { getPosts, createPost, login, getMe } from './api';
import Feed from './pages/Feed';
import Login from './pages/Login';

export default function App(){
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));

  useEffect(()=>{
    if(token) localStorage.setItem('token', token);
    else localStorage.removeItem('token');
  },[token]);

  if(!token) return <Login onLogin={(t)=>setToken(t)} />;
  return <Feed token={token} onLogout={()=>setToken(null)} />;
}
