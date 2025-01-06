/* eslint-disable class-methods-use-this */
import { NextFunction, Request, Response } from 'express';
import httpStatus from 'http-status';
import Joi from 'joi';
import ApiError from '../helper/ApiError';


export default class ChurchValidator {
    async createChurch(req: Request, res: Response, next: NextFunction) {
        // create schema object
        
        const schema = Joi.object({
            name: Joi.string().required().messages({
                'any.required': 'Nama gereja harus diisi',
                'string.empty': 'Nama gereja harus diisi'
            }),
            province: Joi.string().required().messages({
                'any.required': 'Provinsi harus diisi',
                'string.empty': 'Provinsi harus diisi'
            }),
            city: Joi.string().required().messages({
                'any.required': 'Kota harus diisi',
                'string.empty': 'Kota harus diisi'
            }),
            district: Joi.string().required().messages({
                'any.required': 'Kecamatan harus diisi',
                'string.empty': 'Kecamatan harus diisi'
            }),
            sub_district: Joi.string().required().messages({
                'any.required': 'Kelurahan harus diisi',
                'string.empty': 'Kelurahan harus diisi'
            }),
            parish: Joi.string().required().messages({
                'any.required': 'Paroki harus diisi',
                'string.empty': 'Paroki harus diisi'
            }),
            zipcode: Joi.string().required().messages({
                'any.required': 'Kode pos harus diisi',
                'string.empty': 'Kode pos harus diisi'
            }),
            address: Joi.string().required().messages({
                'any.required': 'Detail alamat harus diisi',
                'string.empty': 'Detail alamat harus diisi'
            }),
            slug: Joi.string().required().messages({
                'any.required': 'Slug harus diisi',
                'string.empty': 'Slug harus diisi'
            }),
            mass_schedule: Joi.array().items(
                Joi.object({
                    day: Joi.string().required(),
                    time: Joi.string().required(),
                    quota: Joi.number().required(),
                    min_mass_coordination_type: Joi.string().required(),
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


    async updateChurch(req: Request, res: Response, next: NextFunction) {
        // create schema object
        const schema = Joi.object({
            address: Joi.string().required().messages({
                'any.required': 'Detail Alamat harus diisi',
                'string.empty': 'Detail Alamat harus diisi'
            }),
            province: Joi.string().required().messages({
                'any.required': 'Provinsi harus diisi',
                'string.empty': 'Provinsi harus diisi'
            }),
            city: Joi.string().required().messages({
                'any.required': 'Kota/Kabupaten harus diisi',
                'string.empty': 'Kota/Kabupaten harus diisi'
            }),
            district: Joi.string().required().messages({
                'any.required': 'Kecamatan harus diisi',
                'string.empty': 'Kecamatan harus diisi'
            }),
            sub_district: Joi.string().required().messages({
                'any.required': 'Kelurahan harus diisi',
                'string.empty': 'Kelurahan harus diisi'
            }),
            zipcode: Joi.string().required().messages({
                'any.required': 'Kode Pos harus diisi',
                'string.empty': 'Kode Pos harus diisi'
            }),
            mass_schedule: Joi.array().items(
                Joi.object({
                    id: Joi.number().allow(null).optional(),
                    church_id: Joi.number().required(),
                    day: Joi.string().required(),
                    time: Joi.string().required(),
                    quota: Joi.number().required(),
                    min_mass_coordination_type: Joi.string().required(),
                    is_deleted: Joi.boolean().required()
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

}

