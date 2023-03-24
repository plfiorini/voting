import { Request, Response } from 'express';
import { saveVote } from '../services/votes.service';

export const vote = async (req: Request, res: Response) => {
    const vote = req.body.vote;

    // Get or create voter ID from cookie
    let voterId = req.cookies.voter_id;
    if (!voterId) {
        voterId = Math.random().toString(36).substr(2, 9); // Generate random ID
        res.cookie('voter_id', voterId); // Save voter ID in cookie
    }

    // Save vote
    try {
        await saveVote(voterId, vote);
        res.status(200).json({ message: 'Vote received!' });
    } catch (err) {
        console.error('Error saving vote', err);
        res.status(500).send('Error saving vote');
    }
};
