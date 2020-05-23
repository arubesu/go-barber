import request from 'supertest';
import app from '../../src/app';
import truncate from '../util/truncate';
import factory from '../util/factory';

describe('User', () => {
  beforeEach(async () => {
    await truncate();
  });

  it('Should register an user', async () => {
    const user = await factory.attrs('User');

    const response = await request(app)
      .post('/users')
      .send(user);

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
  });

  it('Should return BadRequest when try to create an user with the same email', async () => {
    const user = await factory.attrs('User');

    await request(app)
      .post('/users')
      .send(user);

    const response = await request(app)
      .post('/users')
      .send(user);

    expect(response.status).toBe(400);
  });
});
