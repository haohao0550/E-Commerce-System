export class HealthService {
    constructor() {}

    getHealthStatus() {
        return {
            ok: true,
            uptime: process.uptime(),
            timestamp: new Date().toISOString(),
        };
    }
}