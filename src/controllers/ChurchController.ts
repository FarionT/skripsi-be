import { Request, Response } from 'express';
import httpStatus from 'http-status';
import { ApiServiceResponse } from '../@types/apiServiceResponse';
import { logger } from '../config/logger';
import ChurchService from '../service/implementations/ChurchService';


export default class ChurchController {
    private churchService: ChurchService;

    constructor() {
        this.churchService = new ChurchService();;
    }

    getChurchSchedules = async (req: Request, res: Response) => {
        try {
            const schedules = await this.churchService.listSchedules(req);
            const { code, message } = schedules.response;
            const data: any = schedules.response.data;

            res.status(schedules.statusCode).json({
                code,
                message,
                data
            })

        } catch (e) {
            res.status(httpStatus.BAD_GATEWAY).json({
                status: httpStatus.BAD_GATEWAY,
                message: 'Something Went Wrong',
            });
        }
    }

    createChurch = async (req: Request, res: Response) => {
        try {
            const church = await this.churchService.create(req.body)
            const { code, message, data } = church.response

            res.status(code).send({ code , message, data });
        } catch (error) {
            res.status(httpStatus.BAD_GATEWAY).json({
                status: httpStatus.BAD_GATEWAY,
                message: error,
            });
        }
    };

    getById = async (req: Request, res: Response) => {
        try {
            const church = await this.churchService.getById(req.params.id)
            const { code, message, data } = church.response

            res.status(code).send({ code, message, data });
        } catch (error) {
            res.status(httpStatus.BAD_GATEWAY).json({
                status: httpStatus.BAD_GATEWAY,
                message: error,
            });
        }
    }

    listChurches = async (req: Request, res: Response) => {
        try {
            const churches = await this.churchService.list(req);
            const { code, message } = churches.response;
            const data: any = churches.response.data;

            res.status(churches.statusCode).json({
                code,
                message,
                count: data.count,
                data: data.rows
            })

        } catch (e) {
            res.status(httpStatus.BAD_GATEWAY).json({
                status: httpStatus.BAD_GATEWAY,
                message: 'Something Went Wrong',
            });
        }
    }

    updateChurch = async (req: Request, res: Response) => {
        try {
            const church = await this.churchService.updateChurch(req, req.params.id)
            const { code, message, data } = church.response

            res.status(code).send({ code, message });
        } catch (error) {
            res.status(httpStatus.BAD_GATEWAY).json({
                status: httpStatus.BAD_GATEWAY,
                message: error,
            });
        }
    }

    deleteChurch = async(req: Request, res: Response) => {
        try {
            const church = await this.churchService.deleteChurch(req, req.params.id)
            const { code, message, data } = church.response

            res.status(code).send({ code, message, data });
        } catch (e) {
            res.status(httpStatus.BAD_GATEWAY).json({
                status: httpStatus.BAD_GATEWAY,
                message: e,
            });
        }
    }
}