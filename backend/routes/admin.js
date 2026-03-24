import { Router } from 'express';
import User from '../models/User.js';
import { authRequired, adminRequired } from '../middleware/auth.js';

const router = Router();

router.use(authRequired, adminRequired);

router.get('/users', async (req, res) => {
  try {
    const users = await User.find()
      .select('email name role createdAt updatedAt')
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      users: users.map((u) => ({
        id: String(u._id),
        email: u.email,
        name: u.name || '',
        role: u.role || 'user',
        createdAt: u.createdAt,
        updatedAt: u.updatedAt,
      })),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not load users' });
  }
});

export default router;
