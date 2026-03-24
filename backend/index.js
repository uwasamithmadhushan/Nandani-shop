import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 4000;

// In-memory invoice store (for demo); replace with a database later
const invoices = new Map();
let lastId = 1;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'නන්දනි වෙළදසැල API is running' });
});

// Create a new invoice
app.post('/api/invoices', (req, res) => {
  const id = String(lastId++);
  const invoice = { id, createdAt: new Date().toISOString(), ...req.body };
  invoices.set(id, invoice);
  res.status(201).json(invoice);
});

// Get a single invoice
app.get('/api/invoices/:id', (req, res) => {
  const invoice = invoices.get(req.params.id);
  if (!invoice) {
    return res.status(404).json({ error: 'Invoice not found' });
  }
  res.json(invoice);
});

// List all invoices
app.get('/api/invoices', (req, res) => {
  res.json([...invoices.values()]);
});

app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`);
});
