import { IUser } from '../../models/interfaces/IUser';

export default interface IRedisService {
    createTokens: (
        id: string,
        tokens: { access: { token: string }; refresh: { token: string } }
    ) => Promise<boolean>;
    hasToken: (token: string, type: string) => Promise<boolean>;
    removeToken: (token: string, type: string) => Promise<number | boolean>;
    getUser: (id: string) => Promise<boolean>;
    setUser: (user: IUser) => Promise<boolean>;
}
