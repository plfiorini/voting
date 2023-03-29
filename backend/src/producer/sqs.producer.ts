import { CreateQueueCommand, SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs';
import config from '../config';
import { IMessage, Producer } from './producer';

class SQSProducer implements Producer {
    private readonly client: SQSClient;

    constructor() {
        console.info(`Connecting to SQS at ${config.aws.endpoint}...`);
        this.client = new SQSClient({
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

    async publish(message: IMessage): Promise<void> {
        // Creo la coda se non esiste
        const { QueueUrl } = await this.client.send(new CreateQueueCommand({ QueueName: config.queue.name }));
        console.debug(`Queue: ${QueueUrl}`);

        // Invio il messaggio
        await this.client.send(new SendMessageCommand({
            QueueUrl: QueueUrl,
            MessageBody: JSON.stringify(message),
        }));
    }
}

export default SQSProducer;
