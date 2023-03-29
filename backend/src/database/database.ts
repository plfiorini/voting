import Poll from '../polls/poll.model';

interface Database {
    connect(): Promise<void>;
    disconnect(): Promise<void>;

    isConnnected(): boolean;

    createTableIfExists(): Promise<void>;
    createTable(): Promise<void>;

    listPolls(): Promise<Poll[] | undefined>;
    createPoll(poll: Poll): Promise<Poll | undefined>;
    getPollById(id: string): Promise<Poll | undefined>;
    updatePoll(poll: Poll): Promise<Poll | undefined>;
    deletePollById(id: string): Promise<void>;
}

export default Database;
