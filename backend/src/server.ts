import express from 'express';
import { Request, Response } from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import config from './config';
import votesRoutes from './routes/votes.route';

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req: Request, res: Response) => {
    res.send('Hello World!');
});

app.use(votesRoutes);

if (require.main === module) {
    const PORT = config.port;

    app.listen(PORT, () => {
        console.log(`Server is listening on port ${PORT}.`);
    });
}

export default app;
