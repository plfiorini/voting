import express from 'express';
import { PollController } from '../controllers/poll';

const pollRouter = express.Router();
const pollController = new PollController();

pollRouter.get('/', pollController.listPolls);
pollRouter.post('/', pollController.createPoll);
pollRouter.get('/:id', pollController.getPoll);
pollRouter.put('/:id', pollController.updatePoll);
pollRouter.delete('/:id', pollController.deletePoll);
pollRouter.delete('/', pollController.deleteAllPolls);

export { pollRouter };
