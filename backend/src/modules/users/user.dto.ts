export interface UpdateProfileInput {
    email?: string;
    name?: string | null;
    phone?: string | null;
    avatar?: string | null;
}

export interface ChangePasswordInput {
    oldPassword: string;
    newPassword: string;
}
