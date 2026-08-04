import { Router } from 'express';
import healthRouter from './health.route';
import uploadRouter from './upload.routes';

const router = Router();

// Health routes mapped to /api/health
router.use('/health', healthRouter);

// Upload routes mapped to /api/upload
router.use('/upload', uploadRouter);

// TODO: Add documents router here once ready
// router.use('/documents', documentsRouter);

// TODO: Add AI router here once ready
// router.use('/ai', aiRouter);

export default router;
