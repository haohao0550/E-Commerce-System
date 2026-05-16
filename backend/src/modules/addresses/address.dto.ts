export interface CreateAddressInput {
    fullName: string;
    phone: string;
    street: string;
    ward?: string | null;
    district?: string | null;
    province: string;
    isDefault: boolean;
}

export interface UpdateAddressInput {
    fullName?: string | undefined;
    phone?: string | undefined;
    street?: string | undefined;
    ward?: string | undefined;
    district?: string | undefined;
    province?: string | undefined;
    isDefault?: boolean | undefined;
}

export interface GetAllAddressesQuery {
    page: number;
    limit: number;
    search?: string;
}