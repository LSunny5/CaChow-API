const knex = require('knex');
const app = require('../src/app');
const helpers = require('./test-helpers');

describe('Protected endpoints', function () {
  let db

  before('make knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DATABASE_URL,
    })
    app.set('db', db)
  })

  after('disconnect from db', () => db.destroy());
  before('cleanup', () => db.raw('TRUNCATE restaurant_menu, cachow_restaurants, restaurant_hours, cachow_categories, cachow_users RESTART IDENTITY CASCADE'));
  afterEach('cleanup', () => db.raw('TRUNCATE restaurant_menu, cachow_restaurants, restaurant_hours, cachow_categories, cachow_users RESTART IDENTITY CASCADE'));

  const testUsers = helpers.makeUsersArray();
  const testCategories = helpers.makeCategoriesArray();
  const testHours = helpers.makeHoursArray();
  const testRestaurants = helpers.makeRestaurantsArray();
  const testItems = helpers.makeItemsArray();
  beforeEach('insert items', () => {
    return db
      .into('cachow_users')
      .insert(testUsers)
      .then(() => {
        return db
          .into('cachow_categories')
          .insert(testCategories)
          .then(() => {
            return db
              .into('restaurant_hours')
              .insert(testHours)
              .then(() => {
                return db
                  .into('cachow_restaurants')
                  .insert(testRestaurants)
                  .then(() => {
                    return db
                      .into('restaurant_menu')
                      .insert(testItems);
                  });
              });
          });
      });
  });

  const protectedEndpoints = [
    {
      name: 'POST /auth/refresh',
      path: '/api/auth/refresh',
      method: supertest(app).post,
    },
    {
      name: 'POST /api/category',
      path: '/api/category',
      method: supertest(app).post,
    },
    {
      name: 'DELETE /api/category/cat_id',
      path: '/api/category/1',
      method: supertest(app).delete,
    },
    {
      name: 'PATCH /api/category/cat_id',
      path: '/api/category/1',
      method: supertest(app).patch,
    },
    {
      name: 'DELETE /api/users/:user_name',
      path: '/api/users/test-user-1',
      method: supertest(app).delete,
    },
    {
      name: 'POST /api/hours',
      path: '/api/hours',
      method: supertest(app).post,
    },
    {
      name: 'DELETE /api/hours/hours_id',
      path: '/api/hours/1',
      method: supertest(app).delete,
    },
    {
      name: 'PATCH /api/hours/hours_id',
      path: '/api/hours/1',
      method: supertest(app).patch,
    },
    {
      name: 'POST /api/menu',
      path: '/api/menu',
      method: supertest(app).post,
    },
    {
      name: 'DELETE /api/menu/item_id',
      path: '/api/menu/1',
      method: supertest(app).delete,
    },
    {
      name: 'PATCH /api/menu/item_id',
      path: '/api/menu/1',
      method: supertest(app).patch,
    },
    {
      name: 'POST /api/restaurants',
      path: '/api/restaurants',
      method: supertest(app).post,
    },
    {
      name: 'DELETE /api/restaurants/r_id',
      path: '/api/restaurants/1',
      method: supertest(app).delete,
    },
    {
      name: 'PATCH /api/restaurants/r_id',
      path: '/api/restaurants/1',
      method: supertest(app).patch,
    },
  ];

  protectedEndpoints.forEach(endpoint => {
    describe(endpoint.name, () => {
      it(`responds 401 'Missing bearer token' when no bearer token`, () => {
        return endpoint.method(endpoint.path)
          .expect(401, { error: `Unauthorized request` })
      })

      it(`responds 401 'Unauthorized request' when invalid JWT secret`, () => {
        const validUser = testUsers[0]
        const invalidSecret = 'bad-secret'
        return endpoint.method(endpoint.path)
          .set('Authorization', helpers.makeAuthHeader(validUser, invalidSecret))
          .expect(401, { error: `Unauthorized request` })
      })

      it(`responds 401 'Unauthorized request' when invalid sub in payload`, () => {
        const invalidUser = { user_name: 'user-not-existy', id: 1 }
        return endpoint.method(endpoint.path)
          .set('Authorization', helpers.makeAuthHeader(invalidUser))
          .expect(401, { error: `Unauthorized request` })
      })
    })
  })
});