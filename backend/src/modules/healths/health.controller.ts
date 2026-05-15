import { Request, Response } from 'express';
import { HealthService } from './health.service.js';

const healthService = new HealthService();

export class HealthController {
    constructor() {}

    static async healthCheck(req: Request, res: Response) {
        const data = healthService.getHealthStatus();
        res.json(data);
    }
}