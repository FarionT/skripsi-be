import { NextFunction, Request, Response } from 'express';
import passport from 'passport';
import httpStatus from 'http-status';
import ApiError from '../helper/ApiError';
import { IUser } from '../models/interfaces/IUser';
import db from '../models';
// import { jwtVerifyManually } from '../config/passport';

const { role: Role } = db;

const verifyCallback =
    (req: Request, res: Response, resolve: any, reject: any) =>
    // eslint-disable-next-line consistent-return
    async (err: any, user: IUser, info: any) => {
        if (err || info || !user) {
            return reject(new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate'));
        }

        req.userInfo = user;

        resolve();
    };

export const auth = () => async (req: Request, res: Response, next: NextFunction) => {
    new Promise((resolve, reject) => {
        passport.authenticate('jwt', { session: false }, verifyCallback(req, res, resolve, reject))(
            req,
            res,
            next
        );
    })
        .then(() => next())
        .catch((err) => {
            next(err);
        });
};

export const adminAuth = () => async (req: Request, res: Response, next: NextFunction) => {
    try {
        let roles = await Role.findOne({ 
            where: { id: req.userInfo?.role_id } 
        })

        if(!roles) {
            return next(new ApiError(httpStatus.FORBIDDEN, 'You Are Not Authorized!'));
        }

        if (roles.level === 0 || roles.level === 1) {
            return next()
        }

        return next(new ApiError(httpStatus.FORBIDDEN, 'You Are Not Authorized!'));

    } catch (e) {
        return next(e)
    }
    
}

// export const authByManuallVerify =
//     () => async (req: Request, res: Response, next: NextFunction) => {
//         new Promise((resolve, reject) => {
//             jwtVerifyManually(req, verifyCallback(req, res, resolve, reject));
//         })
//             .then(() => next())
//             .catch((err) => {
//                 next(err);
//             });
//     };
