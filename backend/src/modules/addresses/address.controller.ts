import { Request, Response, NextFunction } from 'express';
import { AddressService } from './address.service.js';

export class AddressController {
    private addressService: AddressService;

    constructor() {
        this.addressService = new AddressService();
    }

    async getAllAddresses(req: Request, res: Response, next: NextFunction) {
        const { userId } = req.user;

        const addresses = await this.addressService.getAllAddresses(userId, req.validatedQuery);

        res.status(200).json({
            success: true,
            message: 'Get all addresses successful',
            data: addresses,
        });
    }

    async createAddress(req: Request, res: Response, next: NextFunction) {
        const { userId } = req.user;

        const address = await this.addressService.createAddress(userId, req.body);

        res.status(201).json({
            success: true,
            message: 'Create address successful',
            data: address,
        });
    }

    async getAddressById(req: Request, res: Response, next: NextFunction) {
        const { userId } = req.user;
        const { id } = req.params;

        const address = await this.addressService.getAddressById(userId, id.toString());

        res.status(200).json({
            success: true,
            message: 'Get address by ID successful',
            data: address,
        });
    }

    async getDefaultAddress(req: Request, res: Response, next: NextFunction) {
        const { userId } = req.user;

        const address = await this.addressService.getDefaultAddress(userId);

        res.status(200).json({
            success: true,
            message: 'Get default address successful',
            data: address,
        });
    }

    async updateAddress(req: Request, res: Response, next: NextFunction) {
        const { userId } = req.user;
        const { id } = req.params;

        const address = await this.addressService.updateAddress(userId, id.toString(), req.body);

        res.status(200).json({
            success: true,
            message: 'Update address successful',
            data: address,
        });
    }

    async deleteAddress(req: Request, res: Response, next: NextFunction) {
        const { userId } = req.user;
        const { id } = req.params;

        await this.addressService.deleteAddress(userId, id.toString());

        res.status(200).json({
            success: true,
            message: 'Delete address successful',
            data: {},
        });
    }
}
