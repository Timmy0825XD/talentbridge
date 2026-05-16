import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware';
import { prisma } from '../lib/prisma';

const router = Router();

// GET /api/keywords — lista keywords activas, filtrable por tipo
router.get('/', authenticate, async (req, res) => {
  try {
    const { type } = req.query;

    const where: any = { isActive: true };
    if (type) where.type = type;

    const keywords = await prisma.keyword.findMany({
      where,
      orderBy: [{ category: 'asc' }, { name: 'asc' }],
      select: { id: true, name: true, type: true, category: true },
    });

    res.json(keywords);
  } catch (err) {
    console.error('getKeywords error:', err);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
});

export default router;