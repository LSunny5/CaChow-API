const app = require('../src/app')
describe('App Endpoint', () => {
  it('responds with 200 Authorized for GET /', () => {
    return supertest(app)
      .get('/api')
      .expect(200);
  });
});

describe('App Server endpoints - Authorized requests', () => {
  it('responds with 200 Authorized for GET /', () => {
    return supertest(app)
      .get('/api')
      .expect(200, 'Hello, world!');
  });
});