import { Router } from 'express';
import { authRequired } from '../middleware/auth.js';
import Product from '../models/Product.js';

const router = Router();

router.use(authRequired);

function serializeProduct(product) {
  return {
    id: String(product._id),
    name: product.name,
    sku: product.sku || '',
    category: product.category || 'General',
    price: product.price,
    stock: product.stock,
    description: product.description || '',
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
  };
}

router.get('/', async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 }).lean();
    res.json({ products: products.map(serializeProduct) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not load products' });
  }
});

router.post('/', async (req, res) => {
  try {
    const name = String(req.body.name || '').trim();
    const sku = String(req.body.sku || '').trim();
    const category = String(req.body.category || 'General').trim() || 'General';
    const description = String(req.body.description || '').trim();
    const price = Number(req.body.price);
    const stock = Number(req.body.stock);

    if (!name) {
      return res.status(400).json({ error: 'Product name is required' });
    }
    if (!Number.isFinite(price) || price < 0) {
      return res.status(400).json({ error: 'Product price must be a valid number' });
    }
    if (!Number.isFinite(stock) || stock < 0) {
      return res.status(400).json({ error: 'Product stock must be a valid number' });
    }

    const product = await Product.create({
      name,
      sku,
      category,
      description,
      price,
      stock: Math.floor(stock),
    });

    res.status(201).json({ product: serializeProduct(product) });
  } catch (err) {
    if (err?.code === 11000) {
      return res.status(409).json({ error: 'Product SKU already exists' });
    }
    console.error(err);
    res.status(500).json({ error: 'Could not create product' });
  }
});

export default router;