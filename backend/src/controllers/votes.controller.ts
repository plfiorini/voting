import { Request, Response } from 'express';
import { saveVote } from '../services/votes.service';

export const vote = async (req: Request, res: Response) => {
    const vote = req.body.vote;

    // Get or create voter ID from cookie
    let voterId = req.cookies.voter_id;
    if (!voterId) {
        // Generate random ID
        voterId = Math.random().toString(36).substr(2, 9);

        // Save voter ID in cookie
        res.cookie('voter_id', voterId);
    }

    // Save vote
    try {
        await saveVote(voterId, vote);
        res.status(200).json({ message: 'Vote received!' });
    } catch (err) {
        console.error('Error saving vote', err);
        res.status(500).json({ message: 'Error saving vote' });
    }
};
