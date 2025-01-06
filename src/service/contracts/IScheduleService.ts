import { IUser } from './../../models/interfaces/IUser';
import { Request } from "express";
import { ApiServiceResponse } from "../../@types/apiServiceResponse";
import { ISchedule } from "../../models/interfaces/ISchedule";

export default interface IChurchService{
    createSchedule: (user: IUser, churchBody: ISchedule) => Promise<ApiServiceResponse>;
    // get: (req: Request) => Promise<ApiServiceResponse>;
    // getById: (id: string) => Promise<ApiServiceResponse>;
    // update: (churchBody: IChurch, id: string) => Promise<ApiServiceResponse>;
    // delete: (id: string) => Promise<ApiServiceResponse>;
}