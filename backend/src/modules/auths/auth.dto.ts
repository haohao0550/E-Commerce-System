export type RegisterInput = {
    email: string;
    password: string;
    name?: string;
    phone?: string;
};

export type LoginInput = {
    email: string;
    password: string;
};
