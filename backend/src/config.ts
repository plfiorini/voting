import dotenv from 'dotenv';
import path from 'path';

const environment = process.env.NODE_ENV || 'local';

dotenv.config({ debug: true, path: path.resolve(__dirname, '..', 'environment', environment) });

const config = {
    environment: environment,
    port: process.env.PORT,
    aws: {
        endpoint: process.env.AWS_ENDPOINT,
        region: process.env.AWS_REGION || '',
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
        sqsBaseUrl: process.env.AWS_SQS_BASE_URL || '',
    },
};

export default config;
