const knex = require('knex');
const app = require('../src/app');
const helpers = require('./test-helpers');

describe('Category Endpoints for Cachow', function () {
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
    before('clean the table', () => db.raw('TRUNCATE cachow_categories, cachow_users RESTART IDENTITY CASCADE'));
    afterEach('cleanup', () => db.raw('TRUNCATE cachow_categories, cachow_users RESTART IDENTITY CASCADE'));

    //test for unauthorized requests at each endpoint for categories
    describe(`Unauthorized requests`, () => {
        const testCategories = helpers.makeCategoriesArray();

        beforeEach('insert category', () => {
            return db.into('cachow_categories').insert(testCategories);
        });

        it(`responds with 401 Unauthorized for POST /api/category`, () => {
            return supertest(app)
                .post('/api/category')
                .send({
                    cat_name: 'Another test Category for Post Test Unauthorized'
                })
                .expect(401, { error: 'Unauthorized request' });
        });

        it(`responds with 401 Unauthorized for DELETE /api/category/:cat_id`, () => {
            const testCat = testCategories[1];
            return supertest(app)
                .delete(`/api/category/${testCat.cat_id}`)
                .expect(401, { error: 'Unauthorized request' });
        });

        it(`responds with 401 Unauthorized for PATCH /api/category/:cat_id`, () => {
            const testCat = testCategories[1];
            return supertest(app)
                .patch(`/api/category/${testCat.cat_id}`)
                .expect(401, { error: 'Unauthorized request' });
        });
    });

    //check the authorized GET Categories Endpoint
    describe(`Authorized requests`, () => {
        describe(`GET all categories /api/category`, () => {
            context(`Given there are NO categories in database`, () => {
                it(`responds with 200 and an empty list`, () => {
                    return supertest(app)
                        .get('/api/category')
                        .expect(200, [])
                });
            });

            context('Given there are categories in the database', () => {
                const testCat = helpers.makeCategoriesArray();
                beforeEach('insert categories', () => {
                    return db
                        .into('cachow_categories')
                        .insert(testCat)
                })

                it('responds with 200 and all of the categories for GET', () => {
                    return supertest(app)
                        .get('/api/category')
                        .expect(200, testCat)
                });
            });

            context(`Given an XSS attack category name`, () => {
                const { maliciousCategory, expectedCategory } = helpers.makeMaliciousCategory();

                beforeEach('insert malicious category name', () => {
                    return db.into('cachow_categories').insert(maliciousCategory);
                });

                it('removes XSS attack category name', () => {
                    return supertest(app)
                        .get(`/api/category`)
                        .expect(200)
                        .expect(res => {
                            expect(res.body[0].cat_name).to.eql(expectedCategory.cat_name);
                        });
                });
            });
        });

        describe(`POST /api/category`, () => {
            const testUsers = helpers.makeUsersArray();

            beforeEach('insert users', () =>
                helpers.seedUsers(db, testUsers)
            )

            it(`creates a category, responding with 201 and the new category`, () => {
                const newCat = {
                    cat_id: 1,
                    cat_name: 'Test Category Post'
                }

                return supertest(app)
                    .post('/api/category')
                    .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                    .send(newCat)
                    .expect(201)
                    .expect(res => {
                        expect(res.body.cat_name).to.eql(newCat.cat_name)
                        expect(res.body).to.have.property('cat_id')
                        expect(res.headers.location).to.eql(`/api/category/${newCat.cat_id}`)
                    })
                    .then(res =>
                        supertest(app)
                            .get(`/api/category/${res.body.cat_id}`)
                            .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                            .expect(res.body)
                    );
            });

            context(`responds with 400 Error for POST /api/category and posts when name is shorter than 3`, () => {
                return supertest(app)
                    .post('/api/category')
                    .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                    .send({
                        cat_name: 'an'
                    })
                    .expect(400, { "error": { message: `Category name must be more than 3 and less than 50 characters.` } });
            });

            //check for missing category
            const requiredFields = ['cat_name'];
            requiredFields.forEach(field => {
                const newCat = {
                    cat_name: 'Test Category Post',
                }

                it(`responds with 400 and an error message when the '${field}' is missing`, () => {
                    delete newCat[field]

                    return supertest(app)
                        .post('/api/category')
                        .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                        .send(newCat)
                        .expect(400, {
                            error: { message: `Missing '${field}' in request body` }
                        })
                })
            })

            context('removes XSS attack category name from response', () => {
                const { maliciousCategory, expectedCategory } = helpers.makeMaliciousCategory();
                return supertest(app)
                    .post(`/api/category`)
                    .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                    .send(maliciousCategory)
                    .expect(201)
                    .expect(res => {
                        expect(res.body.cat_name).to.eql(expectedCategory.cat_name);
                    });
            });
        });

        describe(`GET /api/category/:cat_id`, () => {
            context(`Given no category`, () => {
                it(`responds with 404`, () => {
                    const catId = 123456;
                    return supertest(app)
                        .get(`/api/category/${catId}`)
                        .expect(404, { error: { message: `Category doesn't exist` } });
                });
            });

            context('Given there are categories in the database', () => {
                const testCat = helpers.makeCategoriesArray();

                beforeEach('insert category', () => {
                    return db.into('cachow_categories').insert(testCat);
                });

                it('responds with 200 and the specified category', () => {
                    const catId = 2;
                    const expectedCategory = testCat[catId - 1];
                    return supertest(app)
                        .get(`/api/category/${catId}`)
                        .expect(200, expectedCategory);
                });
            });

            context(`Given an XSS attack category name`, () => {
                const testCat = helpers.makeCategoriesArray();
                const { maliciousCategory, expectedCategory } = helpers.makeMaliciousCategory();

                beforeEach('insert malicious category', () => {
                    return db
                        .into('cachow_categories')
                        .insert(testCat)
                        .then(() => {
                            return db.into('cachow_categories').insert([maliciousCategory]);
                        });
                });

                it('removes XSS attack content', () => {
                    return supertest(app)
                        .get(`/api/category/${maliciousCategory.cat_id}`)
                        .expect(200)
                        .expect(res => {
                            expect(res.body.cat_name).to.eql(expectedCategory.cat_name);
                        });
                });
            });
        });

        describe(`DELETE /api/category/:cat_id`, () => {
            const testUsers = helpers.makeUsersArray();
            beforeEach('insert users', () =>
                helpers.seedUsers(db, testUsers)
            )

            context(`Given no categories`, () => {
                it(`responds with 404`, () => {
                    const catId = 123456
                    return supertest(app)
                        .delete(`/api/category/${catId}`)
                        .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                        .expect(404, { error: { message: `Category doesn't exist` } })
                });
            });

            context('Given there are categories in the database', () => {
                const testCat = helpers.makeCategoriesArray()

                beforeEach('insert categories', () => {
                    return db
                        .into('cachow_categories')
                        .insert(testCat)
                })

                it('responds with 204 and removes the category', () => {
                    const idToRemove = 2;
                    const expectedCategories = testCat.filter(cat => cat.cat_id !== idToRemove);
                    return supertest(app)
                        .delete(`/api/category/${idToRemove}`)
                        .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                        .expect(204)
                        .then(res =>
                            supertest(app)
                                .get(`/api/category`)
                                .expect(expectedCategories)
                        );
                });
            });
        });

        describe(`PATCH /api/category/:cat_id`, () => {
            const testUsers = helpers.makeUsersArray();
            beforeEach('insert users', () =>
                helpers.seedUsers(db, testUsers)
            )

            context(`Given no categories`, () => {
                it(`responds with 404`, () => {
                    const catId = 123456;
                    return supertest(app)
                        .patch(`/api/category/${catId}`)
                        .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                        .expect(404, { error: { message: `Category doesn't exist` } })
                });
            });

            context('Given there are categories in the database', () => {
                const testCat = helpers.makeCategoriesArray()

                beforeEach('insert categories', () => {
                    return db
                        .into('cachow_categories')
                        .insert(testCat)
                })

                it('responds with 204 and updates the category', () => {
                    const idToUpdate = 2
                    const updateCategory = {
                        cat_name: 'updated category name',
                    }
                    const expectedCat = {
                        ...testCat[idToUpdate - 1],
                        ...updateCategory
                    }
                    return supertest(app)
                        .patch(`/api/category/${idToUpdate}`)
                        .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                        .send(updateCategory)
                        .expect(204)
                        .then(res =>
                            supertest(app)
                                .get(`/api/category/${idToUpdate}`)
                                .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                                .expect(expectedCat)
                        );
                });

                context('removes XSS attack category name from response', () => {
                    const { maliciousCategory, expectedCategory } = helpers.makeMaliciousCategory();
                    const idToUpdate = 2;
                    return supertest(app)
                        .patch(`/api/category${idToUpdate}`)
                        .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                        .send(maliciousCategory)
                        .expect(201)
                        .expect(res => {
                            expect(res.body.cat_name).to.eql(expectedCategory.cat_name);
                        });
                });

                it(`responds with 400 when no required fields are supplied`, () => {
                    const idToUpdate = 2;
                    return supertest(app)
                        .patch(`/api/category/${idToUpdate}`)
                        .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                        .send({ irrelevantField: 'foo' })
                        .expect(400, {
                            error: {
                                message: `Request body must contain a 'name'`
                            }
                        });
                });

                it(`responds with 204 when updating only a subset of fields`, () => {
                    const idToUpdate = 2;
                    const updateCat = {
                        cat_name: 'Updated Category Name',
                    }
                    const expectedCat = {
                        ...testCat[idToUpdate - 1],
                        ...updateCat
                    }

                    return supertest(app)
                        .patch(`/api/category/${idToUpdate}`)
                        .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                        .send({
                            ...updateCat,
                            fieldToIgnore: 'should not be in GET response'
                        })
                        .expect(204)
                        .then(res =>
                            supertest(app)
                                .get(`/api/category/${idToUpdate}`)
                                .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                                .expect(expectedCat)
                        );
                });
            });
        });
    });
});