import { Request, response } from "express";
import httpStatus from "http-status";
import { uuid } from "uuidv4";
import responseHandler from "../../helper/responseHandler";
import IChurch from "../../models/interfaces/IChurch"; 
import IChurchService from "../contracts/IChurchService";
import { responseMessageConstant } from "../../config/constant";
import db, { sequelize } from '../../models';
import ChurchDao from "../../dao/implementations/ChurchDao";
import { Op } from "sequelize";
import { ParamsDictionary } from "express-serve-static-core";
import { ParsedQs } from "qs";
import { ApiServiceResponse } from "../../@types/apiServiceResponse";
import { group } from "console";

const { church: Church, church_schedule: ChurchSchedule, user: User } = db;


export default class ChurchService implements IChurchService {
    private churchDao: ChurchDao;

    constructor(){
        this.churchDao = new ChurchDao()
    }

    create = async (churchBody: IChurch) => {
        try {
            const isExist = await Church.count({ where: { name: churchBody.name } });
            let churchData: any
            let churchMassData: any
            let churchMassSchedule: any

            if (isExist){
                return responseHandler.returnError(httpStatus.BAD_REQUEST, responseMessageConstant.CHURCH_CODE_400_TAKEN);
            }

            // const {day, time, quota} = churchBody

            // if(day && time && quota){
            //   churchMassSchedule = day.map((x,idx)=>{
            //     // const [hourStr, minuteStr] = time[idx].split(".");

            //     // // Convert to integers
            //     // const hour = parseInt(hourStr, 10);
            //     // const minute = parseInt(minuteStr, 10);

            //     // const date = new Date(2000, 0, 1, hour, minute);
            //     // const formattedTime = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;

            //     return {
            //       day: x,
            //       time: time[idx],
            //       quota: quota[idx],
            //     }
            //   })
            // }

            // churchBody = {
            //   ...churchBody,
            //   mass_schedule: churchMassSchedule
            // }

            await sequelize.transaction(async (t) =>{
                try {
                    churchData = await Church.create(churchBody, {
                        transaction: t,
                        include: ['mass_schedule']
                    })
                    
                } catch (e) {
                    throw e
                }
            }) 

            churchData = churchData.toJSON();

            return responseHandler.returnSuccess(httpStatus.CREATED, responseMessageConstant.CHURCH_201_CREATED, churchData);
        } catch (e) {
            console.log(e)
            return responseHandler.returnError(httpStatus.BAD_GATEWAY, responseMessageConstant.HTTP_502_BAD_GATEWAY);
        }
    }

    getById = async(id: string) =>{
        try {
            const isExist = await Church.count({ where: { id } });

            if (!isExist){
                return responseHandler.returnError(httpStatus.NOT_FOUND, responseMessageConstant.CHURCH_404_NOT_FOUND)
            }

            let churchData = await Church.findOne({ 
                where: { id },
                attributes:{
                    exclude: ['deleted_at']
                },
                include: [ 
                    {
                        model: ChurchSchedule,
                        as: 'mass_schedule',
                        attributes: {
                            exclude: ['created_at', 'updated_at', 'deleted_at']
                        }
                    }
                ],
            })

            let dayOrder = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu']

            churchData = churchData.toJSON()
            let mass_schedule = churchData.mass_schedule

            mass_schedule = mass_schedule.sort((a: any, b: any) => {
                const dayA = dayOrder.indexOf(a.day) // Index of day A in the order
                const dayB = dayOrder.indexOf(b.day) // Index of day B in the order
      
                if (dayA !== dayB) {
                  return dayA - dayB; // Sort by day order
                } else {
                  return a.time.localeCompare(b.time); // Sort by time
                }
            });

            churchData.mass_schedule = mass_schedule

            return responseHandler.returnSuccess(httpStatus.OK, responseMessageConstant.CHURCH_200_FETCHED_SINGLE, churchData)
        } catch (e) {
            console.log(e);
            return responseHandler.returnError(httpStatus.BAD_GATEWAY, responseMessageConstant.HTTP_502_BAD_GATEWAY);
        }
    }

    list = async (req: Request) => {
        try {
            const pagination = req.query.pagination;
            let options = { 
                attributes:{
                    exclude: ['deleted_at']
                },
                include: [ 
                    {
                        model: ChurchSchedule,
                        as: 'mass_schedule',
                        attributes: {
                            exclude: ['created_at', 'updated_at', 'deleted_at']
                        }
                    }
                ],
                order: [
                    ['id', 'ASC']
                ],
                distinct: true
            };

            if (pagination == 'true') {
                const row: any = req.query.row;
                const page: any = req.query.page;
                const offset = (page - 1) * row;
                options['offset'] = offset;
                options['limit'] = row;
            }
            const allData = await Church.findAndCountAll(options)
            return responseHandler.returnSuccess(httpStatus.OK, responseMessageConstant.CHURCH_200_FETCHED_ALL, allData)
        } catch (e) {
            console.log(e);
            return responseHandler.returnError(httpStatus.BAD_GATEWAY, responseMessageConstant.HTTP_502_BAD_GATEWAY);
        }
    }

    listSchedules = async (req: Request) => {
        try {
            let options = { 
                attributes:{
                    exclude: ['created_at', 'updated_at', 'deleted_at']
                },
                order: [
                    ['created_at', 'DESC']
                ],
            };

            const allData = await ChurchSchedule.findAll(options)
            return responseHandler.returnSuccess(httpStatus.OK, responseMessageConstant.CHURCH_SCHEDULE_200_FETCHED_ALL, allData)
        } catch (e) {
            console.log(e);
            return responseHandler.returnError(httpStatus.BAD_GATEWAY, responseMessageConstant.HTTP_502_BAD_GATEWAY);
        }
    }

    updateChurch = async(req: Request, id: string) => {
        let t = await sequelize.transaction()
        try {
            let message = 'Perubahan data gereja berhasil disimpan';
            if (req.userInfo === undefined) {
                return responseHandler.returnError(httpStatus.UNAUTHORIZED, 'Please Authenticate!');
            }

            let church = await this.churchDao.findOneByWhere({ id });

            if (!church) {
                return responseHandler.returnError(httpStatus.NOT_FOUND, 'Gereja tidak ditemukan');
            }

            const { address, province, city, district, sub_district, zipcode, mass_schedule } = req.body;

            let allSchedule = await ChurchSchedule.findAll({
                where: { church_id: id }
            })

            // To do the CRUD in the church schedule
            for (let i = 0; i < mass_schedule.length; i++) {
                // To find the same schedule inside the database
                let schedule = allSchedule.find((item) => item.id === mass_schedule[i].id)

                // To find the same schedule that has the same day, same time, and same church
                let existingSchedule = allSchedule.find((item) => item.day === mass_schedule[i].day && 
                                                                item.time === mass_schedule[i].time && 
                                                                item.church_id === mass_schedule[i].church_id)

                // If the schedule has already exist
                if(schedule) {
                    // If the current schedule is deleted
                    if (mass_schedule[i].is_deleted) {
                        await schedule.destroy({ transaction: t })
                    } else {
                        // To check whether the current schedule has the same conditions as the existing schedule
                        if (existingSchedule) {
                            if (schedule.id !== existingSchedule.id) {
                                throw {
                                    ec: httpStatus.BAD_REQUEST,
                                    msg: `Jadwal pada hari ${mass_schedule[i].day} jam ${mass_schedule[i].time} sudah ada`,
                                }
                            }
                        }
                        await schedule.update(mass_schedule[i], { transaction: t })
                    }
                } else {
                    if (!mass_schedule[i].is_deleted) {
                        // To check whether schedule with the day, time, and church_id has existed
                        if (existingSchedule) {
                            throw {
                                ec: httpStatus.BAD_REQUEST,
                                msg: `Jadwal pada hari ${mass_schedule[i].day} jam ${mass_schedule[i].time} sudah ada`,
                            }
                        }
                        let newSchedule = await ChurchSchedule.create(mass_schedule[i], { transaction: t })
                        let user = await User.findAll()
                        for (let j = 0; j < user.length; j++) {
                            let updatedPreferentialSchedule = [ ...user[j].preferential_schedules, newSchedule.id ]
                            await User.update(
                                { preferential_schedules: updatedPreferentialSchedule },
                                { where: { id: user[j].id }, transaction: t }
                            )
                        }
                    }
                }
            }

            // return responseHandler.returnError(httpStatus.NOT_FOUND, 'Test gagal');
            const updateChurch = await church.update(
                {
                    address: address,
                    province: province,
                    city: city,
                    district: district,
                    sub_district: sub_district,
                    zipcode: zipcode
                },
                { id: church.id },
                { transaction: t }
            );

            if (updateChurch) {
                t.commit()

                return responseHandler.returnSuccess(
                    httpStatus.OK,
                    message,
                    {}
                );
            }

            t.rollback()

            return responseHandler.returnError(httpStatus.BAD_REQUEST, 'Gagal mengedit gereja');
        } catch (e: any) {
            console.log(e)
            t.rollback()
            if (e.ec) {
                return responseHandler.returnError(e.ec, e.msg)
            }
            return responseHandler.returnError(httpStatus.BAD_GATEWAY, responseMessageConstant.HTTP_502_BAD_GATEWAY)
        }
    }

    deleteChurch = async (req: Request, id: string) => {
        let t = await sequelize.transaction()
        try {
            let message = 'Gereja berhasil dihapus'

            if (req.userInfo === undefined) {
                return responseHandler.returnError(httpStatus.UNAUTHORIZED, 'Please Authenticate!');
            }

            let church = await this.churchDao.findOneByWhere({ id });
            
            if(!church) {
                return responseHandler.returnError(httpStatus.NOT_FOUND, 'Gereja tidak ditemukan');
            }

            await church.destroy({ transaction: t, decoded: req.userInfo });
            await t.commit()

            return responseHandler.returnSuccess(httpStatus.OK, 'Berhasil menghapus gereja')
        } catch (e) {
            console.log(e)
            await t.rollback()
            return responseHandler.returnError(httpStatus.BAD_GATEWAY, responseMessageConstant.HTTP_502_BAD_GATEWAY)
        }
    }


    // updateProduct = async (productBody: IChurch, id: string) => {
    //     try {
    //         const isProductExist = await Product.findOne({ where: { id } });
    //         const isProductCodeExist = await Product.count({ where: { 
    //             [Op.not]: 
    //                 { id },
    //                 code: productBody.code 
    //         }});


    //         if (!isProductExist){
    //             return responseHandler.returnError(httpStatus.NOT_FOUND, responseMessageConstant.PRODUCT_404_NOT_FOUND);
    //         }

    //         if (isProductCodeExist) { 
    //             return responseHandler.returnError(httpStatus.BAD_REQUEST, responseMessageConstant.PRODUCT_CODE_400_TAKEN);
    //         }

    //         await sequelize.transaction(async (t) =>{
    //             try {
    //                 await isProductExist.update(productBody,  {
    //                     transaction: t
    //                 })  
    //             } catch (e) {
    //                 throw e
    //             }
    //         })

    //         const productData = await Product.findOne({ 
    //             where: { id },
    //             attributes:{
    //                 exclude: ['deleted_at']
    //             },
    //             individualHooks: true,
    //         })

    //         return responseHandler.returnSuccess(httpStatus.OK, responseMessageConstant.PRODUCT_200_UPDATED, productData);

    //     } catch (e) {
    //         console.log(e);
    //         return responseHandler.returnError(httpStatus.BAD_GATEWAY, responseMessageConstant.HTTP_502_BAD_GATEWAY);
    //     }
    // }

    // deleteProduct = async (id: string) => {
    //     try {
    //         const isProductExist = await Product.findOne({ where: { id } })
    //         if (!isProductExist){
    //             return responseHandler.returnError(httpStatus.NOT_FOUND, responseMessageConstant.PRODUCT_404_NOT_FOUND);
    //         }

    //         await sequelize.transaction(async (t) => {
    //             try {
    //                 await isProductExist.destroy({ 
    //                     transaction: t 
    //                 });
    //             } catch (e) {
    //                 throw e
    //             }
    //         })
            
    //         return responseHandler.returnSuccess(httpStatus.OK, responseMessageConstant.PRODUCT_200_DELETED);
    //     } catch (e) {
    //         console.log(e);
    //         return responseHandler.returnError(httpStatus.BAD_GATEWAY, responseMessageConstant.HTTP_502_BAD_GATEWAY);
    //     }
    // }
}