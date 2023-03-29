import { Poll } from '../poll.model';

interface Writer {
    connect(): Promise<void>;
    disconnect(): Promise<void>;

    isConnnected(): boolean;

    castVote(pollId: string, option: string): Promise<Poll | undefined>;
}

export default Writer;
