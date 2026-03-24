import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Repo root `.env`, then `backend/.env` (backend wins if both set the same key)
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });
dotenv.config({ path: path.resolve(__dirname, '.env'), override: true });
import cors from 'cors';
import { connectDb } from './config/db.js';
import authRoutes from './routes/auth.js';

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

async function start() {
  try {
    await connectDb();
    console.log('Connected to MongoDB');
  } catch (err) {
    console.error('Database connection failed:', err.message);
    process.exit(1);
  }

  app.listen(PORT, () => {
    console.log(`API listening on http://localhost:${PORT}`);
  });
}

start();
