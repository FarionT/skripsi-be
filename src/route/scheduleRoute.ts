import { Router } from 'express';
import { auth, adminAuth } from '../middlewares/auth';
import ScheduleController from '../controllers/ScheduleController';
import ScheduleValidator from '../validator/ScheduleValidator';

const router = Router();

const scheduleController = new ScheduleController();
const scheduleValidator = new ScheduleValidator();

router.use(auth())
router.get('/user/:id', scheduleController.getScheduleByUserId)
router.get('/monthly', adminAuth(), scheduleController.listMonthlySchedules)
router.post('/monthly', adminAuth(), scheduleValidator.createMonthlyScheduleValidator, scheduleController.createMonthlySchedule)
router.get('/download', adminAuth(), scheduleValidator.downloadScheduleValidator, scheduleController.downloadExcel);
router.get('/:id', scheduleController.getScheduleById)
router.get('/', adminAuth(), scheduleController.listSchedules);
router.post('/', adminAuth(), scheduleValidator.createSchedule, scheduleController.createSchedule);
router.put('/:id', adminAuth(), scheduleValidator.updateSchedule, scheduleController.updateSchedule)
router.delete('/:id', adminAuth(), scheduleController.deleteSchedule)

export default router;
