import { Prisma, UserAddress } from '@/generated/prisma/client.js';

export interface IAddressRepo {
    count(where: Prisma.UserAddressWhereInput): Promise<number>;
    findAllByUserId(
        where: Prisma.UserAddressWhereInput,
        skip: number,
        take: number,
    ): Promise<UserAddress[]>;
    create(data: Prisma.UserAddressCreateInput): Promise<UserAddress>;
    findById(id: string): Promise<UserAddress | null>;
    update(id: string, data: Prisma.UserAddressUpdateInput): Promise<UserAddress>;
    delete(id: string): Promise<void>;
}
