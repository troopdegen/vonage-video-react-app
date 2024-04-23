import { Router } from 'express';
import healthRoute from './health';
import sessionRouter from './session';
import feedbackRouter from './feedback';

const router = Router();

router.use('/_', healthRoute);
router.use('/session', sessionRouter);
router.use('/feedback', feedbackRouter);

export default router;
