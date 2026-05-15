import pino from 'pino';
import { appConfig } from '@/shared/configs/app.config.js';

export const logger = pino({
    level: appConfig.data?.LOG_LEVEL ?? 'info',
    base: { service: 'api', env: appConfig.data?.NODE_ENV },
    transport: {
        targets: [
            ...(appConfig.data?.NODE_ENV !== 'production'
                ? [
                      {
                          target: 'pino-pretty',
                          options: { colorize: true },
                      },
                  ]
                : []),
            {
                target: 'pino-pretty',
                options: {
                    destination: './src/public/logs/app.log',
                    colorize: false,
                    translateTime: 'SYS:standard',
                    ignore: 'pid,hostname',
                },
            },
        ],
    },
});
