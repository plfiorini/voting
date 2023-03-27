import express from 'express';
import { Request, Response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import swaggerUi from 'swagger-ui-express';
import yaml from 'js-yaml';
import fs from 'fs';
import config from './config';
import SwaggerDocument from './swagger.interface';
import { pollRouter } from './routes/poll';

const app = express();

app.use(cors());
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/polls', pollRouter);

// OpenAPI documentation
const swaggerObject = yaml.load(fs.readFileSync('docs/swagger.yaml', 'utf8'));
const swaggerDocument = swaggerObject as SwaggerDocument;
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Listen
if (require.main === module) {
    app.listen(config.port, () => {
        console.log(`Server is listening on port ${config.port} on environment ${config.environment}`);
    });
}

export default app;
