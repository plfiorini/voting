import { publishToSQS } from './sqs.service';
import config from '../config';

export async function saveVote(pollId: string, optionId: number): Promise<void> {
  const message = { pollId: pollId, optionId: optionId };
  const options = {
    queueUrl: config.aws.queueUrl,
  };
  return new Promise<void>((resolve, reject) => {
    publishToSQS(message, options)
      .then(() => {
        console.log('Message published successfully');
        resolve();
      })
      .catch((err) => {
        console.error(`Error publishing message: ${err}`);
        reject();
      });
  });
}
