import { Server } from 'http';
import { beforeEach, afterEach, describe, it, expect } from '@jest/globals';
import request from 'supertest';
import app from '../src/server';
import config from '../src/config';

let server: Server;

describe('Server', () => {
    beforeEach(async () => {
        server = await app.listen(config.port);
    });
    afterEach(async () => {
        await server.close();
    });

    describe('API', () => {
        it('should return a 200 response', async () => {
            return request(server)
                .get('/')
                .then((response) => {
                    expect(response.statusCode).toBe(200);
                });
        });
    });

    describe('Votes', () => {
        it('should respond with a 200 status code and message', () => {
            return request(server)
                .post('/votes')
                .send()
                .then((response) => {
                    expect(response.statusCode).toBe(200);
                    expect(response.body.message).toBe('Vote received!')
                });
        });
    });
});
