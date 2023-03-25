import App from './app';
import PollsController from './polls/poll.controller';
import config from './config';

// Crea applicazione
const app = new App(
    [
        new PollsController(),
    ],
    config.port,
);

// Esecuzione
if (require.main === module) {
    app.listen();
}

export default app;
