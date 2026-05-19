import prisma from '../db.config.js';
import * as argon2 from 'argon2';

export const clearUsers = async () => {
    await prisma.user.deleteMany();
};

export const seedUser = async (email: string, password: string) => {
    const hashedPassword = await argon2.hash(password);
    const newUser = await prisma.user.create({
        data: {
            email,
            password: hashedPassword,
        },
    });

    return {
        id: newUser.id,
        email: newUser.email,
    };
};
