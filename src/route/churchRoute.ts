import { Router } from 'express';
import { auth, adminAuth } from '../middlewares/auth';
import ChurchController from '../controllers/ChurchController';
import ChurchValidator from '../validator/ChurchValidator';

const router = Router();

const churchController = new ChurchController();
const churchValidator = new ChurchValidator();

router.use(auth(), adminAuth())
router.get('/', churchController.listChurches);
router.post('/', churchValidator.createChurch, churchController.createChurch);
router.get('/schedules', churchController.getChurchSchedules);
router.get('/:id', churchController.getById);
router.put('/:id', churchValidator.updateChurch, churchController.updateChurch)
router.delete('/:id', churchController.deleteChurch)

export default router;
