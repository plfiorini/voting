import { MongoClient, Collection, Db, ReturnDocument } from 'mongodb';
import Database from './database';
import config from '../config';
import { Poll } from '../polls/poll.model';
import BadRequestError from '../errors/badrequest';
import NotFoundError from '../errors/notfound';

class MongoDBDatabase implements Database {
    private readonly client: MongoClient;
    private readonly databaseName: string = config.database.name;
    private readonly tableName: string = config.database.table;
    private connectionOpen: boolean = false;
    private db?: Db;
    private collection?: Collection;

    constructor() {
        console.info(`Connecting to MongoDB database at ${config.mongodb_url}...`);
        this.client = new MongoClient(config.mongodb_url);
    }

    destructor() {
        this.disconnect();
    }

    async connect(): Promise<void> {
        await this.client.connect();
        this.connectionOpen = true;
        this.db = this.client.db(this.databaseName);
        this.collection = this.db.collection(this.tableName);
        await this.collection.createIndex({ id: 1 }, { unique: true });
    }

    async disconnect(): Promise<void> {
        await this.client.close();
        this.connectionOpen = false;
        this.db = undefined;
        this.collection = undefined;
    }

    isConnnected(): boolean {
        return this.connectionOpen;
    }

    async createTableIfExists(): Promise<void> {
        throw new Error('Method not implemented');
    }

    async createTable(): Promise<void> {
        throw new Error('Method not implemented');
    }

    async listPolls(): Promise<Poll[] | undefined> {
        try {
            const polls = (await this.collection?.find({}).toArray()) as unknown as Poll[];
            return polls;
        } catch (error: unknown) {
            console.trace(error);
            if (error instanceof Error) {
                throw new BadRequestError(`Failed to list polls: ${error.message}`);
            }
        }
    }

    async createPoll(poll: Poll): Promise<Poll | undefined> {
        poll.votes = {};
        poll.options.forEach((option) => {
            poll.votes![option] = 0;
        });

        try {
            const result = await this.collection?.insertOne(poll);
            return result ? poll : undefined;
        } catch (error: unknown) {
            if (error instanceof Error) {
                console.trace(error);
                throw new BadRequestError(`Failed to create poll: ${error.message}`);
            }
        }
    }

    async getPollById(id: string): Promise<Poll | undefined> {
        try {
            const poll = (await this.collection?.findOne({ id: id })) as unknown as Poll;
            if (poll) {
                return poll;
            } else {
                throw new NotFoundError(`No poll with id ${id} found`);
            }
        } catch (error: unknown) {
            if (error instanceof NotFoundError) {
                throw error;
            } else if (error instanceof Error) {
                console.trace(error);
                throw new BadRequestError(`Failed to get poll with id ${id}: ${error.message}`);
            }
        }
    }

    async updatePoll(poll: Poll): Promise<Poll | undefined> {
        poll.votes = {};
        poll.options.forEach((option) => {
            poll.votes![option] = 0;
        });

        try {
            const filter = { id: poll.id };
            const update = { $set: { question: poll.question, options: poll.options, votes: poll.votes } };
            const options = { upsert: false, returnDocument: ReturnDocument.AFTER };
            const result = await this.collection?.findOneAndUpdate(filter, update, options);
            return result ? result.value as unknown as Poll : undefined;
        } catch (error: unknown) {
            if (error instanceof Error) {
                console.trace(error);
                throw new BadRequestError(`Failed to update poll with id ${poll.id}: ${error.message}`);
            }
        }
    }

    async deletePollById(id: string): Promise<void> {
        try {
            const result = await this.collection?.deleteOne({ id: id });
            if (result && result.deletedCount > 0) {
                return;
            } else if (!result) {
                throw new BadRequestError(`Failed to delete poll with id ${id}`);
            } else if (result.deletedCount === 0) {
                throw new NotFoundError(`No poll with id ${id} found`);
            }
        } catch (error: unknown) {
            if (error instanceof BadRequestError) {
                throw error;
            } else if (error instanceof Error) {
                console.trace(error);
                throw new BadRequestError(`Failed to delete poll with id ${id}: ${error.message}`);
            }
        }
    }
}

export default MongoDBDatabase;
