import { SQSClient, CreateQueueCommand, ReceiveMessageCommand, DeleteMessageCommand } from '@aws-sdk/client-sqs';
import config from '../config';
import Consumer from './consumer';
import Writer from '../writer/writer';

class SQSConsumer implements Consumer {
    private readonly sqsClient: SQSClient;
    private readonly queueName = config.queue.name;

    constructor() {
        console.info(`Connecting to SQS at ${config.aws.endpoint}...`);
        this.sqsClient = new SQSClient({
            endpoint: config.aws.endpoint,
            region: config.aws.region,
            credentials: {
                accessKeyId: config.aws.accessKeyId,
                secretAccessKey: config.aws.secretAccessKey,
            },
        });
    }

    async connect(): Promise<void> {
        // Niente da fare, ci siamo già connessi nel costruttore
    }

    async disconnect(): Promise<void> {
        // Niente da fare, ci siamo già connessi nel costruttore
    }

    isConnnected(): boolean {
        return true;
    }

    async consume(writer: Writer): Promise<void> {
        // Creo la coda se non esiste
        const queueUrl = await this.createQueue();

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
                    console.debug(`Received message: ${JSON.stringify(message)}`);
                    if (!messageBody.pollId || !messageBody.option) {
                        console.warn(`Invalid message contents: ${message.Body}`);
                    } else {
                        // Aggiorno il voto
                        console.debug(`Vote received: ${messageBody.pollId} - ${messageBody.option}`);
                        const updatedPoll = await writer.castVote(messageBody.pollId, messageBody.option);
                        console.debug(`Update poll: ${JSON.stringify(updatedPoll)}`);

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
}

export default SQSConsumer;
