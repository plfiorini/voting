import client from 'amqplib'
import config from '../config';
import { IMessage, Producer } from './producer';

class AMQPProducer implements Producer {
    private connection?: client.Connection;
    private channel?: client.Channel;

    destructor() {
        this.disconnect();
    }

    async connect(): Promise<void> {
        console.info(`Connecting to AMQP server at ${config.amqp_url}...`);
        this.connection = await client.connect(config.amqp_url);
        this.channel = await this.connection.createChannel();
        await this.channel.assertQueue(config.queue.name, { durable: true });
    }

    async disconnect(): Promise<void> {
        if (this.channel) {
            await this.channel.close();
        }
        if (this.connection) {
            await this.connection.close();
        }
    }

    isConnnected(): boolean {
        return this.connection !== undefined;
    }

    async publish(message: IMessage): Promise<void> {
        if (!this.connection || !this.channel) {
            await this.connect();
        }

        if (this.connection && this.channel) {
            await this.channel.sendToQueue(config.queue.name, Buffer.from(JSON.stringify(message)));
        }
    }
}

export default AMQPProducer;
