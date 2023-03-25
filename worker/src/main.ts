import { SQSConsumer } from './sqs-consumer';

const sqsMessageWriter = new SQSConsumer();
setInterval(() => sqsMessageWriter.run(), 5000);
