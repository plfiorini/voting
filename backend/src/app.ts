import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import swaggerUi from 'swagger-ui-express';
import yaml from 'js-yaml';
import fs from 'fs';
import config from './config';
import SwaggerDocument from './swagger.interface';
import Controller from './controller';

class App {
    public app: express.Application;
    public port: number;

    constructor(controllers: Controller[], port: number) {
        this.app = express();
        this.port = port;

        this.initializeMiddlewares();
        this.initializeControllers(controllers);
        this.initializeSwagger();
    }

    private initializeMiddlewares() {
        this.app.use(cors());
        this.app.use(cookieParser());
        this.app.use(bodyParser.json());
        this.app.use(bodyParser.urlencoded({ extended: true }));
    }

    private initializeControllers(controllers: Controller[]) {
        controllers.forEach((controller) => {
            this.app.use('/polls', controller.router);
        });
    }

    private initializeSwagger() {
        const swaggerObject = yaml.load(fs.readFileSync('docs/swagger.yaml', 'utf8'));
        const swaggerDocument = swaggerObject as SwaggerDocument;
        this.app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
    }

    public listen() {
        this.app.listen(this.port, () => {
            console.log(`Backend listening on the port ${this.port} (${config.environment})`);
        });
    }
}

export default App;
