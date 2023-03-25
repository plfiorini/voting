import  { CreateQueueCommand, SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";
import config from '../config';
import { IMessage } from "../interfaces/message";

export async function publishToSQS(message: IMessage): Promise<void> {
    const sqs = new SQSClient({
        endpoint: config.aws.endpoint,
        region: config.aws.region,
        credentials: {
            accessKeyId: config.aws.accessKeyId,
            secretAccessKey: config.aws.secretAccessKey,
        },
    });

    // Creo la coda se non esiste
    const { QueueUrl } = await sqs.send(new CreateQueueCommand({ QueueName: config.aws.queueName }));
    console.debug(`Queue: ${QueueUrl}`);

    // Invio il messaggio
    await sqs.send(new SendMessageCommand({
        QueueUrl: QueueUrl,
        MessageBody: JSON.stringify(message),
    }));
}
