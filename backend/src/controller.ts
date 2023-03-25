import express from 'express';

abstract class Controller {
    public router = express.Router();
}

export default Controller;
