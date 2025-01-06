/* eslint-disable class-methods-use-this */
import { NextFunction, Request, Response } from 'express';
import httpStatus from 'http-status';
import Joi from 'joi';
import ApiError from '../helper/ApiError';


export default class UserValidator {
    async getAllUsersValidator(req: Request, res: Response, next: NextFunction) {
        // create schema object
        const schema = Joi.object({
            pagination: Joi.boolean().optional(),
            page: Joi.number().optional(),
            row: Joi.number().optional(),
            search: Joi.string().optional().allow(null, ''),
            sort_by: Joi.string().optional().allow(null, ''),
            sort_type: Joi.string().optional().allow(null, ''),
            statuses: Joi.string().optional().allow(null, ''),
            churches: Joi.string().optional().allow(null, '')
        });

        // schema options
        const options = {
            abortEarly: false, // include all errors
            allowUnknown: true, // ignore unknown props
            stripUnknown: true, // remove unknown props
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
            req.query = value;
            return next();
        }
    }

    async userCreateValidator(req: Request, res: Response, next: NextFunction) {
        // create schema object
        const schema = Joi.object({
            full_name: Joi.string().required().messages({
                'any.required': 'Nama harus diisi',
                'string.empty': 'Nama harus diisi'
            }),
            nick_name: Joi.string().required().messages({
                'any.required': 'Nickname harus diisi',
                'string.empty': 'Nickname harus diisi'
            }),
            inauguration_year: Joi.string().optional().allow(null, ''),
            email: Joi.string().required().messages({
                'any.required': 'Email harus diisi',
                'string.empty': 'Email harus diisi'
            }),
            active: Joi.boolean().required().messages({
                'any.required': 'Status harus diisi',
                'string.empty': 'Status harus diisi'
            }),
            address: Joi.string().optional().allow(null, ''),
            phone_number: Joi.string().optional().allow(null, ''),
            dob: Joi.string().required().messages({
                'any.required': 'Tanggal Lahir harus diisi',
                'string.empty': 'Tanggal Lahir harus diisi'
            }),
            birthplace: Joi.string().optional().allow(null, ''),
            province: Joi.string().optional().allow(null, ''),
            city: Joi.string().optional().allow(null, ''),
            district: Joi.string().optional().allow(null, ''),
            sub_district: Joi.string().optional().allow(null, ''),
            zipcode: Joi.string().optional().allow(null, ''),
            status: Joi.string().optional(),
            mass_coordination_flag: Joi.boolean().optional(),
            mass_coordination_type: Joi.string().optional().allow(null, ''),
            preferential_schedules: Joi.array().items(Joi.number()).required(),
            user_registration_number: Joi.number().required().messages({
                'any.required': 'Nomor Registrasi harus diisi',
                'number.empty': 'Nomor Registrasi harus diisi'
            }),
        });

        // schema options
        const options = {
            abortEarly: false, // include all errors
            allowUnknown: true, // ignore unknown props
            stripUnknown: true, // remove unknown props
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

    async resetPasswordValidator(req: Request, res: Response, next: NextFunction) {
        // create schema object
        const schema = Joi.object({
            new_password: Joi.string().optional().allow(null, '')
        });

        // schema options
        const options = {
            abortEarly: false, // include all errors
            allowUnknown: true, // ignore unknown props
            stripUnknown: true, // remove unknown props
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

    async updateUserValidator(req: Request, res: Response, next: NextFunction) {
        // create schema object
        const schema = Joi.object({
            full_name: Joi.string().required().messages({
                'any.required': 'Nama harus diisi',
                'string.empty': 'Nama harus diisi'
            }),
            nick_name: Joi.string().required().messages({
                'any.required': 'Nickname harus diisi',
                'string.empty': 'Nickname harus diisi'
            }),
            inauguration_year: Joi.string().optional().allow(null, ''),
            email: Joi.string().required().messages({
                'any.required': 'Email harus diisi',
                'string.empty': 'Email harus diisi'
            }),
            active: Joi.boolean().required().messages({
                'any.required': 'Status harus diisi',
                'string.empty': 'Status harus diisi'
            }),
            address: Joi.string().optional().allow(null, ''),
            phone_number: Joi.string().optional().allow(null, ''),
            dob: Joi.string().required().messages({
                'any.required': 'Tanggal Lahir harus diisi',
                'string.empty': 'Tanggal Lahir harus diisi'
            }),
            birthplace: Joi.string().optional().allow(null, ''),
            province: Joi.string().optional().allow(null, ''),
            city: Joi.string().optional().allow(null, ''),
            district: Joi.string().optional().allow(null, ''),
            sub_district: Joi.string().optional().allow(null, ''),
            zipcode: Joi.string().optional().allow(null, ''),
            status: Joi.string().optional(),
            mass_coordination_flag: Joi.boolean().optional(),
            mass_coordination_type: Joi.string().optional().allow(null, ''),
            preferential_schedules: Joi.array().items(Joi.number()).required(),
            user_registration_number: Joi.number().required().messages({
                'any.required': 'Nomor Registrasi harus diisi',
                'number.empty': 'Nomor Registrasi harus diisi'
            }),
        });

        // schema options
        const options = {
            abortEarly: false, // include all errors
            allowUnknown: true, // ignore unknown props
            stripUnknown: true, // remove unknown props
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

    async userLoginValidator(req: Request, res: Response, next: NextFunction) {
        // create schema object
        const schema = Joi.object({
            email: Joi.string()
                .email()
                .required()
                .messages({
                    'string.email': 'Invalid email format',
                    'any.required': 'Email harus diisi'
                }),
            password: Joi.string()
                .required()
        });

        // schema options
        const options = {
            abortEarly: false, // include all errors
            allowUnknown: true, // ignore unknown props
            stripUnknown: true, // remove unknown props
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

    async checkEmailValidator(req: Request, res: Response, next: NextFunction) {
        // create schema object
        const schema = Joi.object({
            email: Joi.string().email().required(),
        });

        // schema options
        const options = {
            abortEarly: false, // include all errors
            allowUnknown: true, // ignore unknown props
            stripUnknown: true, // remove unknown props
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

    async changePasswordValidator(req: Request, res: Response, next: NextFunction) {
        // create schema object
        const schema = Joi.object({
            old_password: Joi.string().required(),
            password: Joi.string()
                .pattern(/^[0-9a-zA-Z]{6,}$/)
                .required()
                .messages({
                    'any.required': 'Password harus diisi',
                    'string.empty': 'Password harus diisi',
                    'string.pattern.base': 'Password minimal 6 karakter dan hanya boleh mengandung huruf dan angka.'
                }),
            confirm_password: Joi.string().required(),
        });

        // schema options
        const options = {
            abortEarly: false, // include all errors
            allowUnknown: true, // ignore unknown props
            stripUnknown: true, // remove unknown props
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
}

