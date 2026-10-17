import React, { useState } from 'react';
import { login, register } from '../api';

export default function Login({ onLogin }: any){
  const [mode, setMode] = useState<'login'|'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  async function submit(){
    try{
      if(mode === 'login'){
        const res = await login(email, password);
        onLogin(res.token);
      } else {
        const res = await register(email, password, name);
        onLogin(res.token);
      }
    }catch(e:any){ alert(e.response?.data?.error || 'Hata'); }
  }

  return (
    <div className="auth">
      <div className="card">
        <h2>{mode === 'login' ? 'Giriş Yap' : 'Kayıt Ol'}</h2>
        {mode === 'register' && <input placeholder="İsim" value={name} onChange={e=>setName(e.target.value)} />}
        <input placeholder="E‑posta" value={email} onChange={e=>setEmail(e.target.value)} />
        <input placeholder="Parola" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
        <button onClick={submit}>{mode === 'login' ? 'Giriş' : 'Kayıt'}</button>
        <button className="link" onClick={()=>setMode(mode === 'login' ? 'register' : 'login')}>{mode === 'login' ? 'Kayıt ol' : 'Giriş yap'}</button>
      </div>
    </div>
  );
}
