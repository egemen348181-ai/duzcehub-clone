import express from 'express';
import http from 'http';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { Server as SocketIOServer } from 'socket.io';

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server, { cors: { origin: '*' } });
const prisma = new PrismaClient();

const PORT = Number(process.env.PORT || 4000);
const JWT_SECRET = process.env.JWT_SECRET || 'duzcehub_local_secret';
const uploadsDir = path.join(process.cwd(), 'uploads');

if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use('/uploads', express.static(uploadsDir));

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const safe = file.originalname.replace(/[^a-zA-Z0-9_.-]/g, '_');
    cb(null, `${Date.now()}-${safe}`);
  },
});
const upload = multer({ storage });

function signToken(user: any) {
  return jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
}

function getUserFromHeader(authHeader?: string) {
  if (!authHeader) return null;
  const token = authHeader.replace('Bearer ', '');
  try {
    return jwt.verify(token, JWT_SECRET) as any;
  } catch {
    return null;
  }
}

function requireAuth(req: any, res: any, next: any) {
  const decoded = getUserFromHeader(req.headers.authorization);
  if (!decoded) return res.status(401).json({ error: 'Unauthorized' });
  req.user = decoded;
  next();
}

function ensureAdmin(req: any, res: any, next: any) {
  if (!req.user || req.user.role !== 'Admin') {
    return res.status(403).json({ error: 'Admin only' });
  }
  next();
}

app.get('/api/health', (_req, res) => res.json({ ok: true }));

app.post('/api/auth/register', async (req, res) => {
  const { name, email, password, gender } = req.body || {};
  if (!name || !email || !password || !gender) {
    return res.status(400).json({ error: 'name, email, password and gender are required' });
  }

  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) return res.status(409).json({ error: 'User already exists' });

  const hashed = await bcrypt.hash(password, 10);
  const badges = gender === 'Erkek' ? 'DüzceHub Üye,DüzceHub Erkek' : 'DüzceHub Üye,DüzceHub Kız';

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashed,
      gender,
      role: 'Üye',
      badges,
    },
  });

  const token = signToken(user);
  return res.json({ token, user: { id: user.id, name: user.name, email: user.email, gender: user.gender, role: user.role, badges: user.badges.split(',').filter(Boolean) } });
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'email and password required' });

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

  const token = signToken(user);
  return res.json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      gender: user.gender,
      role: user.role,
      badges: user.badges.split(',').filter(Boolean),
    },
  });
});

app.get('/api/me', requireAuth, async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: Number(req.user.id) } });
  if (!user) return res.status(404).json({ error: 'User not found' });
  return res.json({
    id: user.id,
    name: user.name,
    email: user.email,
    gender: user.gender,
    role: user.role,
    badges: user.badges.split(',').filter(Boolean),
  });
});

app.get('/api/posts', async (_req, res) => {
  const posts = await prisma.post.findMany({
    orderBy: { createdAt: 'desc' },
    include: { author: true, comments: { include: { author: true } } },
  });

  res.json(posts.map((post) => ({
    id: post.id,
    content: post.content,
    image: post.image,
    category: post.category,
    createdAt: post.createdAt,
    author: {
      id: post.author.id,
      name: post.author.name,
      role: post.author.role,
      badges: post.author.badges.split(',').filter(Boolean),
    },
    comments: post.comments.map((comment) => ({
      id: comment.id,
      content: comment.content,
      createdAt: comment.createdAt,
      author: {
        id: comment.author.id,
        name: comment.author.name,
      },
    })),
  })));
});

app.post('/api/posts', requireAuth, upload.single('image'), async (req: any, res) => {
  const { content, category } = req.body;
  if (!content || !content.trim()) return res.status(400).json({ error: 'content required' });

  const image = req.file ? `/uploads/${req.file.filename}` : null;
  const post = await prisma.post.create({
    data: {
      content: content.trim(),
      image,
      category: category || 'Serbest',
      authorId: Number(req.user.id),
    },
    include: { author: true },
  });

  io.emit('new_post', {
    id: post.id,
    content: post.content,
    image: post.image,
    category: post.category,
    createdAt: post.createdAt,
    author: { id: post.author.id, name: post.author.name, role: post.author.role },
    comments: [],
  });

  res.json(post);
});

app.post('/api/posts/:id/comments', requireAuth, async (req: any, res) => {
  const { content } = req.body || {};
  if (!content || !content.trim()) return res.status(400).json({ error: 'content required' });

  const comment = await prisma.comment.create({
    data: {
      content: content.trim(),
      authorId: Number(req.user.id),
      postId: Number(req.params.id),
    },
    include: { author: true },
  });

  io.emit('new_comment', { postId: Number(req.params.id), comment });

  res.json(comment);
});

app.get('/api/announcements', async (_req, res) => {
  const announcements = await prisma.announcement.findMany({ orderBy: { createdAt: 'desc' }, include: { createdBy: true } });
  res.json(announcements.map((a) => ({
    id: a.id,
    title: a.title,
    content: a.content,
    createdAt: a.createdAt,
    createdBy: { id: a.createdBy.id, name: a.createdBy.name },
  })));
});

app.post('/api/announcements', requireAuth, async (req: any, res) => {
  if (req.user.role !== 'Admin' && req.user.role !== 'Kurucu') {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const { title, content } = req.body || {};
  if (!title || !content) return res.status(400).json({ error: 'title and content required' });

  const item = await prisma.announcement.create({
    data: { title, content, createdById: Number(req.user.id) },
    include: { createdBy: true },
  });

  io.emit('new_announcement', item);
  res.json(item);
});

app.get('/api/chat/rooms', async (_req, res) => {
  const rooms = await prisma.chatRoom.findMany({ orderBy: { createdAt: 'desc' } });
  res.json(rooms);
});

app.post('/api/chat/rooms', requireAuth, async (req: any, res) => {
  const { name } = req.body || {};
  if (!name) return res.status(400).json({ error: 'name required' });
  const room = await prisma.chatRoom.create({ data: { name, isPrivate: false } });
  res.json(room);
});

app.get('/api/chat/rooms/:id/messages', async (req, res) => {
  const messages = await prisma.chatMessage.findMany({
    where: { roomId: Number(req.params.id) },
    orderBy: { createdAt: 'asc' },
    include: { author: true },
  });
  res.json(messages.map((m) => ({
    id: m.id,
    content: m.content,
    createdAt: m.createdAt,
    author: { id: m.author.id, name: m.author.name },
  })));
});

app.post('/api/chat/rooms/:id/messages', requireAuth, async (req: any, res) => {
  const { content } = req.body || {};
  if (!content || !content.trim()) return res.status(400).json({ error: 'content required' });

  const message = await prisma.chatMessage.create({
    data: {
      content: content.trim(),
      roomId: Number(req.params.id),
      authorId: Number(req.user.id),
    },
    include: { author: true },
  });

  io.to(`room-${req.params.id}`).emit('chat_message', {
    id: message.id,
    content: message.content,
    createdAt: message.createdAt,
    author: { id: message.author.id, name: message.author.name },
  });

  res.json(message);
});

app.post('/api/support', requireAuth, async (req: any, res) => {
  const { title, content } = req.body || {};
  if (!title || !content) return res.status(400).json({ error: 'title and content required' });

  const item = await prisma.supportTicket.create({
    data: { title, content, userId: Number(req.user.id) },
  });
  res.json(item);
});

app.get('/api/support', requireAuth, async (req: any, res) => {
  if (req.user.role !== 'Admin' && req.user.role !== 'Kurucu' && req.user.role !== 'Moderator') {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const tickets = await prisma.supportTicket.findMany({ orderBy: { createdAt: 'desc' }, include: { user: true } });
  res.json(tickets.map((t) => ({
    id: t.id,
    title: t.title,
    content: t.content,
    status: t.status,
    createdAt: t.createdAt,
    user: { id: t.user.id, name: t.user.name, email: t.user.email },
  })));
});

app.get('/api/users', requireAuth, async (req: any, res) => {
  if (req.user.role !== 'Admin' && req.user.role !== 'Kurucu' && req.user.role !== 'Moderator') {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const users = await prisma.user.findMany({ orderBy: { createdAt: 'desc' } });
  res.json(users.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    gender: u.gender,
    role: u.role,
    badges: u.badges.split(',').filter(Boolean),
    createdAt: u.createdAt,
  })));
});

io.on('connection', (socket) => {
  socket.on('join_room', (roomId: string) => {
    socket.join(`room-${roomId}`);
  });

  socket.on('send_chat', async (payload: { roomId: number; content: string; token?: string }) => {
    if (!payload?.content) return;
    const user = payload.token ? getUserFromHeader(`Bearer ${payload.token}`) : null;
    if (!user) return;

    const message = await prisma.chatMessage.create({
      data: {
        content: payload.content.trim(),
        roomId: Number(payload.roomId),
        authorId: Number(user.id),
      },
      include: { author: true },
    });

    io.to(`room-${payload.roomId}`).emit('chat_message', {
      id: message.id,
      content: message.content,
      createdAt: message.createdAt,
      author: { id: message.author.id, name: message.author.name },
    });
  });
});

server.listen(PORT, async () => {
  console.log(`Server listening on ${PORT}`);

  const existing = await prisma.user.count();
  if (!existing) {
    const adminPassword = await bcrypt.hash('Admin123!', 10);
    await prisma.user.create({
      data: {
        name: 'Kurucu',
        email: 'admin@duzcehub.test',
        password: adminPassword,
        gender: 'Erkek',
        role: 'Kurucu',
        badges: 'DüzceHub Üye,DüzceHub Erkek,DüzceHub Kurucusu',
      },
    });
    console.log('Seed admin created: admin@duzcehub.test / Admin123!');
  }

  const roomCount = await prisma.chatRoom.count();
  if (roomCount === 0) {
    await prisma.chatRoom.create({ data: { name: 'Genel Sohbet', isPrivate: false } });
    await prisma.chatRoom.create({ data: { name: 'Erkek Sohbet', isPrivate: true } });
    await prisma.chatRoom.create({ data: { name: 'Kız Sohbet', isPrivate: true } });
  }
});
