import dotenv from 'dotenv';
import path from 'path';

const environment = process.env.NODE_ENV || 'local';

dotenv.config({ debug: true, path: path.resolve(__dirname, '..', 'environment', environment) });

enum QueueBackendType {
    AWS = 'aws',
    AMQP = 'ampq',
}

enum DatabaseBackendType {
    AWS = 'aws',
    MONGODB = 'mongodb',
}

function mapQueueBackend(queueBackend: string): QueueBackendType | undefined {
    switch (queueBackend) {
        case 'aws':
            return QueueBackendType.AWS;
        case 'amqp':
            return QueueBackendType.AMQP;
        default:
            return undefined;
    }
}

function mapDatabaseBackend(databaseBackend: string): DatabaseBackendType | undefined {
    switch (databaseBackend) {
        case 'aws':
            return DatabaseBackendType.AWS;
        case 'mongodb':
            return DatabaseBackendType.MONGODB;
        default:
            return undefined;
    }
}

const config = {
    environment: environment,
    port: Number(process.env.PORT || 3000),
    queue: {
        backend: mapQueueBackend(process.env.QUEUE_BACKEND || 'aws'),
        name: process.env.QUEUE_NAME || 'votes',
    },
    database: {
        backend: mapDatabaseBackend(process.env.DATABASE_BACKEND || 'aws'),
        name: process.env.DATABASE_NAME || 'voting',
        table: process.env.DATABASE_TABLE || 'polls',
    },
    aws: {
        endpoint: process.env.AWS_ENDPOINT,
        region: process.env.AWS_REGION || '',
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    },
    amqp_url: process.env.AMQP_URL || '',
    mongodb_url: process.env.MONGODB_URL || '',
};

export default config;
export { QueueBackendType, DatabaseBackendType };
