import { publishToSQS } from './sqs';
import { IMessage } from "../interfaces/message";

export async function saveVote(pollId: string, option: string): Promise<void> {
  const message = { pollId: pollId, option: option } as IMessage;
  return new Promise<void>((resolve, reject) => {
    publishToSQS(message)
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
