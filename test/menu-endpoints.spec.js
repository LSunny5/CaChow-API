const knex = require('knex');
const app = require('../src/app');
const helpers = require('./test-helpers');

describe('Menu Item Endpoints for Cachow', function () {
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
    before('clean the table', () => db.raw('TRUNCATE restaurant_menu, cachow_restaurants, restaurant_hours, cachow_categories, cachow_users RESTART IDENTITY CASCADE'));
    afterEach('cleanup', () => db.raw('TRUNCATE restaurant_menu, cachow_restaurants, restaurant_hours, cachow_categories, cachow_users RESTART IDENTITY CASCADE'));

    //test for unauthorized requests at each endpoint for restaurant items
    describe(`Unauthorized requests`, () => {
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

        it(`responds with 401 Unauthorized for POST /api/menu`, () => {
            return supertest(app)
                .post('/api/menu')
                .send({
                    item_restaurant: 1,
                    item_name: 'TestItem',
                    item_cat: 1,
                    item_price: '$11.11',
                })
                .expect(401, { error: 'Unauthorized request' });
        });

        it(`responds with 401 Unauthorized for DELETE /api/menu/:item_id`, () => {
            const testI = testItems[1];
            return supertest(app)
                .delete(`/api/menu/${testI.item_id}`)
                .expect(401, { error: 'Unauthorized request' });
        });

        it(`responds with 401 Unauthorized for PATCH /api/menu/:item_id`, () => {
            const testI = testItems[1];
            return supertest(app)
                .patch(`/api/menu/${testI.item_id}`)
                .expect(401, { error: 'Unauthorized request' });
        });
    });

    //check the authorized GET menu Endpoint
    describe(`Authorized requests`, () => {
        describe(`GET all menu items /api/menu`, () => {
            context(`Given there are NO items in database`, () => {
                it(`responds with 200 and an empty list`, () => {
                    return supertest(app)
                        .get('/api/menu')
                        .expect(200, [])
                });
            });

            context('Given there are items in the database', () => {
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

                it('responds with 200 all of the items for GET', () => {
                    return supertest(app)
                        .get(`/api/menu`)
                        .expect(200, testItems);
                });
            });
        });

        context(`Given an XSS attack menu input`, () => {
            const { maliciousItems, expectedItems } = helpers.makeMaliciousItems();
            const testUsers = helpers.makeUsersArray();
            const testCategories = helpers.makeCategoriesArray();
            const testHours = helpers.makeHoursArray();
            const testRestaurants = helpers.makeRestaurantsArray();
            beforeEach('insert malicious items', () => {
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
                                                    .insert(maliciousItems);
                                            });
                                    });
                            });
                    });
            });

            it('removes XSS attack menu input', () => {
                return supertest(app)
                    .get(`/api/menu`)
                    .expect(200)
                    .expect(res => {
                        expect(res.body[0].item_restaurant).to.eql(expectedItems.item_restaurant);
                        expect(res.body[0].item_name).to.eql(expectedItems.item_name);
                        expect(res.body[0].item_cat).to.eql(expectedItems.item_cat);
                        expect(res.body[0].item_price).to.eql(expectedItems.item_price);
                    });
            });
        });
    });

    describe(`POST /api/menu`, () => {
        const testUsers = helpers.makeUsersArray();
        const testCategories = helpers.makeCategoriesArray();
        const testHours = helpers.makeHoursArray();
        const testRestaurants = helpers.makeRestaurantsArray();
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
                                });

                        });

                });
        });

        it(`creates menu, responding with 201 and the new items`, () => {
            const newItem = {
                item_id: 1,
                item_restaurant: 1,
                item_name: 'NewItem',
                item_cat: 1,
                item_price: '$0.00',
            }

            return supertest(app)
                .post('/api/menu')
                .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                .send(newItem)
                .expect(201)
                .expect(res => {
                    expect(res.body.item_restaurant).to.eql(newItem.item_restaurant);
                    expect(res.body.item_name).to.eql(newItem.item_name);
                    expect(res.body.item_cat).to.eql(newItem.item_cat);
                    expect(res.body.item_price).to.eql(newItem.item_price);
                })
                .then(res =>
                    supertest(app)
                        .get(`/api/menu/${res.body.item_id}`)
                        .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                        .expect(res.body)
                );
        });

        //validation tests TODO
        /* context(`responds with 400 Error for POST /api/menu and posts when name is shorter than 3`, () => {
            return supertest(app)
                .post('/api/menu')
                .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                .send({
                    item_name: 'a'
                })
                .expect(400, { "error": { message: `Item name must be more than 3 and less than 25 characters.` } });
        }); */

        //check for missing item fields
        const requiredFields = ['item_restaurant', 'item_name', 'item_cat', 'item_price'];

        requiredFields.forEach(field => {
            const newItem = {
                item_id: 1,
                item_restaurant: 1,
                item_name: 'NewItem',
                item_cat: 1,
                item_price: '$0.00',
            }

            it(`responds with 400 and an error message when the '${field}' is missing`, () => {
                delete newItem[field]

                return supertest(app)
                    .post('/api/menu')
                    .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                    .send(newItem)
                    .expect(400, {
                        error: { message: `Missing '${field}' in request body` }
                    })
            })
        })

        context('removes XSS attack menu item input from response', () => {
            const { maliciousItems, expectedItems } = helpers.makeMaliciousItems();
            return supertest(app)
                .post(`/api/menu`)
                .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                .send(maliciousItems)
                .expect(201)
                .expect(res => {
                    expect(res.body.item_restaurant).to.eql(expectedItems.item_restaurant);
                    expect(res.body.item_name).to.eql(expectedItems.item_name);
                    expect(res.body.item_cat).to.eql(expectedItems.item_cat);
                    expect(res.body.item_price).to.eql(expectedItems.item_price);
                });
        });
    });

    describe(`GET /api/menu/:item_id`, () => {
        context(`Given no items`, () => {
            it(`responds with 404`, () => {
                const menuId = 123456;
                return supertest(app)
                    .get(`/api/menu/${menuId}`)
                    .expect(404, { error: { message: `There are no menu items.` } });
            });
        });

        context('Given there are items in the database', () => {
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

            it('responds with 200 and the specified items', () => {
                const menuId = 2;
                const expectedItems = testItems[menuId - 1];
                return supertest(app)
                    .get(`/api/menu/${menuId}`)
                    .expect(200, expectedItems);
            });
        });

        context(`Given an XSS attack items input`, () => {
            const { maliciousItems, expectedItems } = helpers.makeMaliciousItems();
            const testUsers = helpers.makeUsersArray();
            const testCategories = helpers.makeCategoriesArray();
            const testHours = helpers.makeHoursArray();
            const testRestaurants = helpers.makeRestaurantsArray();
            beforeEach('insert malicious items', () => {
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
                                                    .insert(maliciousItems);
                                            });
                                    });
                            });
                    });
            });

            it('removes XSS attack content', () => {
                return supertest(app)
                    .get(`/api/menu/${maliciousItems.item_id}`)
                    .expect(200)
                    .expect(res => {
                        expect(res.body.item_restaurant).to.eql(expectedItems.item_restaurant);
                        expect(res.body.item_name).to.eql(expectedItems.item_name);
                        expect(res.body.item_cat).to.eql(expectedItems.item_cat);
                        expect(res.body.item_price).to.eql(expectedItems.item_price);
                    });
            });
        });
    });

    describe(`DELETE /api/menu/:item_id`, () => {
        const testUsers = helpers.makeUsersArray();
        context(`Given no items`, () => {
            it(`responds with 404`, () => {
                const menuId = 123456
                return supertest(app)
                    .delete(`/api/menu/${menuId}`)
                    .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                    .expect(404, { error: { message: `There are no menu items.` } })
            });
        });

        context('Given there are items in the database', () => {
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

            it('responds with 204 and removes the items', () => {
                const idToRemove = 2;
                const expectedItems = testItems.filter(item => item.item_id !== idToRemove);
                return supertest(app)
                    .delete(`/api/menu/${idToRemove}`)
                    .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                    .expect(204)
                    .then(res =>
                        supertest(app)
                            .get(`/api/menu`)
                            .expect(expectedItems)
                    );
            });
        });
    });

    describe(`PATCH /api/menu/:item_id`, () => {
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

        context(`Given no items`, () => {
            it(`responds with 404`, () => {
                const menuId = 123456;
                return supertest(app)
                    .patch(`/api/menu/${menuId}`)
                    .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                    .expect(404, { error: { message: `There are no menu items.` } })
            });
        });

        context('Given there are items in the database', () => {
            it('responds with 204 and updates the items', () => {
                const idToUpdate = 2
                const updateItems = {
                    item_restaurant: 2,
                    item_name: 'UpdateItem',
                    item_cat: 2,
                    item_price: '$33.33',
                }
                const expectedItems = {
                    ...testItems[idToUpdate - 1],
                    ...updateItems
                }
                return supertest(app)
                    .patch(`/api/menu/${idToUpdate}`)
                    .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                    .send(updateItems)
                    .expect(204)
                    .then(res =>
                        supertest(app)
                            .get(`/api/menu/${idToUpdate}`)
                            .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                            .expect(expectedItems)
                    );
            });

            context('removes XSS attack hour input from response', () => {
                const { maliciousItems, expectedItems } = helpers.makeMaliciousItems();
                const idToUpdate = 2;
                return supertest(app)
                    .patch(`/api/menu/${idToUpdate}`)
                    .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                    .send(maliciousItems)
                    .expect(201)
                    .expect(res => {
                        expect(res.body.item_restaurant).to.eql(expectedItems.item_restaurant);
                        expect(res.body.item_name).to.eql(expectedItems.item_name);
                        expect(res.body.item_cat).to.eql(expectedItems.item_cat);
                        expect(res.body.item_price).to.eql(expectedItems.item_price);
                    });
            });

            it(`responds with 400 when no required fields are supplied`, () => {
                const idToUpdate = 2;
                return supertest(app)
                    .patch(`/api/menu/${idToUpdate}`)
                    .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                    .send({ irrelevantField: 'foo' })
                    .expect(400, {
                        error: {
                            message: `Request body must contain 'item_restaurant' in request body`
                        }
                    });
            });

            it(`responds with 204 when updating only a subset of fields`, () => {
                const idToUpdate = 2;
                const updateItems = {
                    item_restaurant: 2,
                    item_name: 'UpdateItem',
                    item_cat: 2,
                    item_price: '$33.33',
                }
                const expectedItems = {
                    ...testItems[idToUpdate - 1],
                    ...updateItems
                }

                return supertest(app)
                    .patch(`/api/menu/${idToUpdate}`)
                    .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                    .send({
                        ...updateItems,
                        fieldToIgnore: 'should not be in GET response'
                    })
                    .expect(204)
                    .then(res =>
                        supertest(app)
                            .get(`/api/menu/${idToUpdate}`)
                            .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                            .expect(expectedItems)
                    );
            });
        });
    });
});