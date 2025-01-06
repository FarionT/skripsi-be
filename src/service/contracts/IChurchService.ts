import { Request } from "express";
import { ApiServiceResponse } from "../../@types/apiServiceResponse";
import IChurch from "../../models/interfaces/IChurch";

export default interface IChurchService{
    create: (churchBody: IChurch) => Promise<ApiServiceResponse>;
    // get: (req: Request) => Promise<ApiServiceResponse>;
    // getById: (id: string) => Promise<ApiServiceResponse>;
    // update: (churchBody: IChurch, id: string) => Promise<ApiServiceResponse>;
    // delete: (id: string) => Promise<ApiServiceResponse>;
}