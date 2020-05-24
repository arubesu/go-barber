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

  it('Should return BadRequest when user tries to change the email and the new email is already registered', async () => {
    /**
     * Register 2 users with distinct emails
     */

    const user1 = await factory.attrs('User', {
      email: 'sample1@mail.com',
    });

    await request(app)
      .post('/users')
      .send(user1);

    const user2 = await factory.attrs('User', {
      email: 'sample2@mail.com',
    });

    await request(app)
      .post('/users')
      .send(user2);

    /**
     * User 2 authentication
     */

    const { text } = await request(app)
      .post('/sessions')
      .send({
        email: user2.email,
        password: user2.password,
      });

    const { token } = JSON.parse(text);

    /**
     * User 2 tries to update his email with the user1's email
     */

    const updatedUser2 = { ...user2, email: user1.email };

    const response = await request(app)
      .put('/users')
      .set({ Authorization: `Bearer ${token}`, Accept: 'application/json' })
      .send(updatedUser2);

    expect(response.status).toBe(400);
  });

  it('Should return Unauthorized when user tries to change his password but sends invalid oldPassword', async () => {
    const user = await factory.attrs('User', {
      password: 'P4ssw0rd!#',
    });

    await request(app)
      .post('/users')
      .send(user);

    const { text } = await request(app)
      .post('/sessions')
      .send(user);

    const { token } = JSON.parse(text);

    const response = await request(app)
      .put('/users')
      .set({ Authorization: `Bearer ${token}`, Accept: 'application/json' })
      .send({
        ...user,
        name: 'New Name',
        oldPassword: 'IncorrectPAss4',
      });

    expect(response.status).toBe(401);
  });
});
