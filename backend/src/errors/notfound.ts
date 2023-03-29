import HttpError from './httperror';

class NotFoundError extends HttpError {
    constructor(message: string) {
        super(404, message);
    }
}

export default NotFoundError;
