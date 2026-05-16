import dotenv from 'dotenv';
import app from '@/app.js';
import { appConfig } from '@/shared/configs/app.config.js';

dotenv.config();

const PORT = appConfig.PORT || 3000;

app.listen({ port: PORT, host: '0.0.0.0' }, () => {
    console.log(
        `Server running at http://localhost:${appConfig.PORT}/ in ${appConfig.NODE_ENV} mode`,
    );
    console.log(
        `Swagger UI available at http://localhost:${PORT}/api-docs`,
    );
});
