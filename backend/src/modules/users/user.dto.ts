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

export interface UpdateUserRoleInput {
    role: 'USER' | 'ADMIN';
}

export interface GetUsersQuery {
    page: number;
    limit: number;
    search?: string;
    role?: 'USER' | 'ADMIN';
    isDeleted?: boolean;
}
