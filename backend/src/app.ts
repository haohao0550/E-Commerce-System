import express from 'express';
import helmet from 'helmet';
import router from '@/routes/index.routes.js';

import { setupSwagger } from '@/shared/configs/swagger.config.js';
import { globalLimiter } from '@/shared/middlewares/rate-limit.middleware.js';
import { correlationID } from '@/shared/middlewares/correlation-id.middleware.js';
import { requestLogger } from '@/shared/middlewares/request-logger.middleware.js';
import { errorHandler } from '@/shared/middlewares/error-handler.middleware.js';
import cookieParser from 'cookie-parser';

const app = express();

app.use(globalLimiter);
app.use(cookieParser());
app.use(helmet());
app.use(correlationID);
app.use(requestLogger);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
setupSwagger(app);
app.use('/api/v1', router);
app.use(errorHandler);

export default app;
