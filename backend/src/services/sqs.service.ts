import AWS from 'aws-sdk';
import config from '../config';

interface IMessage {
    [key: string]: any;
}

interface IPublishOptions {
    queueUrl: string;
}

export async function publishToSQS(message: IMessage, options: IPublishOptions): Promise<void> {
    const sqs = new AWS.SQS({
        endpoint: config.aws.endpoint ? new AWS.Endpoint(config.aws.endpoint) : undefined,
        region: config.aws.region,
        accessKeyId: config.aws.accessKeyId,
        secretAccessKey: config.aws.secretAccessKey,
    });

    await sqs.sendMessage({
        QueueUrl: options.queueUrl,
        MessageBody: JSON.stringify(message),
    }).promise();
}
