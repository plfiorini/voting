import client from 'amqplib'
import Consumer from './consumer';
import config from '../config';
import Writer from '../writer/writer';

class AMQPConsumer implements Consumer {
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

    async consume(writer: Writer): Promise<void> {
        if (!this.connection || !this.channel) {
            await this.connect();
        }

        if (this.connection && this.channel) {
            await this.channel.consume(config.queue.name, async (msg: client.ConsumeMessage | null) => {
                if (msg) {
                    // Acquisisco il voto
                    const message = JSON.parse(msg.content.toString()) as { pollId: string, option: string };
                    console.debug(`Received message: ${JSON.stringify(message)}`);
                    this.channel?.ack(msg);

                    // Aggiorno il voto
                    console.debug(`Vote received: ${message.pollId} - ${message.option}`);
                    const updatedPoll = await writer.castVote(message.pollId, message.option);
                    console.debug(`Update poll: ${JSON.stringify(updatedPoll)}`);
                }
            });
        }
    }
}

export default AMQPConsumer;
