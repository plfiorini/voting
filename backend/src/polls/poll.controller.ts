import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import Controller from '../controller';
import PollService from './poll.service';
import { Poll } from './poll.model';
import VoteService from './vote';
import BadRequestError from '../errors/badrequest';

class PollsController extends Controller {
    public path = '/polls';
    private readonly pollService = new PollService();
    private readonly voteService = new VoteService();

    constructor() {
        super();
        this.initializeRoutes();

        this.pollService.connect();
        this.voteService.connect();
    }

    destructor() {
        this.voteService.disconnect();
        this.pollService.disconnect();
    }

    private initializeRoutes() {
        this.router.get('/', this.listPolls.bind(this));
        this.router.post('/', this.createPoll.bind(this));
        this.router.get('/:id', this.getPoll.bind(this));
        this.router.put('/:id', this.updatePoll.bind(this));
        this.router.delete('/:id', this.deletePoll.bind(this));
        this.router.delete('/', this.deleteAllPolls.bind(this));
        this.router.post('/:id/vote', this.vote.bind(this));
    }

    async listPolls(req: express.Request, res: express.Response, next: express.NextFunction) {
        try {
            const polls = await this.pollService.listPolls();
            res.json(polls);
        } catch (error) {
            next(error);
        }
    }

    async createPoll(req: express.Request, res: express.Response, next: express.NextFunction) {
        try {
            const id = uuidv4();
            const { question, options } = req.body as { question: string; options: string[] };
            const poll = await this.pollService.createPoll({ id, question, options } as Poll);
            res.json(poll);
        } catch (error) {
            next(error);
        }
    }

    async getPoll(req: express.Request, res: express.Response, next: express.NextFunction) {
        try {
            const id = req.params.id;
            const poll = await this.pollService.getPollById(id);
            if (!poll) {
                res.status(404).json({ message: `Poll ${id} not found` });
            } else {
                res.json(poll);
            }
        } catch (error) {
            next(error);
        }
    }

    async updatePoll(req: express.Request, res: express.Response, next: express.NextFunction) {
        try {
            const id = req.params.id;
            const { question, options } = req.body as { question: string; options: string[] };
            const poll = await this.pollService.updatePoll({ id, question, options } as Poll);
            res.json(poll);
        } catch (error) {
            next(error);
        }
    }

    async deletePoll(req: express.Request, res: express.Response, next: express.NextFunction) {
        try {
            const id = req.params.id;
            await this.pollService.deletePollById(id);
            res.json({ message: `Poll ${id} deleted` });
        } catch (error) {
            next(error);
        }
    }

    async deleteAllPolls(req: express.Request, res: express.Response, next: express.NextFunction) {
        try {
            await this.pollService.deleteAllPolls();
            res.json({ message: `All polls deleted` });
        } catch (error) {
            next(error);
        }
    }

    async vote(req: express.Request, res: express.Response) {
        const id = req.params.id;
        const { option } = req.body as { option: string };
        if (option === undefined) {
            throw new BadRequestError('Missing option');
        } else {
            this.voteService.saveVote(id, option);
            res.json({ message: `Vote for poll ${id} queued` });
        }
    }
}

export default PollsController;
