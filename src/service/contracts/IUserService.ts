import { Request } from 'express';
import { ApiServiceResponse } from '../../@types/apiServiceResponse';
import { IUser } from '../../models/interfaces/IUser';

export default interface IUserService {
    createUser: (userBody: IUser) => Promise<ApiServiceResponse>;
    isEmailExists: (email: string) => Promise<ApiServiceResponse>;
    getUserById: (id: string) => Promise<ApiServiceResponse>;
    changePassword: (req: Request) => Promise<ApiServiceResponse>;
}
