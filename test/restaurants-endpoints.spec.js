const knex = require('knex');
const app = require('../src/app');
const helpers = require('./test-helpers');

describe('Retaurant Endpoints for Cachow', function () {
    let db;

    before('make knex instance', () => {
        db = knex({
            client: 'pg',
            connection: process.env.TEST_DATABASE_URL,
        })
        app.set('db', db);
    });

    //delete data from table after test is over
    after('disconnect from db', () => db.destroy());
    before('clean the table', () => db.raw('TRUNCATE cachow_restaurants, restaurant_hours, cachow_users RESTART IDENTITY CASCADE'));
    afterEach('cleanup', () => db.raw('TRUNCATE cachow_restaurants, restaurant_hours, cachow_users RESTART IDENTITY CASCADE'));

    //test for unauthorized requests at each endpoint for restaurants
    describe(`Unauthorized requests`, () => {
        const testUsers = helpers.makeUsersArray();
        const testHours = helpers.makeHoursArray();
        const testRestaurants = helpers.makeRestaurantsArray();
        beforeEach('insert restaurants', () => {
            return db
                .into('cachow_users')
                .insert(testUsers)
                .then(() => {
                    return db
                        .into('restaurant_hours')
                        .insert(testHours)
                        .then(() => {
                            return db
                                .into('cachow_restaurants')
                                .insert(testRestaurants)
                        });
                });
        });

        it(`responds with 401 Unauthorized for POST /api/restaurants`, () => {
            return supertest(app)
                .post('/api/restaurants')
                .send({
                    r_owner: 'test-user-1',
                    r_image: 'PostImage',
                    r_type: 'Fast',
                    r_name: 'PostRestaurant1',
                    r_address: 'PostAddress',
                    r_city: 'PostCity',
                    r_state: 'PostState',
                    r_zip: 'PostState',
                    r_phone: 'PostPhone',
                    r_hours: 1
                })
                .expect(401, { error: 'Unauthorized request' });
        });

        it(`responds with 401 Unauthorized for DELETE /api/restaurants/:r_id`, () => {
            const testR = testRestaurants[1];
            return supertest(app)
                .delete(`/api/restaurants/${testR.r_id}`)
                .expect(401, { error: 'Unauthorized request' });
        });

        it(`responds with 401 Unauthorized for PATCH /api/restaurants/:r_id`, () => {
            const testR = testRestaurants[1];
            return supertest(app)
                .patch(`/api/restaurants/${testR.r_id}`)
                .expect(401, { error: 'Unauthorized request' });
        });
    });

    //check the authorized GET restaurant Endpoint
    describe(`Authorized requests`, () => {
        describe(`GET all restaurants /api/restaurants`, () => {
            context(`Given there are NO restaurants in database`, () => {
                it(`responds with 200 and an empty list`, () => {
                    return supertest(app)
                        .get('/api/restaurants')
                        .expect(200, [])
                });
            });

            context('Given there are restaurants in the database', () => {
                const testUsers = helpers.makeUsersArray();
                const testHours = helpers.makeHoursArray();
                const testRestaurants = helpers.makeRestaurantsArray();
                beforeEach('insert restaurants', () => {
                    return db
                        .into('cachow_users')
                        .insert(testUsers)
                        .then(() => {
                            return db
                                .into('restaurant_hours')
                                .insert(testHours)
                                .then(() => {
                                    return db
                                        .into('cachow_restaurants')
                                        .insert(testRestaurants)
                                });
                        });
                });

                it('responds with 200 all of the restaurants for GET', () => {
                    return supertest(app)
                        .get(`/api/restaurants`)
                        .expect(200, testRestaurants);
                });
            });

            context(`Given an XSS attack restaurant input`, () => {
                const { maliciousRestaurant, expectedRestaurants } = helpers.makeMaliciousRestaurants();
                const testUsers = helpers.makeUsersArray();
                const testHours = helpers.makeHoursArray();
                beforeEach('insert malicious restaurants', () => {
                    return db
                        .into('cachow_users')
                        .insert(testUsers)
                        .then(() => {
                            return db
                                .into('restaurant_hours')
                                .insert(testHours)
                                .then(() => {
                                    return db
                                        .into('cachow_restaurants')
                                        .insert(maliciousRestaurant)
                                });
                        });
                });

                context('removes XSS attack restaurant input', () => {
                    return supertest(app)
                        .get(`/api/restaurants`)
                        .expect(200)
                        .expect(res => {
                            expect(res.body[0].r_owner).to.eql(expectedRestaurants.r_owner);
                            expect(res.body[0].r_image).to.eql(expectedRestaurants.r_image);
                            expect(res.body[0].r_type).to.eql(expectedRestaurants.r_type);
                            expect(res.body[0].r_name).to.eql(expectedRestaurants.r_name);
                            expect(res.body[0].r_address).to.eql(expectedRestaurants.r_address);
                            expect(res.body[0].r_city).to.eql(expectedRestaurants.r_city);
                            expect(res.body[0].r_state).to.eql(expectedRestaurants.r_state);
                            expect(res.body[0].r_zip).to.eql(expectedRestaurants.r_zip);
                            expect(res.body[0].r_phone).to.eql(expectedRestaurants.r_phone);
                            expect(res.body[0].r_hours).to.eql(expectedRestaurants.r_hours);
                        });
                });
            });

            describe(`POST /api/restaurants`, () => {
                const testUsers = helpers.makeUsersArray();
                const testHours = helpers.makeHoursArray();
                beforeEach('insert users and hours', () => {
                    return db
                        .into('cachow_users')
                        .insert(testUsers)
                        .then(() => {
                            return db
                                .into('restaurant_hours')
                                .insert(testHours)
                        });
                });

                it(`creates a restaurant, responding with 201 and the new restaurants`, () => {
                    const newRestaurant = {
                        r_id: 1,
                        r_owner: 'test-user-1',
                        r_image: 'NewRestaurantImage',
                        r_type: 'Fast',
                        r_name: 'NewRestaurant1',
                        r_address: 'NewRestaurantAddress',
                        r_city: 'NewRestaurantCity',
                        r_state: 'NewRestaurantState',
                        r_zip: 'NewRestaurantState',
                        r_phone: 'NewRestaurantPhone',
                        r_hours: 1
                    }

                    return supertest(app)
                        .post('/api/restaurants')
                        .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                        .send(newRestaurant)
                        .expect(201)
                        .expect(res => {
                            expect(res.body.r_owner).to.eql(newRestaurant.r_owner);
                            expect(res.body.r_image).to.eql(newRestaurant.r_image);
                            expect(res.body.r_type).to.eql(newRestaurant.r_type);
                            expect(res.body.r_name).to.eql(newRestaurant.r_name);
                            expect(res.body.r_address).to.eql(newRestaurant.r_address);
                            expect(res.body.r_city).to.eql(newRestaurant.r_city);
                            expect(res.body.r_state).to.eql(newRestaurant.r_state);
                            expect(res.body.r_zip).to.eql(newRestaurant.r_zip);
                            expect(res.body.r_phone).to.eql(newRestaurant.r_phone);
                            expect(res.body.r_hours).to.eql(newRestaurant.r_hours);
                        })
                        .then(res =>
                            supertest(app)
                                .get(`/api/restaurants/${res.body.r_id}`)
                                .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                                .expect(res.body)
                        );
                });

                //validation tests
                context(`responds with 400 Error for POST /api/restaurants and posts when name is shorter than 3`, () => {
                    return supertest(app)
                        .post('/api/restaurants')
                        .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                        .send({
                            r_name: 'a'
                        })
                        .expect(400, { "error": { message: `Restaurant name must be more than 3 and less than 50 characters.` } });
                });

                //TODO more validation tests

                //check for missing restaurant fields
                const requiredFields = ['r_owner', 'r_image', 'r_type', 'r_name', 'r_address', 'r_city', 'r_state', 'r_zip', 'r_phone', 'r_hours'];

                requiredFields.forEach(field => {
                    const newRestaurant = {
                        r_id: 1,
                        r_owner: 'test-user-1',
                        r_image: 'NewRestaurantImage',
                        r_type: 'Fast',
                        r_name: 'NewRestaurant1',
                        r_address: 'NewRestaurantAddress',
                        r_city: 'NewRestaurantCity',
                        r_state: 'NewRestaurantState',
                        r_zip: 'NewRestaurantState',
                        r_phone: 'NewRestaurantPhone',
                        r_hours: 1
                    }

                    it(`responds with 400 and an error message when the '${field}' is missing`, () => {
                        delete newRestaurant[field]

                        return supertest(app)
                            .post('/api/restaurants')
                            .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                            .send(newRestaurant)
                            .expect(400, {
                                error: { message: `Missing '${field}' in request body` }
                            })
                    })
                })

                context('removes XSS attack restaurant input from response', () => {
                    const { maliciousRestaurant, expectedRestaurants } = helpers.makeMaliciousRestaurants();
                    return supertest(app)
                        .post(`/api/restaurants`)
                        .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                        .send(maliciousRestaurant)
                        .expect(201)
                        .expect(res => {
                            expect(res.body[0].r_owner).to.eql(expectedRestaurants.r_owner);
                            expect(res.body[0].r_image).to.eql(expectedRestaurants.r_image);
                            expect(res.body[0].r_type).to.eql(expectedRestaurants.r_type);
                            expect(res.body[0].r_name).to.eql(expectedRestaurants.r_name);
                            expect(res.body[0].r_address).to.eql(expectedRestaurants.r_address);
                            expect(res.body[0].r_city).to.eql(expectedRestaurants.r_city);
                            expect(res.body[0].r_state).to.eql(expectedRestaurants.r_state);
                            expect(res.body[0].r_zip).to.eql(expectedRestaurants.r_zip);
                            expect(res.body[0].r_phone).to.eql(expectedRestaurants.r_phone);
                            expect(res.body[0].r_hours).to.eql(expectedRestaurants.r_hours);
                        });
                });
            });
        });

        describe(`GET /api/restaurants/:r_id`, () => {
            context(`Given no restaurants`, () => {
                it(`responds with 404`, () => {
                    const restId = 123456;
                    return supertest(app)
                        .get(`/api/restaurants/${restId}`)
                        .expect(404, { error: { message: `Sorry there is no restaurant associated with that id.` } });
                });
            });

            context('Given there are restaurants in the database', () => {
                const testUsers = helpers.makeUsersArray();
                const testHours = helpers.makeHoursArray();
                const testRestaurants = helpers.makeRestaurantsArray();
                beforeEach('insert restaurants', () => {
                    return db
                        .into('cachow_users')
                        .insert(testUsers)
                        .then(() => {
                            return db
                                .into('restaurant_hours')
                                .insert(testHours)
                                .then(() => {
                                    return db
                                        .into('cachow_restaurants')
                                        .insert(testRestaurants)
                                });
                        });
                });

                it('responds with 200 and the specified restaurant', () => {
                    const restId = 2;
                    const expectedRestaurants = testRestaurants[restId - 1];
                    return supertest(app)
                        .get(`/api/restaurants/${restId}`)
                        .expect(200, expectedRestaurants);
                });
            });

            context(`Given an XSS attack restaurant input`, () => {
                const { maliciousRestaurant, expectedRestaurants } = helpers.makeMaliciousRestaurants();
                const testUsers = helpers.makeUsersArray();
                const testHours = helpers.makeHoursArray();
                beforeEach('insert malicious restaurant', () => {
                    return db
                        .into('cachow_users')
                        .insert(testUsers)
                        .then(() => {
                            return db
                                .into('restaurant_hours')
                                .insert(testHours)
                                .then(() => {
                                    return db
                                        .into('cachow_restaurants')
                                        .insert(maliciousRestaurant)
                                });
                        });
                });

                context('removes XSS attack content', () => {
                    return supertest(app)
                        .get(`/api/restaurants/${maliciousRestaurant.r_id}`)
                        .expect(200)
                        .expect(res => {
                            expect(res.body[0].r_owner).to.eql(expectedRestaurants.r_owner);
                            expect(res.body[0].r_image).to.eql(expectedRestaurants.r_image);
                            expect(res.body[0].r_type).to.eql(expectedRestaurants.r_type);
                            expect(res.body[0].r_name).to.eql(expectedRestaurants.r_name);
                            expect(res.body[0].r_address).to.eql(expectedRestaurants.r_address);
                            expect(res.body[0].r_city).to.eql(expectedRestaurants.r_city);
                            expect(res.body[0].r_state).to.eql(expectedRestaurants.r_state);
                            expect(res.body[0].r_zip).to.eql(expectedRestaurants.r_zip);
                            expect(res.body[0].r_phone).to.eql(expectedRestaurants.r_phone);
                            expect(res.body[0].r_hours).to.eql(expectedRestaurants.r_hours);
                        });
                });
            });

            describe(`DELETE /api/restaurants/:r_id`, () => {
                const testUsers = helpers.makeUsersArray();
                context(`Given no restaurants`, () => {
                    it(`responds with 404`, () => {
                        const restId = 123456
                        return supertest(app)
                            .delete(`/api/restaurants/${restId}`)
                            .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                            .expect(404, { error: { message: `Sorry there is no restaurant associated with that id.` } })
                    });
                });

                context('Given there are restaurants in the database', () => {
                    const testUsers = helpers.makeUsersArray();
                    const testHours = helpers.makeHoursArray();
                    const testRestaurants = helpers.makeRestaurantsArray();
                    beforeEach('insert restaurants', () => {
                        return db
                            .into('cachow_users')
                            .insert(testUsers)
                            .then(() => {
                                return db
                                    .into('restaurant_hours')
                                    .insert(testHours)
                                    .then(() => {
                                        return db
                                            .into('cachow_restaurants')
                                            .insert(testRestaurants)
                                    });
                            });
                    });

                    it('responds with 204 and removes the restaurants', () => {
                        const idToRemove = 2;
                        const expectedRestaurants = testRestaurants.filter(restaurant => restaurant.r_id !== idToRemove);
                        return supertest(app)
                            .delete(`/api/restaurants/${idToRemove}`)
                            .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                            .expect(204)
                            .then(res =>
                                supertest(app)
                                    .get(`/api/restaurants`)
                                    .expect(expectedRestaurants)
                            );
                    });
                });
            });

            describe(`PATCH /api/restaurants/:r_id`, () => {
                const testUsers = helpers.makeUsersArray();
                const testHours = helpers.makeHoursArray();
                const testRestaurants = helpers.makeRestaurantsArray();
                beforeEach('insert restuarants', () => {
                    return db
                        .into('cachow_users')
                        .insert(testUsers)
                        .then(() => {
                            return db
                                .into('restaurant_hours')
                                .insert(testHours)
                                .then(() => {
                                    return db
                                        .into('cachow_restaurants')
                                        .insert(testRestaurants)
                                });
                        });
                });

                context(`Given no restaurants`, () => {
                    it(`responds with 404`, () => {
                        const restId = 123456;
                        return supertest(app)
                            .patch(`/api/restaurants/${restId}`)
                            .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                            .expect(404, { error: { message: `Sorry there is no restaurant associated with that id.` } })
                    });
                });

                context('Given there are restaurants in the database', () => {
                    it('responds with 204 and updates the restaurant', () => {
                        const idToUpdate = 2
                        const updateRestaurant = {
                            r_owner: 'test-user-1',
                            r_image: 'UpdateImage',
                            r_type: 'Fine',
                            r_name: 'UpdateRestaurant1',
                            r_address: 'UpdateAddress',
                            r_city: 'UpdateCity',
                            r_state: 'UpdateState',
                            r_zip: 'UpdateState',
                            r_phone: 'UpdatePhone',
                            r_hours: 1
                        }
                        const expectedRestaurants = {
                            ...testRestaurants[idToUpdate - 1],
                            ...updateRestaurant
                        }
                        return supertest(app)
                            .patch(`/api/restaurants/${idToUpdate}`)
                            .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                            .send(updateRestaurant)
                            .expect(204)
                            .then(res =>
                                supertest(app)
                                    .get(`/api/restaurants/${idToUpdate}`)
                                    .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                                    .expect(expectedRestaurants)
                            );
                    });

                    context('removes XSS attack hour input from response', () => {
                        const { maliciousRestaurant, expectedRestaurants } = helpers.makeMaliciousRestaurants();
                        const idToUpdate = 2;
                        return supertest(app)
                            .patch(`/api/restaurants/${idToUpdate}`)
                            .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                            .send(maliciousRestaurant)
                            .expect(201)
                            .expect(res => {
                                expect(res.body.r_owner).to.eql(expectedRestaurants.r_owner);
                                expect(res.body.r_image).to.eql(expectedRestaurants.r_image);
                                expect(res.body.r_type).to.eql(expectedRestaurants.r_type);
                                expect(res.body.r_name).to.eql(expectedRestaurants.r_name);
                                expect(res.body.r_address).to.eql(expectedRestaurants.r_address);
                                expect(res.body.r_city).to.eql(expectedRestaurants.r_city);
                                expect(res.body.r_state).to.eql(expectedRestaurants.r_state);
                                expect(res.body.r_zip).to.eql(expectedRestaurants.r_zip);
                                expect(res.body.r_phone).to.eql(expectedRestaurants.r_phone);
                                expect(res.body.r_hours).to.eql(expectedRestaurants.r_hours);
                            });
                    });

                    it(`responds with 400 when no required fields are supplied`, () => {
                        const idToUpdate = 2;
                        return supertest(app)
                            .patch(`/api/restaurants/${idToUpdate}`)
                            .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                            .send({ irrelevantField: 'foo' })
                            .expect(400, {
                                error: {
                                    message: `Request body must contain 'r_owner' in request body`
                                }
                            });
                    });

                    it(`responds with 204 when updating only a subset of fields`, () => {
                        const idToUpdate = 2;
                        const updateRestaurant = {
                            r_owner: 'test-user-1',
                            r_image: 'UpdateImage',
                            r_type: 'Fine',
                            r_name: 'UpdateRestaurant1',
                            r_address: 'UpdateAddress',
                            r_city: 'UpdateCity',
                            r_state: 'UpdateState',
                            r_zip: 'UpdateState',
                            r_phone: 'UpdatePhone',
                            r_hours: 1
                        }
                        const expectedRestaurants = {
                            ...testRestaurants[idToUpdate - 1],
                            ...updateRestaurant
                        }

                        return supertest(app)
                            .patch(`/api/restaurants/${idToUpdate}`)
                            .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                            .send({
                                ...updateRestaurant,
                                fieldToIgnore: 'should not be in GET response'
                            })
                            .expect(204)
                            .then(res =>
                                supertest(app)
                                    .get(`/api/restaurants/${idToUpdate}`)
                                    .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                                    .expect(expectedRestaurants)
                            );
                    });
                });
            });
        });
    });
});