import config, { QueueBackendType } from "../config";
import { Producer, IMessage } from "../producer/producer";
import AMPQPublisher from "../producer/amqp.producer";
import SQSProducer from "../producer/sqs.producer";

class VoteService {
  private readonly publisher: Producer;

  constructor() {
    switch (config.queue.backend) {
      case QueueBackendType.AWS:
      default:
        this.publisher = new SQSProducer();
        break;
      case QueueBackendType.AMQP:
        this.publisher = new AMPQPublisher();
        break;
    }
  }

  isConnected(): boolean {
    return this.publisher.isConnnected() ?? false;
  }

  async connect(): Promise<void> {
    if (this.publisher) {
      if (this.publisher.isConnnected() === false) {
        await this.publisher.connect();
      }
    }
  }

  async disconnect(): Promise<void> {
    if (this.publisher) {
      if (this.publisher.isConnnected() === true) {
        await this.publisher.disconnect();
      }
    }
  }

  async saveVote(pollId: string, option: string): Promise<void> {
    await this.connect();

    const message = { pollId: pollId, option: option } as IMessage;
    await this.publisher.publish(message);
  }
}

export default VoteService;
