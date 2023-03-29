import config, { QueueBackendType, DatabaseBackendType } from './config';
import Writer from './writer/writer';
import DynamoDBWriter from './writer/dynamodb.writer';
import MongoDBWriter from './writer/mongodb.writer';
import Consumer from './consumer/consumer';
import SQSConsumer from './consumer/sqs.consumer';
import AMQPConsumer from './consumer/amqp.consumer';

let writer: Writer;
switch (config.database.backend) {
    case DatabaseBackendType.AWS:
    default:
        writer = new DynamoDBWriter();
        break;
    case DatabaseBackendType.MONGODB:
        writer = new MongoDBWriter();
        break;
}

let consumer: Consumer;
switch (config.queue.backend) {
    case QueueBackendType.AWS:
    default:
        consumer = new SQSConsumer();
        break;
    case QueueBackendType.AMQP:
        consumer = new AMQPConsumer();
        break;
}

consumer.consume(writer);
