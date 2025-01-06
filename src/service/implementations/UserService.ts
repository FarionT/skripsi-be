/* eslint-disable no-param-reassign */
/* eslint-disable @typescript-eslint/no-shadow */
import httpStatus from 'http-status';
import * as bcrypt from 'bcrypt';
import { uuid } from 'uuidv4';
import { query, Request } from 'express';
import { responseMessageConstant, userConstant } from '../../config/constant';
import { logger } from '../../config/logger';
import UserDao from '../../dao/implementations/UserDao';
import responseHandler from '../../helper/responseHandler';
import { IUser } from '../../models/interfaces/IUser';
import IUserService from '../contracts/IUserService';
import db, { sequelize } from '../../models';
const { v4: uuidv4 } = require('uuid');

const { user: User, role: Role, prodeacon_schedule: ProdeaconSchedule } = db

export default class UserService implements IUserService {
    private userDao: UserDao;

    constructor() {
        this.userDao = new UserDao();
    }

    listAllUsers = async(req: Request, reqQuery: any) => {
        try {
            const users = await this.userDao.listAllUser({
                pagination: reqQuery.pagination,
                page: reqQuery.page,
                row: reqQuery.row,
                search: reqQuery.search,
                sort_by: reqQuery.sort_by,
                sort_type: reqQuery.sort_type,
                statuses: reqQuery.statuses,
                churches: reqQuery.churches
            })

            
            return responseHandler.returnSuccess(httpStatus.OK, responseMessageConstant.USER_200_FETCHED_ALL, users)
        } catch (e) {
            console.log(e);
            return responseHandler.returnError(httpStatus.BAD_GATEWAY, responseMessageConstant.HTTP_502_BAD_GATEWAY);
        }
    }

    createUser = async (userBody: IUser) => {
        try {
            let message = 'Penambahan data prodiakon berhasil disimpan';
            if (await this.userDao.isEmailExists(userBody.email)) {
                return responseHandler.returnError(httpStatus.BAD_REQUEST, 'Email sudah terdaftar');
            }
            
            if (await this.userDao.isNumberExists(userBody.user_registration_number)) {
                return responseHandler.returnError(httpStatus.BAD_REQUEST, 'No. Registrasi sudah terdaftar');
            }

            const uuidValue = uuidv4();
            userBody.email = userBody.email.toLowerCase();
            userBody.password = bcrypt.hashSync('Passw0rd', 8);
            userBody.id = uuidValue;
            userBody.active = true;
            userBody.email_verified = userConstant.EMAIL_VERIFIED_FALSE;
            userBody.is_pwd_resetted = false
            userBody.role_id = 3

            let userData = await sequelize.transaction(async (t) => {
                return await this.userDao.create(userBody, {
                    transaction: t,
                });
            });

            if (!userData) {
                message = 'Registration Failed! Please Try again.';
                return responseHandler.returnError(httpStatus.BAD_REQUEST, message);
            }

            userData = userData.toJSON();
            delete userData.password;

            return responseHandler.returnSuccess(httpStatus.CREATED, message, userData);
        } catch (e) {
            logger.error(e);
            return responseHandler.returnError(httpStatus.BAD_REQUEST, 'Something went wrong!');
        }
    };

    updateUser = async (userBody: IUser, id: string) => {
        try {
            let message = 'Perubahan data prodiakon berhasil disimpan'

            // If the user existed or not
            const isUserExist = await User.findOne({ where: { id } });
            if (!isUserExist){
                return responseHandler.returnError(httpStatus.BAD_REQUEST, 'Data Prodiakon tidak ditemukan');
            }

            // If the email has existed
            const isEmailExist = await User.findOne({
                where: { email: userBody.email }
            })

            if (isEmailExist && (isEmailExist.id !== id)) {
                return responseHandler.returnError(httpStatus.BAD_REQUEST, 'Email sudah ada');
            }

            // If the user registration number has existed
            const isUserNumberExist = await User.findOne({
                where: { user_registration_number: userBody.user_registration_number }
            })

            if (isUserNumberExist && (isUserNumberExist.id !== id)) {
                return responseHandler.returnError(httpStatus.BAD_REQUEST, 'Nomor Registrasi sudah ada');
            }

            await sequelize.transaction(async (t) =>{
                try {
                    await isUserExist.update(userBody,  {
                        transaction: t
                    })  
                } catch (e) {
                    throw e
                }
            })

            return responseHandler.returnSuccess(httpStatus.OK, message);

        } catch (e) {
            console.log(e);
            return responseHandler.returnError(httpStatus.BAD_GATEWAY, responseMessageConstant.HTTP_502_BAD_GATEWAY);
        }
    }

    resetPassword = async (userBody: any, id: string) => {
        let t = await sequelize.transaction()
        try {
            let message = 'Perubahan data prodiakon berhasil disimpan'

            // If the user existed or not
            const isUserExist = await User.findOne({ where: { id } });
            if (!isUserExist){
                return responseHandler.returnError(httpStatus.BAD_REQUEST, 'Data Prodiakon tidak ditemukan');
            }

            let new_password = userBody.new_password ? userBody.new_password: 'Passw0rd'

            await isUserExist.update({
                password: bcrypt.hashSync(new_password, 8)
            }, { transaction: t })

            t.commit()

            return responseHandler.returnSuccess(httpStatus.OK, message);

        } catch (e) {
            t.rollback()
            console.log(e);
            return responseHandler.returnError(httpStatus.BAD_GATEWAY, responseMessageConstant.HTTP_502_BAD_GATEWAY);
        }
    }

    isEmailExists = async (email: string) => {
        const message = 'Email found!';
        if (!(await this.userDao.isEmailExists(email))) {
            return responseHandler.returnError(httpStatus.BAD_REQUEST, 'Email not Found!!');
        }
        return responseHandler.returnSuccess(httpStatus.OK, message);
    };

    getUserById = async (id: string) => {
        const user = await User.findOne({ 
            where: { id: id },
            include: [
                {
                    model: Role,
                    attributes: {
                        exclude: ['created_at', 'updated_at', 'deleted_at']
                    }
                }
            ] 
        });
        
        if(!user) {
            return responseHandler.returnError(httpStatus.BAD_REQUEST, 'User not Found!!');
        }

        return responseHandler.returnSuccess(httpStatus.OK, responseMessageConstant.USER_200_FETCHED_SINGLE, user)
    }

    changePassword = async (req: Request) => {
        try {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            const { password, confirm_password, old_password } = req.body;
            let message = 'Silakan login kembali';
            if (req.userInfo === undefined) {
                return responseHandler.returnError(httpStatus.UNAUTHORIZED, 'Please Authenticate!');
            }
            let user = await this.userDao.findOneByWhere({ id: req.userInfo.id });

            if (!user) {
                return responseHandler.returnError(httpStatus.NOT_FOUND, 'User Not found!');
            }
            if (password !== confirm_password) {
                return responseHandler.returnError(
                    httpStatus.BAD_REQUEST,
                    'Konfirmasi Password harus sama dengan Password Baru'
                );
            }

            const isPasswordValid = await bcrypt.compare(old_password, user.password);
            user = user.toJSON();
            delete user.password;

            if (!isPasswordValid) {
                message = 'Password Lama Anda salah';
                return responseHandler.returnError(httpStatus.BAD_REQUEST, message);
            }

            const updateUser = await this.userDao.updateWhere(
                { 
                    password: bcrypt.hashSync(password, 8),
                    is_pwd_resetted: true
                 },
                { id: user.id }
            );

            if (updateUser) {
                return responseHandler.returnSuccess(
                    httpStatus.OK,
                    message
                );
            }

            return responseHandler.returnError(httpStatus.BAD_REQUEST, 'Gagal mengganti password');
        } catch (e) {
            console.log(e);
            return responseHandler.returnError(httpStatus.BAD_REQUEST, 'Gagal mengganti password');
        }
    };

    deleteUser = async(req: Request, id: string) => {
        let t = await sequelize.transaction();
        try {
            let message = 'Data Prodiakon berhasil dihapus';

            const user = await this.userDao.findOneByWhere({ id });

            if (!user) {
                return responseHandler.returnSuccess(httpStatus.NOT_FOUND, responseMessageConstant.USER_404_NOT_FOUND);
            }

            await user.destroy({ transaction: t, decoded: req.userInfo });
            await ProdeaconSchedule.destroy({
                where: { user_id: id },
                transaction: t,
                decoded: req.userInfo
            })
            await t.commit()

            return responseHandler.returnSuccess(httpStatus.OK, message)

        } catch (e) {
            console.log(e);
            t.rollback()
            return responseHandler.returnError(httpStatus.BAD_GATEWAY, responseMessageConstant.HTTP_502_BAD_GATEWAY);
        }
    }

    getDashboardData = async() => {
        try {
            let dashboardData = await User.findAll()

            let activeUser = dashboardData.filter(user => user.active === true).length
            let nonActiveUser = dashboardData.filter(user => user.active !== true).length
            
            let amanUser = dashboardData.filter(user => user.status === 'aman').length
            let usiaUser = dashboardData.filter(user => user.status === 'usia').length
            let tanggaUser = dashboardData.filter(user => user.status === 'tangga').length
            let cutiUser = dashboardData.filter(user => user.status === 'cuti').length
            let almarhumUser = dashboardData.filter(user => user.status === 'almarhum').length
            let pindahUser = dashboardData.filter(user => user.status === 'pindah').length
            let mundurUser = dashboardData.filter(user => user.status === 'mundur').length

            dashboardData = {
                active: activeUser,
                non_active: nonActiveUser,
                detail: [
                    {
                        status: 'Aman',
                        count: amanUser
                    },
                    {
                        status: 'Usia',
                        count: usiaUser
                    },
                    {
                        status: 'Tangga',
                        count: tanggaUser
                    },
                    {
                        status: 'Cuti Panjang',
                        count: cutiUser
                    },
                    {
                        status: 'Almarhum',
                        count: almarhumUser
                    },
                    {
                        status: 'Pindah',
                        count: pindahUser
                    },
                    {
                        status: 'Mundur',
                        count: mundurUser
                    }
                ]
            }

            return responseHandler.returnSuccess(httpStatus.OK, responseMessageConstant.DASHBOARD_200_FETCHED, dashboardData)
        } catch (e) {
            return responseHandler.returnError(httpStatus.BAD_GATEWAY, responseMessageConstant.HTTP_502_BAD_GATEWAY);
        }
    }

    getStatuses = async() => {
        try {
            let items = [{
                id: 'aman',
                title: 'Aman',
                active: true
            },
            {
                id: 'tangga',
                title: 'Tangga',
                active: true
            },
            {
                id: 'usia',
                title: 'Usia',
                active: true
            },
            {
                id: 'cuti',
                title: 'Cuti Panjang',
                active: false
            },
            {
                id: 'almarhum',
                title: 'Almarhum',
                active: false
            },
            {
                id: 'pindah',
                title: 'Pindah',
                active: false
            },
            {
                id: 'mundur',
                title: 'Mengundurkan Diri',
                active: false
            }]
            return responseHandler.returnSuccess(httpStatus.OK, responseMessageConstant.USER_200_STATUS_FETCHED, items)
        } catch (e) {
            console.log(e);
            return responseHandler.returnError(httpStatus.BAD_GATEWAY, responseMessageConstant.HTTP_502_BAD_GATEWAY);
        }
    }

    getCoordinatorTypes = async() => {
        try {
            let items = [{
                id: 'K1',
                title: 'K1'
            },
            {
                id: 'K2',
                title: 'K2'
            },
            {
                id: 'K3',
                title: 'K3'
            }]
            return responseHandler.returnSuccess(httpStatus.OK, responseMessageConstant.USER_200_COORDTYPE_FETCHED, items)
        } catch (e) {
            console.log(e);
            return responseHandler.returnError(httpStatus.BAD_GATEWAY, responseMessageConstant.HTTP_502_BAD_GATEWAY);
        }
    }
}
