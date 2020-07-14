const path = require('path')
const express = require('express')
const logger = require('../logger');
const RestaurantService = require('./restaurants-service');
const { requireAuth } = require('../middleware/jwt-auth')

const restaurantRouter = express.Router()
const jsonParser = express.json()

restaurantRouter
    .route('/')
    .get((req, res, next) => {
        RestaurantService.getAllRestaurants(req.app.get('db'))
            .then(restaurants => {
                res.json(restaurants.map(RestaurantService.serializeRestaurant))
            })
            .catch(next)
    })
    .post(requireAuth, jsonParser, (req, res, next) => {
        const { r_owner, r_image, r_type, r_name, r_address, r_city, r_state, r_zip, r_phone, r_hours } = req.body
        const newRestaurant = { r_owner, r_image, r_type, r_name, r_address, r_city, r_state, r_zip, r_phone, r_hours };

        //check to see all keys are in the response body
        for (const [key, value] of Object.entries(newRestaurant)) {
            if (value == null) {
                logger.error({
                    message: `Missing '${key}' in request body`,
                    request: `${req.originalUrl}`,
                    method: `${req.method}`,
                    ip: `${req.ip}`
                });
                return res.status(400).send({
                    error: { message: `Missing '${key}' in request body` }
                });
            }
        }

        const error = RestaurantService.validateRestaurant(newRestaurant);
        if (error) {
            logger.error({
                message: `POST Validation Error`,
                request: `${req.originalUrl}`,
                method: `${req.method}`
            });
            return res.status(400).send(error);
        }

        RestaurantService.insertRestaurant(req.app.get('db'), newRestaurant)
            .then(restaurant => {
                res
                    .status(201)
                    .location(path.posix.join(req.originalUrl, `/${restaurant.r_id}`))
                    .json(RestaurantService.serializeRestaurant(restaurant))
            })
            .catch(next)
    })

restaurantRouter
    .route('/:r_id')
    .all((req, res, next) => {
        RestaurantService.getById(req.app.get('db'), req.params.r_id)
            .then(restaurant => {
                if (!restaurant) {
                    return res.status(404).json({
                        error: { message: `Sorry there is no restaurant associated with that id.` }
                    })
                }
                res.restaurant = restaurant
                next()
            })
            .catch(next)
    })
    .get((req, res, next) => {
        res.json(RestaurantService.serializeRestaurant(res.restaurant))
    })
    .delete(requireAuth, (req, res, next) => {
        RestaurantService.deleteRestaurant(req.app.get('db'), req.params.r_id)
            .then(numRowsAffected => {
                res.status(204).end()
            })
            .catch(next)
    })

    .patch(requireAuth, jsonParser, (req, res, next) => {
        const { r_owner, r_image, r_type, r_name, r_address, r_city, r_state, r_zip, r_phone, r_hours } = req.body
        const updateRestaurant = { r_owner, r_image, r_type, r_name, r_address, r_city, r_state, r_zip, r_phone, r_hours };

        const numberOfValues = Object.values(updateRestaurant).filter(Boolean).length

        for (const [key, value] of Object.entries(updateRestaurant)) {
            if (numberOfValues === 0) {
                return res.status(400).json({
                    error: {
                        message: `Request body must contain '${key}' in request body`
                    }
                })
            }
        }

        const error = RestaurantService.validateRestaurant(updateRestaurant);
        if (error) {
            logger.error({
                message: `PATCH Validation Error`,
                request: `${req.originalUrl}`,
                method: `${req.method}`,
                ip: `${req.ip}`
            });
            return res.status(400).send(error);
        }

        RestaurantService.updateRestaurant(
            req.app.get('db'), req.params.r_id, updateRestaurant
        )
            .then(numRowsAffected => {
                res.status(204).end()
            })
            .catch(next)
    });

module.exports = restaurantRouter;