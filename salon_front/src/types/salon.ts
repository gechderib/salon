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
};

export type Role = {
    id: number;
    name: string;
};

export type Business = {
    id: number;
    name: string;
    description: string;
    address: string;
    map_url?: string;
    phone: string;
    logo?: string;
    working_hours: string;
    owner: number;
};

export type Service = {
    id: number;
    business: number;
    name: string;
    description: string;
    price: string;
    duration_minutes: number;
    capacity: number;
    image?: string;
    is_active: boolean;
};

export type Booking = {
    id: number;
    user: number;
    business: number;
    service: number;
    service_name: string;
    business_name: string;
    date: string;
    start_time: string;
    end_time: string;
    status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
};
