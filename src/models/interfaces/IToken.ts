export interface IToken {
    id?: number;
    token: string;
    user_id: string;
    type: string;
    expires: Date;
    blacklisted: boolean;
    created_at?: Date;
    updated_at?: Date;
}