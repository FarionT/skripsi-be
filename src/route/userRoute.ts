import { Router } from 'express';
import { auth } from '../middlewares/auth';
import UserController from '../controllers/UserController';
import UserValidator from '../validator/UserValidator';

const router = Router();

const userController = new UserController();
const userValidator = new UserValidator();

router.post('/', auth(), userValidator.userCreateValidator, userController.create);
router.get('/', auth(), userValidator.getAllUsersValidator, userController.list);
router.get('/dashboard', auth(), userController.getDashboardData);
router.get('/:id', auth(), userController.getById);
router.get('/options/status', auth(), userController.getUserStatuses);
router.get('/options/coord-types', auth(), userController.getCoordinatorTypes);
router.put('/:id', auth(), userValidator.updateUserValidator, userController.updateUser)
router.delete('/:id', auth(), userController.deleteUser)


export default router;
