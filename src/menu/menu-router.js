const path = require('path')
const express = require('express')
const logger = require('../logger');
const MenuService = require('./menu-service');
const { requireAuth } = require('../middleware/jwt-auth');

const menuRouter = express.Router()
const jsonParser = express.json()

menuRouter
    .route('/')
    .get((req, res, next) => {
        MenuService.getAllItems(
            req.app.get('db')
        )
            .then(items => {
                res.json(items.map(MenuService.serializeItem))
            })
            .catch(next)
    })
    .post(requireAuth, jsonParser, (req, res, next) => {
        const { item_restaurant, item_name, item_cat, item_price } = req.body
        const newItem = { item_restaurant, item_name, item_cat, item_price };

        //check to see all keys are in the response body
        for (const [key, value] of Object.entries(newItem)) {
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

        //validate the folder
        const error = MenuService.validateItem(newItem);
        if (error) {
            logger.error({
                message: `POST Validation Error`,
                request: `${req.originalUrl}`,
                method: `${req.method}`
            });
            return res.status(400).send(error);
        }

        MenuService.insertItem(
            req.app.get('db'),
            newItem
        )
            .then(items => {
                res
                    .status(201)
                    .location(path.posix.join(req.originalUrl, `/${items.item_id}`))
                    .json(MenuService.serializeItem(items))
            })
            .catch(next)
    })

menuRouter
    .route('/:item_id')
    .all((req, res, next) => {
        MenuService.getById(
            req.app.get('db'),
            req.params.item_id
        )
            .then(items => {
                if (!items) {
                    return res.status(404).json({
                        error: { message: `There are no menu items.` }
                    })
                }
                res.items = items
                next()
            })
            .catch(next)
    })
    .get((req, res, next) => {
        res.json(MenuService.serializeItem(res.items))
    })
    .delete(requireAuth, (req, res, next) => {
        MenuService.deleteItem(
            req.app.get('db'),
            req.params.item_id
        )
            .then(numRowsAffected => {
                res.status(204).end()
            })
            .catch(next)
    })

    .patch(requireAuth, jsonParser, (req, res, next) => {
        const { item_restaurant, item_name, item_cat, item_price } = req.body;
        const updateItem = { item_restaurant, item_name, item_cat, item_price };

        const numberOfValues = Object.values(updateItem).filter(Boolean).length

        for (const [key, value] of Object.entries(updateItem)) {
            if (numberOfValues === 0) {
                return res.status(400).json({
                    error: {
                        message: `Request body must contain '${key}' in request body`
                    }
                })
            }
        }

        const error = MenuService.validateItem(updateItem);
        if (error) {
            logger.error({
                message: `PATCH Validation Error`,
                request: `${req.originalUrl}`,
                method: `${req.method}`,
                ip: `${req.ip}`
            });
            return res.status(400).send(error);
        }

        MenuService.updateItem(
            req.app.get('db'),
            req.params.item_id,
            updateItem
        )
            .then(numRowsAffected => {
                res.status(204).end()
            })
            .catch(next)
    })

module.exports = menuRouter;