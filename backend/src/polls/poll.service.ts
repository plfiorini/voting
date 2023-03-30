import config, { DatabaseBackendType } from '../config';
import Database from '../database/database';
import DynamoDBDatabase from '../database/dynamodb.backend';
import MongoDBDatabase from '../database/mongodb.backend';
import { Poll } from './poll.model';

class PollService {
    private readonly database: Database;

    constructor() {
        switch (config.database.backend) {
            case DatabaseBackendType.AWS:
            default:
                this.database = new DynamoDBDatabase();
                break;
            case DatabaseBackendType.MONGODB:
                this.database = new MongoDBDatabase();
                break;
        }
    }

    async connect(): Promise<void> {
        if (this.database) {
            if (this.database.isConnnected() === false) {
                await this.database.connect();
            }
        }
    }

    async disconnect(): Promise<void> {
        if (this.database) {
            if (this.database.isConnnected() === true) {
                await this.database.disconnect();
            }
        }
    }

    async listPolls(): Promise<Poll[] | undefined> {
        return await this.database.listPolls();
    }

    async createPoll(poll: Poll): Promise<Poll | undefined> {
        return await this.database.createPoll(poll);
    }

    async getPollById(id: string): Promise<Poll | null | undefined> {
        return await this.database.getPollById(id);
    }

    async updatePoll(poll: Poll): Promise<Poll | undefined> {
        return await this.database.updatePoll(poll);
    }

    async deletePollById(id: string): Promise<void> {
        return await this.database.deletePollById(id);
    }

    async deleteAllPolls(): Promise<void> {
        this.listPolls().then((polls) => {
            if (polls) {
                polls.forEach((poll) => {
                    this.deletePollById(poll.id);
                });
            }
        });
    }
}

export default PollService;
