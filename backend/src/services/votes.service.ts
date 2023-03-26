import path from 'path';
import { publishToSQS } from './sqs.service';
import config from '../config';

export async function saveVote(voterId: string, vote: string): Promise<void> {
  const message = { voterId: voterId, vote: vote };
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
