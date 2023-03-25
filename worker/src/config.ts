import dotenv from 'dotenv';
import path from 'path';

const environment = process.env.NODE_ENV || 'local';

dotenv.config({ debug: true, path: path.resolve(__dirname, '..', 'environment', environment) });

const config = {
    environment: environment,
    aws: {
        endpoint: process.env.AWS_ENDPOINT,
        region: process.env.AWS_REGION || '',
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
        queueName: process.env.AWS_QUEUE_NAME || '',
        tableName: process.env.AWS_TABLE_NAME || '',
    },
};

export default config;
