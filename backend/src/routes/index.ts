import { Router } from 'express';
import healthRouter from './health.route';
import uploadRouter from './upload.routes';
import analyzeRouter from './analyze.routes';

const router = Router();

// Health routes mapped to /api/health
router.use('/health', healthRouter);

// Upload routes mapped to /api/upload
router.use('/upload', uploadRouter);

// Analyze routes mapped to /api/analyze
router.use('/analyze', analyzeRouter);

// TODO: Add documents router here once ready
// router.use('/documents', documentsRouter);

// TODO: Add AI router here once ready
// router.use('/ai', aiRouter);

export default router;
