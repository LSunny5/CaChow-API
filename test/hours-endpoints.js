const knex = require('knex');
const app = require('../src/app');
const helpers = require('./test-helpers');

describe('Hours Endpoints for Cachow', function () {
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
    before('clean the table', () => db.raw('TRUNCATE restaurant_hours, cachow_users RESTART IDENTITY CASCADE'));
    afterEach('cleanup', () => db.raw('TRUNCATE restaurant_hours, cachow_users RESTART IDENTITY CASCADE'));

    //test for unauthorized requests at each endpoint for restaurant hours
    describe(`Unauthorized requests`, () => {
        const testHours = helpers.makeHoursArray();
        const testUsers = helpers.makeUsersArray();
        beforeEach('insert hours', () => {
            return db
                .into('cachow_users')
                .insert(testUsers)
                .then(() => {
                    return db
                        .into('restaurant_hours')
                        .insert(testHours);
                });
        });

        it(`responds with 401 Unauthorized for POST /api/hours`, () => {
            return supertest(app)
                .post('/api/hours')
                .send({
                    sun_open: "Test",
                    sun_close: "Test",
                    mon_open: "Test",
                    mon_close: "Test",
                    tues_open: "Test",
                    tues_close: "Test",
                    wed_open: "Test",
                    wed_close: "Test",
                    thu_open: "Test",
                    thu_close: "Test",
                    fri_open: "Test",
                    fri_close: "Test",
                    sat_open: "Test",
                    sat_close: "Test",
                    hours_owner: 1
                })
                .expect(401, { error: 'Unauthorized request' });
        });

        it(`responds with 401 Unauthorized for DELETE /api/hours/:hours_id`, () => {
            const testH = testHours[1];
            return supertest(app)
                .delete(`/api/hours/${testH.hours_id}`)
                .expect(401, { error: 'Unauthorized request' });
        });

        it(`responds with 401 Unauthorized for PATCH /api/hours/:hours_id`, () => {
            const testH = testHours[1];
            return supertest(app)
                .patch(`/api/hours/${testH.hours_id}`)
                .expect(401, { error: 'Unauthorized request' });
        });
    });

    //check the authorized GET hours Endpoint
    describe(`Authorized requests`, () => {
        describe(`GET all hours /api/hours`, () => {
            context(`Given there are NO hours in database`, () => {
                it(`responds with 200 and an empty list`, () => {
                    return supertest(app)
                        .get('/api/hours')
                        .expect(200, [])
                });
            });

            context('Given there are hours in the database', () => {
                const testHours = helpers.makeHoursArray();
                const testUsers = helpers.makeUsersArray();
                beforeEach('insert hours', () => {
                    return db
                        .into('cachow_users')
                        .insert(testUsers)
                        .then(() => {
                            return db
                                .into('restaurant_hours')
                                .insert(testHours);
                        });
                });

                it('responds with 200 and all of the hours for GET', () => {
                    return supertest(app)
                        .get('/api/hours')
                        .expect(200, testHours)
                });
            });

            context(`Given an XSS attack hours input`, () => {
                const { maliciousHours, expectedHours } = helpers.makeMaliciousHours();
                const testUsers = helpers.makeUsersArray();
                beforeEach('insert malicious hours', () => {
                    return db
                        .into('cachow_users')
                        .insert(testUsers)
                        .then(() => {
                            return db
                                .into('restaurant_hours')
                                .insert(maliciousHours);
                        });
                });

                it('removes XSS attack hours input', () => {
                    return supertest(app)
                        .get(`/api/hours`)
                        .expect(200)
                        .expect(res => {
                            expect(res.body[0].sun_open).to.eql(expectedHours.sun_open);
                            expect(res.body[0].sun_close).to.eql(expectedHours.sun_close);
                            expect(res.body[0].mon_open).to.eql(expectedHours.mon_open);
                            expect(res.body[0].mon_close).to.eql(expectedHours.mon_close);
                            expect(res.body[0].tues_open).to.eql(expectedHours.tues_open);
                            expect(res.body[0].tues_close).to.eql(expectedHours.tues_close);
                            expect(res.body[0].wed_open).to.eql(expectedHours.wed_open);
                            expect(res.body[0].wed_close).to.eql(expectedHours.wed_close);
                            expect(res.body[0].thu_open).to.eql(expectedHours.thu_open);
                            expect(res.body[0].thu_close).to.eql(expectedHours.thu_close);
                            expect(res.body[0].fri_open).to.eql(expectedHours.fri_open);
                            expect(res.body[0].fri_close).to.eql(expectedHours.fri_close);
                            expect(res.body[0].sat_open).to.eql(expectedHours.sat_open);
                            expect(res.body[0].sat_close).to.eql(expectedHours.sat_close);
                            expect(res.body[0].hours_owner).to.eql(expectedHours.hours_owner);
                        });
                });
            });
        });

        describe(`POST /api/hours`, () => {
            const testUsers = helpers.makeUsersArray();
            beforeEach('insert users', () =>
                helpers.seedUsers(db, testUsers)
            )

            it(`creates hours, responding with 201 and the new hours`, () => {
                const newHours = {
                    hours_id: 1,
                    sun_open: "test1",
                    sun_close: "test1",
                    mon_open: "test1",
                    mon_close: "test1",
                    tues_open: "test1",
                    tues_close: "test1",
                    wed_open: "test1",
                    wed_close: "test1",
                    thu_open: "test1",
                    thu_close: "test1",
                    fri_open: "test1",
                    fri_close: "test1",
                    sat_open: "test1",
                    sat_close: "test1",
                    hours_owner: "test-user-1",
                }

                return supertest(app)
                    .post('/api/hours')
                    .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                    .send(newHours)
                    .expect(201)
                    .expect(res => {
                        expect(res.body.sun_open).to.eql(newHours.sun_open)
                        expect(res.body.sun_close).to.eql(newHours.sun_close)
                        expect(res.body.mon_open).to.eql(newHours.mon_open)
                        expect(res.body.mon_close).to.eql(newHours.mon_close)
                        expect(res.body.tues_open).to.eql(newHours.tues_open)
                        expect(res.body.tues_close).to.eql(newHours.tues_close)
                        expect(res.body.wed_open).to.eql(newHours.wed_open)
                        expect(res.body.wed_close).to.eql(newHours.wed_close)
                        expect(res.body.thu_open).to.eql(newHours.thu_open)
                        expect(res.body.thu_close).to.eql(newHours.thu_close)
                        expect(res.body.fri_open).to.eql(newHours.fri_open)
                        expect(res.body.fri_close).to.eql(newHours.fri_close)
                        expect(res.body.sat_open).to.eql(newHours.sat_open)
                        expect(res.body.sat_close).to.eql(newHours.sat_close)
                        expect(res.body.hours_owner).to.eql(newHours.hours_owner)
                        expect(res.body).to.have.property('hours_id')
                        expect(res.headers.location).to.eql(`/api/hours/${newHours.hours_id}`)
                    })
                    .then(res =>
                        supertest(app)
                            .get(`/api/hours/${res.body.hours_id}`)
                            .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                            .expect(res.body)
                    );
            });

            //TODO add more tests
            //validation tests
            /* context(`responds with 400 Error for POST /api/users and posts when name is shorter than 3`, () => {
                return supertest(app)
                    .post('/api/hours')
                    .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                    .send({
                        cat_name: 'an'
                    })
                    .expect(400, { "error": { message: `Hours must be more than 3 and less than 7 characters.` } });
            }); */

            //check for missing hours
            const requiredFields = ['sun_open', 'sun_close', 'mon_open', 'mon_close', 'tues_open', 'tues_close',
                'wed_open', 'wed_close', 'thu_open', 'thu_close', 'fri_open', 'fri_close', 'sat_open', 'sat_close', 'hours_owner'];

            requiredFields.forEach(field => {
                const newHours = {
                    hours_id: 1,
                    sun_open: "testP",
                    sun_close: "testP",
                    mon_open: "testP",
                    mon_close: "testP",
                    tues_open: "testP",
                    tues_close: "testP",
                    wed_open: "testP",
                    wed_close: "testP",
                    thu_open: "testP",
                    thu_close: "testP",
                    fri_open: "testP",
                    fri_close: "testP",
                    sat_open: "testP",
                    sat_close: "testP",
                    hours_owner: "test-user-1",
                }

                it(`responds with 400 and an error message when the '${field}' is missing`, () => {
                    delete newHours[field]

                    return supertest(app)
                        .post('/api/hours')
                        .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                        .send(newHours)
                        .expect(400, {
                            error: { message: `Missing '${field}' in request body` }
                        })
                })
            })

            context('removes XSS attack hours input from response', () => {
                const { maliciousHours, expectedHours } = helpers.makeMaliciousHours();
                return supertest(app)
                    .post(`/api/hours`)
                    .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                    .send(maliciousHours)
                    .expect(201)
                    .expect(res => {
                        expect(res.body.cat_name).to.eql(expectedHours.cat_name);
                    });
                expect(res.body[0].cat_name).to.eql(expectedHours.cat_name);
            });
        });

        describe(`GET /api/hours/:hours_id`, () => {
            context(`Given no hours`, () => {
                it(`responds with 404`, () => {
                    const hourId = 123456;
                    return supertest(app)
                        .get(`/api/hours/${hourId}`)
                        .expect(404, { error: { message: `There are no hours.` } });
                });
            });

            context('Given there are hours in the database', () => {
                const testHours = helpers.makeHoursArray();
                const testUsers = helpers.makeUsersArray();
                beforeEach('insert hours', () => {
                    return db
                        .into('cachow_users')
                        .insert(testUsers)
                        .then(() => {
                            return db
                                .into('restaurant_hours')
                                .insert(testHours);
                        });
                });

                it('responds with 200 and the specified hours', () => {
                    const hourId = 2;
                    const expectedHours = testHours[hourId - 1];
                    return supertest(app)
                        .get(`/api/hours/${hourId}`)
                        .expect(200, expectedHours);
                });
            });

            context(`Given an XSS attack hours input`, () => {
                const testHours = helpers.makeHoursArray();
                const testUsers = helpers.makeUsersArray();
                const { maliciousHours, expectedHours } = helpers.makeMaliciousHours();
                beforeEach('insert malicious hours', () => {
                    return db
                        .into('cachow_users')
                        .insert(testUsers)
                        .then(() => {
                            return db
                                .into('restaurant_hours')
                                .insert([maliciousHours]);
                        });
                });

                it('removes XSS attack content', () => {
                    return supertest(app)
                        .get(`/api/hours/${maliciousHours.hours_id}`)
                        .expect(200)
                        .expect(res => {
                            expect(res.body.sun_open).to.eql(expectedHours.sun_open)
                            expect(res.body.sun_close).to.eql(expectedHours.sun_close)
                            expect(res.body.mon_open).to.eql(expectedHours.mon_open)
                            expect(res.body.mon_close).to.eql(expectedHours.mon_close)
                            expect(res.body.tues_open).to.eql(expectedHours.tues_open)
                            expect(res.body.tues_close).to.eql(expectedHours.tues_close)
                            expect(res.body.wed_open).to.eql(expectedHours.wed_open)
                            expect(res.body.wed_close).to.eql(expectedHours.wed_close)
                            expect(res.body.thu_open).to.eql(expectedHours.thu_open)
                            expect(res.body.thu_close).to.eql(expectedHours.thu_close)
                            expect(res.body.fri_open).to.eql(expectedHours.fri_open)
                            expect(res.body.fri_close).to.eql(expectedHours.fri_close)
                            expect(res.body.sat_open).to.eql(expectedHours.sat_open)
                            expect(res.body.sat_close).to.eql(expectedHours.sat_close)
                            expect(res.body.hours_owner).to.eql(expectedHours.hours_owner)
                        });
                });
            });
        });

        describe(`DELETE /api/hours/:hours_id`, () => {
            const testUsers = helpers.makeUsersArray();
            context(`Given no hours`, () => {
                it(`responds with 404`, () => {
                    const hourId = 123456
                    return supertest(app)
                        .delete(`/api/hours/${hourId}`)
                        .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                        .expect(404, { error: { message: `There are no hours.` } })
                });
            });

            context('Given there are hours in the database', () => {
                const testHours = helpers.makeHoursArray();
                const testUsers = helpers.makeUsersArray();
                beforeEach('insert hours', () => {
                    return db
                        .into('cachow_users')
                        .insert(testUsers)
                        .then(() => {
                            return db
                                .into('restaurant_hours')
                                .insert(testHours);
                        });
                });

                it('responds with 204 and removes the hours', () => {
                    const idToRemove = 2;
                    const expectedHours = testHours.filter(hour => hour.hours_id !== idToRemove);
                    return supertest(app)
                        .delete(`/api/hours/${idToRemove}`)
                        .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                        .expect(204)
                        .then(res =>
                            supertest(app)
                                .get(`/api/hours`)
                                .expect(expectedHours)
                        );
                });
            });
        });

        describe(`PATCH /api/hours/:hours_id`, () => {
            const testHours = helpers.makeHoursArray();
            const testUsers = helpers.makeUsersArray();
            beforeEach('insert hours', () => {
                return db
                    .into('cachow_users')
                    .insert(testUsers)
                    .then(() => {
                        return db
                            .into('restaurant_hours')
                            .insert(testHours);
                    });
            });

            context(`Given no hours`, () => {
                it(`responds with 404`, () => {
                    const hourId = 123456;
                    return supertest(app)
                        .patch(`/api/hours/${hourId}`)
                        .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                        .expect(404, { error: { message: `There are no hours.` } })
                });
            });

            context('Given there are hours in the database', () => {

                it('responds with 204 and updates the hours', () => {
                    const idToUpdate = 2
                    const updateHours = {
                        sun_open: "testU",
                        sun_close: "testU",
                        mon_open: "testU",
                        mon_close: "testU",
                        tues_open: "testU",
                        tues_close: "testU",
                        wed_open: "testU",
                        wed_close: "testU",
                        thu_open: "testU",
                        thu_close: "testU",
                        fri_open: "testU",
                        fri_close: "testU",
                        sat_open: "testU",
                        sat_close: "testU",
                        hours_owner: "test-user-1",
                    }
                    const expectedHours = {
                        ...testHours[idToUpdate - 1],
                        ...updateHours
                    }
                    return supertest(app)
                        .patch(`/api/hours/${idToUpdate}`)
                        .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                        .send(updateHours)
                        .expect(204)
                        .then(res =>
                            supertest(app)
                                .get(`/api/hours/${idToUpdate}`)
                                .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                                .expect(expectedHours)
                        );
                });

                context('removes XSS attack hour input from response', () => {
                    const { maliciousHours, expectedHours } = helpers.makeMaliciousHours();
                    const idToUpdate = 2;
                    return supertest(app)
                        .patch(`/api/hours${idToUpdate}`)
                        .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                        .send(maliciousHours)
                        .expect(201)
                        .expect(res => {
                            expect(res.body.sun_open).to.eql(expectedHours.sun_open)
                            expect(res.body.sun_close).to.eql(expectedHours.sun_close)
                            expect(res.body.mon_open).to.eql(expectedHours.mon_open)
                            expect(res.body.mon_close).to.eql(expectedHours.mon_close)
                            expect(res.body.tues_open).to.eql(expectedHours.tues_open)
                            expect(res.body.tues_close).to.eql(expectedHours.tues_close)
                            expect(res.body.wed_open).to.eql(expectedHours.wed_open)
                            expect(res.body.wed_close).to.eql(expectedHours.wed_close)
                            expect(res.body.thu_open).to.eql(expectedHours.thu_open)
                            expect(res.body.thu_close).to.eql(expectedHours.thu_close)
                            expect(res.body.fri_open).to.eql(expectedHours.fri_open)
                            expect(res.body.fri_close).to.eql(expectedHours.fri_close)
                            expect(res.body.sat_open).to.eql(expectedHours.sat_open)
                            expect(res.body.sat_close).to.eql(expectedHours.sat_close)
                            expect(res.body.hours_owner).to.eql(expectedHours.hours_owner)
                        });
                });

                it(`responds with 400 when no required fields are supplied`, () => {
                    const idToUpdate = 2;
                    return supertest(app)
                        .patch(`/api/hours/${idToUpdate}`)
                        .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                        .send({ irrelevantField: 'foo' })
                        .expect(400, {
                            error: {
                                message: `Request body must contain 'hours_id' in request body`
                            }
                        });
                });

                it(`responds with 204 when updating only a subset of fields`, () => {
                    const idToUpdate = 2;
                    const updateHours = {
                        sun_open: "testU",
                        sun_close: "testU",
                        mon_open: "testU",
                        mon_close: "testU",
                        tues_open: "testU",
                        tues_close: "testU",
                        wed_open: "testU",
                        wed_close: "testU",
                        thu_open: "testU",
                        thu_close: "testU",
                        fri_open: "testU",
                        fri_close: "testU",
                        sat_open: "testU",
                        sat_close: "testU",
                        hours_owner: "test-user-1",
                    }
                    const expectedHours = {
                        ...testHours[idToUpdate - 1],
                        ...updateHours
                    }

                    return supertest(app)
                        .patch(`/api/hours/${idToUpdate}`)
                        .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                        .send({
                            ...updateHours,
                            fieldToIgnore: 'should not be in GET response'
                        })
                        .expect(204)
                        .then(res =>
                            supertest(app)
                                .get(`/api/hours/${idToUpdate}`)
                                .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                                .expect(expectedHours)
                        );
                });
            });
        });
    });
});