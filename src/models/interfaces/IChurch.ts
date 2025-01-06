export default interface IChurch {
    id?: number;
    name: string;
    province: string;
    city: string;
    district: string;
    sub_district: string;
    parish: string;
    zipcode: string;
    address: string;
    phone_number: string;
    slug: string
    created_at?: Date;
    updated_at?: Date;
    deleted_at?: Date;
}