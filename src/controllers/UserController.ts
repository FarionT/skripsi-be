import { Request, Response } from 'express';
import httpStatus from 'http-status';
import { ApiServiceResponse } from '../@types/apiServiceResponse';
import { logger } from '../config/logger';
import UserService from '../service/implementations/UserService';


export default class UserController {
    private userService: UserService;

    constructor() {
        this.userService = new UserService();;
    }

    create = async (req: Request, res: Response) => {
      try {
          const user = await this.userService.createUser(req.body)
          const { code, message, data } = user.response

          res.status(code).send({ code , message, data });
      } catch (error) {
          res.status(httpStatus.BAD_GATEWAY).json({
              status: httpStatus.BAD_GATEWAY,
              message: error,
          });
      }
    };

    updateUser = async(req: Request, res: Response) => {
        try {
            const user = await this.userService.updateUser(req.body, req.params.id)

            const { code, message, data } = user.response

            res.status(code).send({ code, message, data })
        } catch (error) {
            res.status(httpStatus.BAD_GATEWAY).json({
                status: httpStatus.BAD_GATEWAY,
                message: error
            })
        }
    }

    resetPassword = async (req: Request, res: Response) => {
        try {
            const user = await this.userService.resetPassword(req.body, req.params.id)

            const { code, message, data } = user.response

            res.status(code).send({ code, message, data })
        } catch (error) {
            res.status(httpStatus.BAD_GATEWAY).json({
                status: httpStatus.BAD_GATEWAY,
                message: error
            })
        }
    }

    getById = async (req: Request, res: Response) => {
        try {
            const user = await this.userService.getUserById(req.params.id)

            const { code, message, data } = user.response

            res.status(user.statusCode).send({ code , message, data });
        } catch (error) {
            res.status(httpStatus.BAD_GATEWAY).json({
                status: httpStatus.BAD_GATEWAY,
                message: error,
            });
        }
        
    }

    list = async (req: Request, res: Response) => {
        try {
            const user = await this.userService.listAllUsers(req, req.query);
            const { code, message } = user.response;
            const data: any = user.response.data;

            res.status(user.statusCode).json({
                code,
                message,
                count: data.count,
                data: data.rows
            })

        } catch (e) {
            console.log(e)
            res.status(httpStatus.BAD_GATEWAY).json({
                status: httpStatus.BAD_GATEWAY,
                message: 'Something Went Wrong',
            });
        }
    }

    deleteUser = async(req: Request, res: Response) => {
        try {
            const Locators: ApiServiceResponse = await this.userService.deleteUser(
                req,
                req.params.id
            );

            const { status, code, message, data } = Locators.response;

            res.status(Locators.statusCode).send({ status, code, message, data });
        } catch (e) {

        }
    }

    getDashboardData = async (req: Request, res: Response) => {
        try {
            const dashboardData = await this.userService.getDashboardData();

            const { code, message, data } = dashboardData.response;

            res.status(dashboardData.statusCode).json({
                code,
                message,
                data
            })
        } catch (error) {
            res.status(httpStatus.BAD_GATEWAY).json({
                status: httpStatus.BAD_GATEWAY,
                message: error,
            });
        }
    }

    getUserStatuses = async (req: Request, res: Response) => {
        try {
            const items = await this.userService.getStatuses();

            const { code, message } = items.response;
            const data: any = items.response.data;

            res.status(items.statusCode).json({
                code,
                message,
                count: data.length,
                data: data
            })
        } catch (error) {
            res.status(httpStatus.BAD_GATEWAY).json({
                status: httpStatus.BAD_GATEWAY,
                message: error,
            });
        }
    }

    getCoordinatorTypes = async (req: Request, res: Response) => {
        try {
            const items = await this.userService.getCoordinatorTypes();

            const { code, message } = items.response;
            const data: any = items.response.data;

            res.status(items.statusCode).json({
                code,
                message,
                count: data.length,
                data: data
            })
        } catch (error) {
            res.status(httpStatus.BAD_GATEWAY).json({
                status: httpStatus.BAD_GATEWAY,
                message: error,
            });
        }
    }
  }