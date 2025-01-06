import { response } from 'express';
import { Request, Response } from 'express';
import httpStatus from 'http-status';
import { ApiServiceResponse } from '../@types/apiServiceResponse';
import { logger } from '../config/logger';
import ScheduleService from '../service/implementations/ScheduleService';


export default class ScheduleController {
    private scheduleService: ScheduleService;

    constructor() {
        this.scheduleService = new ScheduleService();;
    }

    // getChurchSchedules = async (req: Request, res: Response) => {
    //     try {
    //         const schedules = await this.scheduleService.listSchedules(req);
    //         const { code, message } = schedules.response;
    //         const data: any = schedules.response.data;

    //         res.status(schedules.statusCode).json({
    //             code,
    //             message,
    //             data
    //         })

    //     } catch (e) {
    //         res.status(httpStatus.BAD_GATEWAY).json({
    //             status: httpStatus.BAD_GATEWAY,
    //             message: 'Something Went Wrong',
    //         });
    //     }
    // }

    listSchedules = async(req: Request, res: Response) => {
        try {
            const schedules = await this.scheduleService.listAllSchedules();
            const { code, message, data } = schedules.response;

            res.status(code).json({
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

    listMonthlySchedules = async (req: Request, res: Response) => {
        try {
            const reqQuery: any = req.query
            const schedules = await this.scheduleService.listMonthlySchedule(reqQuery.month, reqQuery.year, reqQuery.church_id, reqQuery.user_id);
            const { code, message, data } = schedules.response;

            res.status(code).json({
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

    getScheduleById = async (req: Request, res: Response) => {
        try {
            const schedules = await this.scheduleService.getScheduleById(req.params.id);
            const { code, message, data } = schedules.response;

            res.status(code).json({
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

    getScheduleByUserId = async (req: Request, res: Response) => {
        try {
            const reqQuery: any = req.query
            const schedules = await this.scheduleService.getScheduleByUserId(req.params.id, reqQuery.month, reqQuery.year);
            const { code, message, data } = schedules.response;

            res.status(code).json({
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

    createSchedule = async (req: Request, res: Response) => {
        try {
            const schedule = await this.scheduleService.createSchedule(req.userInfo!, req.body)
            const { code, message, data } = schedule.response

            res.status(code).send({ code , message, data });
        } catch (error) {
            res.status(httpStatus.BAD_GATEWAY).json({
                status: httpStatus.BAD_GATEWAY,
                message: error,
            });
        }
    };

    createMonthlySchedule = async (req: Request, res: Response) => {
        try {
            const reqQuery: any = req.query
            const schedule = await this.scheduleService.createMonthlySchedule(req.userInfo!, req.body)
            const { code, message, data } = schedule.response

            res.status(code).send({ code , message, data });
        } catch (e) {
            res.status(httpStatus.BAD_GATEWAY).json({
                status: httpStatus.BAD_GATEWAY,
                message: 'Something Went Wrong',
            });
        }
    }

    updateSchedule = async (req: Request, res: Response) => {
        try {
            const church = await this.scheduleService.updateSchedule(req.params.id, req.body, req.userInfo!)
            const { code, message } = church.response

            res.status(code).send({ code, message })
        } catch (error) {
            res.status(httpStatus.BAD_GATEWAY).json({
                status: httpStatus.BAD_GATEWAY,
                message: error
            })
        }
    }

    deleteSchedule = async (req: Request, res: Response) => {
        try {
            const church = await this.scheduleService.deleteSchedule(req.params.id)
            const { code, message } = church.response

            res.status(code).send({ code, message })
        } catch (error) {
            res.status(httpStatus.BAD_GATEWAY).json({
                status: httpStatus.BAD_GATEWAY,
                message: error
            })
        }
    }

    downloadExcel = async(req: Request, res: Response) => {
        try {
            const reqQuery: any = req.query
            const workbook = await this.scheduleService.downloadExcel(res, reqQuery.church_id, reqQuery.month, reqQuery.year)            
            
            // res is a Stream object
            res.setHeader(
                "Content-Type",
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            );
            // res.setHeader(
            //     "Content-Disposition",
            //     "attachment; filename=" + "tutorials.xlsx"
            // );

            // return await workbook.xlsx.write(res).then(function () {
            //     res.status(200).end()
            // })

            await workbook.xlsx.write(res)
            res.end()


            // res.status(code).send({ code, message })
        } catch (error) {
            res.status(httpStatus.BAD_GATEWAY).json({
                status: httpStatus.BAD_GATEWAY,
                message: error
            })
        }
    }
}