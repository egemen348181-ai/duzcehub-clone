import express from 'express';
import http from 'http';
import { Server as IOServer } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

dotenv.config();
const app = express();
const server = http.createServer(app);
const io = new IOServer(server, { cors: { origin: '*' } });
const prisma = new PrismaClient();

const PORT = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET || 'secret';

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// Ensure uploads dir
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);

// Multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// Helpers
function generateToken(user: any) {
  return jwt.sign({ id: user.id, email: user.email, isAdmin: user.isAdmin }, JWT_SECRET, { expiresIn: '7d' });
}

function authMiddleware(req: any, res: any, next: any) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: 'Unauthorized' });
  const token = auth.replace('Bearer ', '');
  try {
    const data = jwt.verify(token, JWT_SECRET);
    (req as any).user = data;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
}

// Routes
app.post('/api/auth/register', async (req, res) => {
  const { email, password, name } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Missing' });
  const hashed = await bcrypt.hash(password, 10);
  try {
    const user = await prisma.user.create({ data: { email, password: hashed, name } });
    const token = generateToken(user);
    res.json({ user: { id: user.id, email: user.email, name: user.name }, token });
  } catch (err: any) {
    res.status(400).json({ error: 'User exists' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(400).json({ error: 'Invalid' });
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return res.status(400).json({ error: 'Invalid' });
  const token = generateToken(user);
  res.json({ user: { id: user.id, email: user.email, name: user.name }, token });
});

app.get('/api/posts', async (req, res) => {
  const posts = await prisma.post.findMany({ include: { author: true }, orderBy: { createdAt: 'desc' } });
  res.json(posts);
});

app.post('/api/posts', authMiddleware, upload.single('image'), async (req: any, res) => {
  const { content } = req.body;
  const image = req.file ? `/uploads/${req.file.filename}` : null;
  const authorId = (req.user as any).id;
  const post = await prisma.post.create({ data: { content, image, authorId } });
  io.emit('new_post', post);
  res.json(post);
});

// Simple admin route
app.get('/api/admin/users', authMiddleware, async (req: any, res) => {
  if (!req.user.isAdmin) return res.status(403).json({ error: 'Forbidden' });
  const users = await prisma.user.findMany();
  res.json(users);
});

// Socket
io.on('connection', (socket) => {
  console.log('socket connected', socket.id);
  socket.on('chat_message', (msg) => {
    io.emit('chat_message', msg);
  });
});

server.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
