import { Request, Response, NextFunction } from 'express';
import { DynamoDBClient, CreateTableCommand, ListTablesCommand, DeleteTableCommand } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, ScanCommand, PutCommand, UpdateCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';
import { v4 as uuidv4 } from 'uuid';
import config from '../config';
import { Poll } from '../models/poll';
import { saveVote } from '../services/votes.service';

class PollController {
    private dynamoDbClient: DynamoDBClient;
    private ddbDocClient: DynamoDBDocumentClient;
    private tableName: string = 'Polls';

    constructor() {
        this.listPolls = this.listPolls.bind(this);
        this.createPoll = this.createPoll.bind(this);
        this.getPoll = this.getPoll.bind(this);
        this.updatePoll = this.updatePoll.bind(this);
        this.deletePoll = this.deletePoll.bind(this);
        this.deleteAllPolls = this.deleteAllPolls.bind(this);
        this.vote = this.vote.bind(this);

        this.dynamoDbClient = new DynamoDBClient({
            endpoint: config.aws.endpoint,
            region: config.aws.region,
            credentials: {
                accessKeyId: config.aws.accessKeyId,
                secretAccessKey: config.aws.secretAccessKey,
            },
        });

        const marshallOptions = {
            // Whether to automatically convert empty strings, blobs, and sets to `null`.
            convertEmptyValues: false, // false, by default.
            // Whether to remove undefined values while marshalling.
            removeUndefinedValues: true, // false, by default.
            // Whether to convert typeof object to map attribute.
            convertClassInstanceToMap: false, // false, by default.
        };
        const unmarshallOptions = {
            // Whether to return numbers as a string instead of converting them to native JavaScript numbers.
            wrapNumbers: false, // false, by default.
        };
        this.ddbDocClient = DynamoDBDocumentClient.from(this.dynamoDbClient, { marshallOptions, unmarshallOptions });

        // Creo la tabella se non esiste
        this.createTableIfMissing(this.tableName);
    }

    async listPolls(req: Request, res: Response, next: NextFunction) {
        try {
            const params = {
                TableName: this.tableName,
            };
            const result = await this.ddbDocClient.send(new ScanCommand(params));
            res.json(result.Items);
        } catch (error) {
            next(error);
        }
    }

    async createPoll(req: Request, res: Response, next: NextFunction) {
        try {
            const id = uuidv4();
            const { question, options } = req.body as { question: string; options: string[] };
            const votes: number[] = new Array<number>(options.length).fill(0);
            const params = {
                TableName: this.tableName,
                Key: { id },
                UpdateExpression: 'SET question = :question, options = :options, votes = :votes',
                ExpressionAttributeValues: { ':question': question, ':options': options, ':votes': votes },
                ReturnValues: 'ALL_NEW',
            };
            // UpdateCommand inserisce il record se non lo trova e ritorna ciò che ha creato,
            // mentre il PutCommand non ritorna nulla e dovremmo fare una GetCommand
            // per ottenere il record appena creato
            const result = await this.ddbDocClient.send(new UpdateCommand(params));
            res.json(result.Attributes);
        } catch (error) {
            next(error);
        }
    }

    async getPoll(req: Request, res: Response, next: NextFunction) {
        try {
            const id = req.params.id;
            const params = { TableName: this.tableName, Key: { id } };
            const result = await this.ddbDocClient.send(new GetCommand(params));
            if (!result.Item) {
                res.status(404).json({ message: `Poll ${id} not found` });
            } else {
                res.json(result.Item);
            }
        } catch (error) {
            next(error);
        }
    }

    async updatePoll(req: Request, res: Response, next: NextFunction) {
        try {
            const id = req.params.id;
            const { question, options } = req.body as { question: string; options: string[] };
            const params = {
                TableName: this.tableName,
                Key: { id },
                UpdateExpression: 'SET question = :question, options = :options',
                ExpressionAttributeValues: { ':question': question, ':options': options },
                ReturnValues: 'ALL_NEW',
            };
            const result = await this.ddbDocClient.send(new UpdateCommand(params));
            res.json(result.Attributes);
        } catch (error) {
            next(error);
        }
    }

    async deletePoll(req: Request, res: Response, next: NextFunction) {
        try {
            const id = req.params.id;
            await this.dynamoDbClient.send(new DeleteCommand({ TableName: this.tableName, Key: { id } }));;
            res.json({ message: `Poll ${id} deleted` });
        } catch (error) {
            next(error);
        }
    }

    async deleteAllPolls(req: Request, res: Response, next: NextFunction) {
        try {
            const params = { TableName: this.tableName };
            const result = await this.ddbDocClient.send(new ScanCommand(params));
            for (const item of result.Items?.map((i) => i as Poll) || []) {
                await this.dynamoDbClient.send(new DeleteCommand({ TableName: this.tableName, Key: { id: item.id } }));
            }
            res.json({ message: `All polls deleted` });
        } catch (error) {
            next(error);
        }
    }

    async voteOption(req: Request, res: Response) {
        const { pollId, optionId } = req.body as { pollId: string; optionId: number };
        const params = {
            TableName: this.tableName,
            Key: { id: pollId },
            UpdateExpression: 'SET #votes[#optionId] = #votes[#optionId] + :increment',
            ExpressionAttributeNames: { '#votes': 'votes', '#optionId': optionId.toString() },
            ExpressionAttributeValues: { ':increment': 1 },
            ReturnValues: 'ALL_NEW',
        };
        const result = await this.ddbDocClient.send(new UpdateCommand(params));
        res.json(result.Attributes);
    }

    async vote(req: Request, res: Response) {
        const { pollId, optionId } = req.body as { pollId: string; optionId: number };
        await saveVote(pollId, optionId);
        res.json({ message: `Vote for poll ${pollId} queued` });
    }

    private async createTable(tableName: string) {
        const params = {
            TableName: tableName,
            KeySchema: [
                { AttributeName: 'id', KeyType: 'HASH' },
            ],
            AttributeDefinitions: [
                { AttributeName: 'id', AttributeType: 'S' },
            ],
            ProvisionedThroughput: {
                ReadCapacityUnits: 5,
                WriteCapacityUnits: 5,
            },
        };
        await this.dynamoDbClient.send(new CreateTableCommand(params));
    }

    private async deleteTable(tableName: string) {
        const params = { TableName: tableName };
        await this.dynamoDbClient.send(new DeleteTableCommand(params));
    }

    private async listTables(): Promise<string[] | undefined> {
        const params = {};
        const result = await this.dynamoDbClient.send(new ListTablesCommand(params));
        return result.TableNames;
    }

    private async createTableIfMissing(tableName: string) {
        const tables = await this.listTables();
        if (!tables?.includes(tableName)) {
            await this.createTable(tableName);
        }
    }

    private async recreateTable(tableName: string) {
        await this.deleteTable(tableName);
        await this.createTable(tableName);
    }
}

export { PollController };
