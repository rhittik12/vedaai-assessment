import cors from 'cors';
import express from 'express';

import { clientUrl } from './config/env';
import { errorHandler } from './middleware/errorHandler';
import routes from './routes';

const app = express();

app.use(
  cors({
    origin: clientUrl
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/api/health', (_request, response) => {
  response.json({ status: 'ok' });
});

app.use('/api', routes);
app.use(errorHandler);

export default app;
