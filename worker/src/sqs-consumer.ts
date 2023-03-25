import { SQSClient, CreateQueueCommand, ReceiveMessageCommand, DeleteMessageCommand } from '@aws-sdk/client-sqs';
import { DynamoDBClient, CreateTableCommand, DescribeTableCommand, UpdateItemCommand, AttributeValue } from '@aws-sdk/client-dynamodb';
import config from './config';
import { Poll, Vote } from './poll.model';

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

class SQSConsumer {
    private readonly sqsClient: SQSClient;
    private readonly ddbClient: DynamoDBClient;
    private readonly queueName: string = config.aws.queueName;
    private readonly tableName: string = config.aws.tableName;

    constructor() {
        this.sqsClient = new SQSClient({
            endpoint: config.aws.endpoint,
            region: config.aws.region,
            credentials: {
                accessKeyId: config.aws.accessKeyId,
                secretAccessKey: config.aws.secretAccessKey,
            },
        });
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

    async run() {
        // Creo la coda se non esiste
        let queueUrl = undefined;
        try {
            queueUrl = await this.createQueue();
        } catch (error) {
            console.error(`Error creating queue: ${error}`);
            console.error(error);
            return;
        }

        if (!queueUrl) {
            return;
        }

        try {
            const receiveParams = {
                QueueUrl: queueUrl,
                MaxNumberOfMessages: 10,
                WaitTimeSeconds: 20,
            };
            const receiveResult = await this.sqsClient.send(new ReceiveMessageCommand(receiveParams));
            const messages = receiveResult.Messages ?? [];

            for (const message of messages) {
                if (message.Body) {
                    // Acquisisco il voto
                    const messageBody = JSON.parse(message.Body) as { pollId: string, option: string };
                    if (!messageBody.pollId || !messageBody.option) {
                        console.warn(`Invalid message contents: ${message.Body}`);
                    } else {
                        // Aggiorno il voto
                        console.log(`Vote received: ${messageBody.pollId} - ${messageBody.option}`);
                        const updatedPoll = await this.castVote(messageBody.pollId, messageBody.option);
                        console.log(`Update poll: ${JSON.stringify(updatedPoll)}`);

                        // Cancello il messaggio ora che è stato elaborato
                        const deleteParams = {
                            QueueUrl: queueUrl,
                            ReceiptHandle: message.ReceiptHandle,
                        };
                        await this.sqsClient.send(new DeleteMessageCommand(deleteParams));
                    }
                } else {
                    console.warn(`Invalid message: ${message.Body}`);
                }
            }
        } catch (error) {
            console.error(`Error writing value to DynamoDB: ${error}`);
            console.error(error);
        }
    }

    private async createQueue(): Promise<string | undefined> {
        const result = await this.sqsClient.send(new CreateQueueCommand({ QueueName: this.queueName }));
        return result.QueueUrl;
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

    private async castVote(pollId: string, option: string): Promise<Poll | undefined> {
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

export { SQSConsumer };
