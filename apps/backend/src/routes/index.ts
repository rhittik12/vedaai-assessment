import { Router } from 'express';

import assignmentsRouter from './assignments';

const router = Router();

router.use('/assignments', assignmentsRouter);

export default router;
