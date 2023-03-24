import { Request, Response } from 'express';

export const vote = (req: Request, res: Response) => {
    const vote = req.body.vote;
    console.log(`Received vote: ${vote}`);
    res.status(200).json({ message: 'Vote received!' });
};
