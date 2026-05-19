import pino from 'pino';

export const logger = pino({
    level: process.env.LOG_LEVEL || 'info',

    base: {
        service: 'ecommerce-api',
        env: process.env.NODE_ENV,
    },

    timestamp: pino.stdTimeFunctions.isoTime,

    transport:
        process.env.NODE_ENV !== 'production'
            ? {
                  target: 'pino-pretty',
                  options: {
                      colorize: true,
                      translateTime: 'SYS:standard',
                      ignore: 'pid,hostname',
                  },
              }
            : undefined,
});
