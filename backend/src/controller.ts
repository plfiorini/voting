import express from 'express';

abstract class Controller {
    public path = '/';
    public router = express.Router();
}

export default Controller;
