export type User = {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    phone_number?: string;
    profile_picture?: string;
    is_customer: boolean;
    is_business: boolean;
    is_admin_role: boolean;
    is_business_approved: boolean;
    date_joined?: string;
};

export type AuthState = {
    user: User | null;
    access: string | null;
    refresh: string | null;
    isLoading: boolean;
};
