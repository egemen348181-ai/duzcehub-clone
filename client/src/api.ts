import axios from 'axios';

const API = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

export async function login(email: string, password: string){
  const res = await axios.post(`${API}/auth/login`, { email, password });
  return res.data;
}

export async function register(email: string, password: string, name?: string){
  const res = await axios.post(`${API}/auth/register`, { email, password, name });
  return res.data;
}

export async function getPosts(){
  const res = await axios.get(`${API}/posts`);
  return res.data;
}

export async function createPost(token: string, content: string, file?: File){
  const form = new FormData();
  form.append('content', content);
  if(file) form.append('image', file);
  const res = await axios.post(`${API}/posts`, form, { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' } });
  return res.data;
}
