import { Prisma } from '@/generated/prisma/client.js';
import * as error from '@/shared/errors/app.error.js';
import * as addressDto from './address.dto.js';
import { AddressRepo } from './address.repo.js';

export class AddressService {
    private addressRepo: AddressRepo;

    constructor() {
        this.addressRepo = new AddressRepo();
    }

    private toUserAddress(address: any) {
        return {
            id: address.id,
            fullName: address.fullName,
            phone: address.phone,
            street: address.street,
            ward: address.ward,
            district: address.district,
            province: address.province,
            isDefault: address.isDefault,
            createdAt: address.createdAt,
            updatedAt: address.updatedAt,
        };
    }

    async getAllAddresses(userId: string, query: addressDto.GetAllAddressesQuery) {
        const { page, limit, search } = query;
        const where: Prisma.UserAddressWhereInput = {
            userId,
            ...(search && {
                OR: [
                    { fullName: { contains: search, mode: 'insensitive'} },
                    { phone: { contains: search, mode: 'insensitive'} },
                    { street: { contains: search, mode: 'insensitive'} },
                    { ward: { contains: search, mode: 'insensitive',} },
                    { district: { contains: search, mode: 'insensitive'}},
                    { province: { contains: search, mode: 'insensitive'}},
                ],
            }),
        };

        const skip = (page - 1) * limit;
        const take = limit;
        const addresses = await this.addressRepo.findAllByUserId(where, skip, take);
        const total = await this.addressRepo.count(where);

        return { 
            data: addresses.map((address) => this.toUserAddress(address)), 
            meta: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            } 
        };
    }

    async createAddress(userId: string, input: addressDto.CreateAddressInput) {
        const address = await this.addressRepo.create({
            ...input,
            user : {
                connect: {
                    id: userId,
                },
            },
        });
        return this.toUserAddress(address);
    }

    async getAddressById(userId: string, id: string) {
        const address = await this.addressRepo.findById(id);
        if (!address || address.userId !== userId) {
            throw new error.NotFoundError('Address');
        }
        return this.toUserAddress(address);
    }

    async updateAddress(userId: string, id: string, input: addressDto.UpdateAddressInput) {
        const address = await this.addressRepo.findById(id);
        if (!address || address.userId !== userId) {
            throw new error.NotFoundError('Address');
        }

        const updatedAddress = await this.addressRepo.update(id, input);
        return this.toUserAddress(updatedAddress);
    }   

    async deleteAddress(userId: string, id: string) {
        const address = await this.addressRepo.findById(id);
        if (!address || address.userId !== userId) {
            throw new error.NotFoundError('Address');
        }

        await this.addressRepo.delete(id);
    }
}