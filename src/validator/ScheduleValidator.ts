/* eslint-disable class-methods-use-this */
import { NextFunction, Request, Response } from 'express';
import httpStatus from 'http-status';
import Joi from 'joi';
import ApiError from '../helper/ApiError';


export default class ScheduleValidator {
    async createMonthlyScheduleValidator(req: Request, res: Response, next: NextFunction) {
        // create schema object
        const schema = Joi.object({
            church_id: Joi.number().required().messages({
                'any.required': 'ID Gereja harus diisi',
                'string.empty': 'ID Gereja harus diisi'
            }),
            month: Joi.number().required().messages({
                'any.required': 'Bulan harus diisi',
                'string.empty': 'Bulan harus diisi'
            }),
            year: Joi.number().required().messages({
                'any.required': 'Tahun harus diisi',
                'string.empty': 'Tahun harus diisi'
            }),
        });

        // schema options
        const options = {
            abortEarly: false, // include all errors
            allowUnknown: true, // ignore unknown props
            stripUnknown: false, // remove unknown props
        };

        // validate request body against schema
        const { error, value } = schema.validate(req.body, options);

        if (error) {
            // on fail return comma separated errors
            const errorMessage = error.details
                .map((details) => {
                    return details.message;
                })
                .join(', ');
            next(new ApiError(httpStatus.BAD_REQUEST, errorMessage));
        } else {
            // on success replace req.body with validated value and trigger next middleware function
            req.body = value;
            return next();
        }
    }

    async createSchedule(req: Request, res: Response, next: NextFunction) {
        // create schema object
        
        const schema = Joi.object({
            church_id: Joi.number().required().messages({
                'any.required': 'ID Gereja harus diisi',
                'string.empty': 'ID Gereja harus diisi'
            }),
            date: Joi.string().required().messages({
                'any.required': 'Tanggal Misa harus diisi',
                'string.empty': 'Tanggal Misa harus diisi'
            }),
            time: Joi.string().required().messages({
                'any.required': 'Jam Misa harus diisi',
                'string.empty': 'Jam Misa harus diisi'
            }),
            mass_name: Joi.string().required().messages({
                'any.required': 'Tipe Misa harus diisi',
                'string.empty': 'Tipe Misa harus diisi'
            }),
            quota: Joi.number().required().messages({
                'any.required': 'Jumlah Prodiakon yang bertugas harus diisi',
                'number.base': 'Jumlah Prodiakon harus berupa angka'
            }),
            prodeacons: Joi.array().items(
                Joi.object({
                    id: Joi.string().required(),
                    mass_coordinator: Joi.boolean().required(),
                })
            ).required(),
        });

        // schema options
        const options = {
            abortEarly: false, // include all errors
            allowUnknown: true, // ignore unknown props
            stripUnknown: false, // remove unknown props
        };

        // validate request body against schema
        const { error, value } = schema.validate(req.body, options);

        if (error) {
            // on fail return comma separated errors
            const errorMessage = error.details
                .map((details) => {
                    return details.message;
                })
                .join(', ');
            next(new ApiError(httpStatus.BAD_REQUEST, errorMessage));
        } else {
            // on success replace req.body with validated value and trigger next middleware function
            req.body = value;
            return next();
        }
    }


    async updateSchedule(req: Request, res: Response, next: NextFunction) {
        // create schema object
        const schema = Joi.object({
            quota: Joi.number().required().messages({
                'any.required': 'Jumlah Prodiakon yang bertugas harus diisi',
                'number.base': 'Jumlah Prodiakon harus berupa angka'
            }),
            prodeacons: Joi.array().items(
                Joi.object({
                    id: Joi.string().required(),
                    mass_coordinator: Joi.boolean().required(),
                })
            ).required(),
        });

        // schema options
        const options = {
            abortEarly: false, // include all errors
            allowUnknown: true, // ignore unknown props
            stripUnknown: false, // remove unknown props
        };

        // validate request body against schema
        const { error, value } = schema.validate(req.body, options);

        if (error) {
            // on fail return comma separated errors
            const errorMessage = error.details
                .map((details) => {
                    return details.message;
                })
                .join(', ');
            next(new ApiError(httpStatus.BAD_REQUEST, errorMessage));
        } else {
            // on success replace req.body with validated value and trigger next middleware function
            req.body = value;
            return next();
        }
    }

    async downloadScheduleValidator(req: Request, res: Response, next: NextFunction) {
        // create schema object
        const schema = Joi.object({
            church_id: Joi.number().required().messages({
                'any.required': 'ID Gereja harus diisi',
                'string.empty': 'ID Gereja harus diisi'
            }),
            month: Joi.number().required().messages({
                'any.required': 'Bulan harus diisi',
                'string.empty': 'Bulan harus diisi'
            }),
            year: Joi.number().required().messages({
                'any.required': 'Tahun harus diisi',
                'string.empty': 'Tahun harus diisi'
            }),
        });

        // schema options
        const options = {
            abortEarly: false, // include all errors
            allowUnknown: true, // ignore unknown props
            stripUnknown: false, // remove unknown props
        };

        // validate request body against schema
        const { error, value } = schema.validate(req.query, options);

        if (error) {
            // on fail return comma separated errors
            const errorMessage = error.details
                .map((details) => {
                    return details.message;
                })
                .join(', ');
            next(new ApiError(httpStatus.BAD_REQUEST, errorMessage));
        } else {
            // on success replace req.body with validated value and trigger next middleware function
            req.body = value;
            return next();
        }
    }
}

