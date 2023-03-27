import  { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";
import config from '../config';

interface IMessage {
    [key: string]: any;
}

interface IPublishOptions {
    queueUrl: string;
}

export async function publishToSQS(message: IMessage, options: IPublishOptions): Promise<void> {
    const sqs = new SQSClient({
        endpoint: config.aws.endpoint,
        region: config.aws.region,
        credentials: {
            accessKeyId: config.aws.accessKeyId,
            secretAccessKey: config.aws.secretAccessKey,
        },
    });
    console.debug(`Queue: ${options.queueUrl}`);

    await sqs.send(new SendMessageCommand({
        QueueUrl: options.queueUrl,
        MessageBody: JSON.stringify(message),
    }));
}
