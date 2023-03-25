import { DynamoDBClient, CreateTableCommand, DescribeTableCommand, PutItemCommand, GetItemCommand, UpdateItemCommand, DeleteItemCommand, ScanCommand, AttributeValue } from "@aws-sdk/client-dynamodb";
import config from '../config';
import Poll from '../polls/poll.model';

function votesAttributesToMap(attributes?: Record<string, AttributeValue>): Map<string, number> {
    const result = new Map<string, number>();
    if (attributes !== undefined) {
        for (const [key, value] of Object.entries(attributes)) {
            result.set(key, Number(value.N || 0));
        }
    }
    return result;
}

class PollService {
    private client: DynamoDBClient;
    private tableName: string = config.aws.tableName;

    constructor() {
        this.client = new DynamoDBClient({
            endpoint: config.aws.endpoint,
            region: config.aws.region,
            credentials: {
                accessKeyId: config.aws.accessKeyId,
                secretAccessKey: config.aws.secretAccessKey,
            },
        });

        // Creo la tabella se non esiste
        const command = new DescribeTableCommand({ TableName: this.tableName });
        this.client.send(command).catch(async (err) => {
            if (err.name === 'ResourceNotFoundException') {
                await this.createTable();
            } else {
                console.error(err);
            }
        });
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

    async getPollById(id: string): Promise<Poll | null> {
        const command = new GetItemCommand({
            TableName: this.tableName,
            Key: {
                id: { S: id }
            }
        });
        const response = await this.client.send(command);
        const item = response.Item;
        if (!item) {
            return null;
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

    async deleteAllPolls(): Promise<void> {
        this.listPolls().then((polls) => {
            this.deletePollById(polls![0].id!);
        });
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
        await this.client.send(command);
        console.log(`Table "${this.tableName}" created successfully.`);
    }
}

export default PollService;
