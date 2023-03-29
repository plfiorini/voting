import { DynamoDBClient, CreateTableCommand, DescribeTableCommand, PutItemCommand, GetItemCommand, UpdateItemCommand, DeleteItemCommand, ScanCommand, AttributeValue } from '@aws-sdk/client-dynamodb';
import Database from './database';
import config from '../config';
import { Poll, Vote } from '../polls/poll.model';
import NotFoundError from '../errors/notfound';

function votesAttributesToMap(attributes?: Record<string, AttributeValue>): Vote {
    let result: Vote = {};
    if (attributes) {
        for (const [key, value] of Object.entries(attributes)) {
            const num = Number(value?.N ?? 0);
            if (!isNaN(num)) {
                result[key] = num;
            }
        }
    }
    return result;
}

class DynamoDBDatabase implements Database {
    private readonly client: DynamoDBClient;
    private readonly tableName: string = config.database.table;

    constructor() {
        console.info(`Connecting to DynamoDB database at ${config.aws.endpoint}...`);
        this.client = new DynamoDBClient({
            endpoint: config.aws.endpoint,
            region: config.aws.region,
            credentials: {
                accessKeyId: config.aws.accessKeyId,
                secretAccessKey: config.aws.secretAccessKey,
            },
        });

        // Creo la tabella se non esiste
        this.createTableIfExists().catch(err => console.error(err));
    }

    isConnnected(): boolean {
        return true;
    }

    async connect(): Promise<void> {
        // Niente da fare, ci siamo già connessi nel costruttore
    }

    async disconnect(): Promise<void> {
        // Niente da fare, ci siamo già connessi nel costruttore
    }

    async createTableIfExists(): Promise<void> {
        const command = new DescribeTableCommand({ TableName: this.tableName });
        this.client.send(command).catch(async (err) => {
            if (err.name === 'ResourceNotFoundException') {
                await this.createTable();
            } else {
                console.error(err);
            }
        });
    }

    async createTable(): Promise<void> {
        const command = new CreateTableCommand({
            TableName: this.tableName,
            KeySchema: [
                { AttributeName: 'id', KeyType: 'HASH' }
            ],
            AttributeDefinitions: [
                { AttributeName: 'id', AttributeType: 'S' }
            ],
            BillingMode: 'PAY_PER_REQUEST',
        });
        await this.client.send(command);
        console.log(`Table "${this.tableName}" created successfully.`);
    }

    async listPolls(): Promise<Poll[] | undefined> {
        const command = new ScanCommand({ TableName: this.tableName });
        const result = await this.client.send(command);
        return result.Items?.map(item => {
            return {
                id: item.id.S!,
                question: item.question.S!,
                options: item.options.SS!,
                votes: votesAttributesToMap(item.votes.M),
            } as Poll;
        });
    }

    async createPoll(poll: Poll): Promise<Poll | undefined> {
        const command = new PutItemCommand({
            TableName: this.tableName,
            Item: {
                id: { S: poll.id },
                question: { S: poll.question },
                options: { SS: poll.options },
                votes: { M: {} },
            },
        });
        await this.client.send(command);
        return poll;
    }

    async getPollById(id: string): Promise<Poll | undefined> {
        const command = new GetItemCommand({
            TableName: this.tableName,
            Key: {
                id: { S: id }
            }
        });
        const response = await this.client.send(command);
        const item = response.Item;
        if (!item) {
            throw new NotFoundError(`Poll with id "${id}" not found`);
        }
        return {
            id: item.id.S!,
            question: item.question.S!,
            options: item.options.SS!,
            votes: votesAttributesToMap(item.votes.M),
        } as Poll;
    }

    async updatePoll(poll: Poll): Promise<Poll | undefined> {
        const command = new UpdateItemCommand({
            TableName: this.tableName,
            Key: {
                id: { S: poll.id }
            },
            UpdateExpression: 'SET #question = :question, #options = :options',
            ExpressionAttributeNames: {
                '#question': 'question',
                '#options': 'options'
            },
            ExpressionAttributeValues: {
                ':question': { S: poll.question },
                ':options': { SS: poll.options }
            },
            ReturnValues: 'ALL_NEW',
        });
        const result = await this.client.send(command);
        return {
            id: result.Attributes?.id.S!,
            question: result.Attributes?.question.S!,
            options: result.Attributes?.options.SS!,
            votes: votesAttributesToMap(result.Attributes?.votes.M),
        } as Poll;
    }

    async deletePollById(id: string): Promise<void> {
        const command = new DeleteItemCommand({
            TableName: this.tableName,
            Key: {
                id: { S: id }
            }
        });
        await this.client.send(command);
    }
}

export default DynamoDBDatabase;
