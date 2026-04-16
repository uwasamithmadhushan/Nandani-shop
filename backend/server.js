import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import authRoutes from './routes/auth.js';
import adminRoutes from './routes/admin.js';
import productRoutes from './routes/products.js';
import User from './models/User.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({
  path: [path.resolve(__dirname, '..', '.env'), path.resolve(__dirname, '.env')],
  override: true,
  quiet: true,
});

const app = express();
const PORT = process.env.PORT || 4000;

const invoices = new Map();
let lastId = 1;

const corsOrigin = process.env.FRONTEND_ORIGIN || 'http://localhost:5173';
app.use(
  cors({
    origin: corsOrigin,
    credentials: true,
  })
);
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'නන්දනි වෙළදසැල API is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/products', productRoutes);

app.post('/api/invoices', (req, res) => {
  const id = String(lastId++);
  const invoice = { id, createdAt: new Date().toISOString(), ...req.body };
  invoices.set(id, invoice);
  res.status(201).json(invoice);
});

app.get('/api/invoices/:id', (req, res) => {
  const invoice = invoices.get(req.params.id);
  if (!invoice) {
    return res.status(404).json({ error: 'Invoice not found' });
  }
  res.json(invoice);
});

app.get('/api/invoices', (req, res) => {
  res.json([...invoices.values()]);
});

const ADMIN_EMAIL = String(process.env.ADMIN_EMAIL || 'admin@gmail.com')
  .trim()
  .toLowerCase();
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '123456';

async function connectToDatabase() {
  const uri = process.env.MONGODB_URI;
  if (!uri || typeof uri !== 'string' || !uri.trim()) {
    throw new Error(
      'MONGODB_URI is not set. Add it to .env (repo root or backend/), e.g. mongodb://127.0.0.1:27017/nandani-shop'
    );
  }
  await mongoose.connect(uri.trim());
  console.log('MongoDB connected');
}

async function ensureAdminUser() {
  const existing = await User.findOne({ email: ADMIN_EMAIL });
  if (!existing) {
    const hash = await bcrypt.hash(ADMIN_PASSWORD, 10);
    await User.create({
      email: ADMIN_EMAIL,
      password: hash,
      name: 'Admin',
      role: 'admin',
    });
    console.log(`Seeded admin account (${ADMIN_EMAIL})`);
    return;
  }

  let changed = false;
  if (existing.role !== 'admin') {
    existing.role = 'admin';
    changed = true;
  }

  let passwordOk = false;
  if (typeof existing.password === 'string' && existing.password.length > 0) {
    try {
      passwordOk = await bcrypt.compare(ADMIN_PASSWORD, existing.password);
    } catch {
      passwordOk = false;
    }
  }
  if (!passwordOk) {
    existing.password = await bcrypt.hash(ADMIN_PASSWORD, 10);
    changed = true;
    console.log(`Updated admin password for ${ADMIN_EMAIL} (synced to env/default)`);
  }

  if (changed) {
    await existing.save();
  }
}

async function start() {
  try {
    await connectToDatabase();
    await ensureAdminUser();
  } catch (err) {
    console.error('Database connection failed:', err.message);
    process.exit(1);
  }

  app.listen(PORT, () => {
    console.log(`API listening on http://localhost:${PORT}`);
  });
}

start();
