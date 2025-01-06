export interface IUser {
    id: string;
    full_name: string;
    email: string;
    password?: string;
    active?:boolean;
    email_verified?: boolean;
    address?: string;
    phone_number?: string;
    role_id?: number
    dob: Date
    birthplace: string
    province: string
    city: string
    district: string
    sub_district: string
    zipcode: string
    status?: string;
    mass_coordination_flag: boolean
    mass_coordination_type: string
    preferential_schedules: number
    user_registration_number: number
    is_pwd_resetted: boolean
    created_at?: Date;
    updated_at?: Date;
}