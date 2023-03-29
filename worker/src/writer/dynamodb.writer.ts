import { DynamoDBClient, CreateTableCommand, DescribeTableCommand, UpdateItemCommand, AttributeValue } from '@aws-sdk/client-dynamodb';
import config from '../config';
import Writer from './writer';
import { Poll, Vote } from '../poll.model';

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

class DynamoDBWriter implements Writer {
    private readonly ddbClient: DynamoDBClient;
    private readonly tableName: string = config.database.table;

    constructor() {
        this.ddbClient = new DynamoDBClient({
            endpoint: config.aws.endpoint,
            region: config.aws.region,
            credentials: {
                accessKeyId: config.aws.accessKeyId,
                secretAccessKey: config.aws.secretAccessKey,
            },
        });

        // Creo la tabella se non esiste
        const command = new DescribeTableCommand({ TableName: this.tableName });
        this.ddbClient.send(command).catch(async (err) => {
            if (err.name === 'ResourceNotFoundException') {
                await this.createTable();
            } else {
                console.error(err);
            }
        });
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

    private async createTable(): Promise<void> {
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
        await this.ddbClient.send(command);
        console.log(`Table "${this.tableName}" created successfully.`);
    }

    async castVote(pollId: string, option: string): Promise<Poll | undefined> {
        const command = new UpdateItemCommand({
            TableName: this.tableName,
            Key: {
                id: { S: pollId }
            },
            UpdateExpression: 'SET #votes.#option = if_not_exists(#votes.#option, :zero) + :one',
            ExpressionAttributeNames: {
                '#votes': 'votes',
                '#option': option,
            },
            ExpressionAttributeValues: {
                ':zero': { N: '0' },
                ':one': { N: '1' },
            },
            ReturnValues: 'ALL_NEW',
        });
        const result = await this.ddbClient.send(command);
        return {
            id: result.Attributes?.id.S!,
            question: result.Attributes?.question.S!,
            options: result.Attributes?.options.SS!,
            votes: votesAttributesToMap(result.Attributes?.votes.M),
        } as Poll;
    }
}

export default DynamoDBWriter;
