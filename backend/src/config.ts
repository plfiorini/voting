import dotenv from 'dotenv';
import path from 'path';

const environment = process.env.NODE_ENV || 'local';

dotenv.config({ debug: true, path: path.resolve(__dirname, '..', 'environment', environment) });

const config = {
    environment: environment,
    port: process.env.PORT,
};

export default config;
