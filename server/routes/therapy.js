import express from 'express';
import {
  scheduleTherapy,
  getReadyTherapies,
  getWaitingTherapies,
  moveToWaitingQueue,
  rescheduleTherapies
} from '../controllers/therapyController.js';

const router = express.Router();


router.post('/schedule', scheduleTherapy);

router.get('/ready', getReadyTherapies);

router.get('/waiting', getWaitingTherapies);


router.patch('/cancel/:id', moveToWaitingQueue);


router.post('/reschedule', rescheduleTherapies);

export default router;
