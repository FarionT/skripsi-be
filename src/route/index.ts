import { Router } from 'express';
import authRoute from './authRoute';
import churchRoute from './churchRoute';
import userRoute from './userRoute'
import scheduleRoute from './scheduleRoute'

const router = Router();

const defaultRoutes = [
    {
        path: '/auth',
        route: authRoute,
    },
    {
        path: '/churches',
        route: churchRoute,
    },
    {
        path: '/users',
        route: userRoute
    },
    {
        path: '/schedules',
        route: scheduleRoute
    }
];

defaultRoutes.forEach((route) => {
    router.use(route.path, route.route);
});

export default router;
