import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import swaggerUi from 'swagger-ui-express';
import yaml from 'js-yaml';
import fs from 'fs';
import config from './config';
import SwaggerDocument from './interfaces/swagger';
import Controller from './controller';
import HttpError from './errors/httperror';

class App {
    public app: express.Application;
    public port: number;

    constructor(controllers: Controller[], port: number) {
        this.app = express();
        this.port = port;

        this.initializeMiddlewares(controllers);
        this.initializeSwagger();
    }

    private initializeMiddlewares(controllers: Controller[]) {
        // Middleware per loggare le richieste HTTP
        this.app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
            console.log(`${req.method} ${req.path}`);
            next();
        });

        // Middleware per cross-origin resource sharing (CORS)
        this.app.use(cors());

        // Middleware per la gestione delle richieste HTTP
        this.app.use(cookieParser());
        this.app.use(bodyParser.json());
        this.app.use(bodyParser.urlencoded({ extended: true }));

        controllers.forEach((controller) => {
            this.app.use(controller.path, controller.router);
        });

        // Middleware for la gestione degli errori
        this.app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
            if (err instanceof HttpError) {
                res.status(err.statusCode).json({ error: err.message });
            } else {
                console.error(err);
                res.status(500).json({ error: 'Internal server error' });
            }
        });

        // Middleware per i path inesistenti
        this.app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
            res.status(404).json({ error: 'Not found' });
        });
    }

    private initializeSwagger() {
        const swaggerObject = yaml.load(fs.readFileSync('docs/swagger.yaml', 'utf8'));
        const swaggerDocument = swaggerObject as SwaggerDocument;
        this.app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
    }

    public listen() {
        console.info(`Starting backend on port ${this.port} (${config.environment})...`);
        this.app.listen(this.port, () => {
            console.log(`Backend listening on the port ${this.port} (${config.environment})`);
        });
    }
}

export default App;
