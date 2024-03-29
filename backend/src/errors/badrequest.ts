import HttpError from './httperror';

class BadRequestError extends HttpError {
    constructor(message: string) {
        super(400, message);
    }
}

export default BadRequestError;
