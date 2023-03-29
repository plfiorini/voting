import { MongoClient, Collection, Db } from 'mongodb';
import Writer from './writer';
import config from '../config';
import { Poll } from '../poll.model';

class MongoDBWriter implements Writer {
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

    async castVote(pollId: string, option: string): Promise<Poll | undefined> {
        if (!this.connectionOpen) {
            await this.connect();
        }

        const filter = { id: pollId };
        const update = { $inc: { [`votes.${option}`]: 1 } };
        const options = { upsert: false, returnOriginal: false };
        const result = await this.collection?.findOneAndUpdate(filter, update, options);
        return result?.value as unknown as Poll;
    }
}

export default MongoDBWriter;
