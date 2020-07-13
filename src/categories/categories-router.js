const path = require('path')
const express = require('express')
const xss = require('xss')
const logger = require('../logger');
const { CategoryValidate } = require('./validate-category');
const CategoriesService = require('./categories-service');

const categoriesRouter = express.Router()
const jsonParser = express.json()

//check for xss attacks on category
const serializeCategory = category => ({
    cat_id: category.cat_id,
    cat_name: xss(category.cat_name),
})

categoriesRouter
    .route('/')
    .get((req, res, next) => {
        CategoriesService.getAllCategories(
            req.app.get('db')
        )
            .then(categories => {
                res.json(categories.map(serializeCategory))
            })
            .catch(next)
    })
    .post(jsonParser, (req, res, next) => {
        const { cat_name } = req.body
        const newCategory = { cat_name }

        for (const field of ['cat_name']) {
            if (!req.body[field]) {
                logger.error({
                    message: `Missing '${field}' in request body`,
                    request: `${req.originalUrl}`,
                    method: `${req.method}`,
                    ip: `${req.ip}`
                });
                return res.status(400).send({
                    error: { message: `Missing '${field}' in request body` }
                });
            };
        };

        //validate the category
        const error = CategoryValidate(newCategory.cat_name);
        if (error) {
            logger.error({
                message: `POST Validation Error`,
                request: `${req.originalUrl}`,
                method: `${req.method}`
            });
            return res.status(400).send(error);
        }

        CategoriesService.insertCategory(
            req.app.get('db'),
            newCategory
        )
            .then(category => {
                res
                    .status(201)
                    .location(path.posix.join(req.originalUrl, `/${category.cat_id}`))
                    .json(serializeCategory(category))
            })
            .catch(next);
    })

categoriesRouter
    .route('/:cat_id')
    .all((req, res, next) => {
        CategoriesService.getById(
            req.app.get('db'),
            req.params.cat_id
        )
            .then(category => {
                if (!category) {
                    return res.status(404).json({
                        error: { message: `Category doesn't exist` }
                    })
                }
                res.category = category
                next()
            })
            .catch(next)
    })
    .get((req, res, next) => {
        res.json(serializeCategory(res.category))
    })
    .delete((req, res, next) => {
        CategoriesService.deleteCategory(
            req.app.get('db'),
            req.params.cat_id
        )
            .then(numRowsAffected => {
                res.status(204).end()
            })
            .catch(next)
    })

    .patch(jsonParser, (req, res, next) => {
        const { cat_name } = req.body
        const updateCategory = { cat_name }

        const numberOfValues = Object.values(updateCategory).filter(Boolean).length
        if (numberOfValues === 0) {
            return res.status(400).json({
                error: {
                    message: `Request body must contain a 'name'`
                }
            })
        }

        CategoriesService.updateCategory(
            req.app.get('db'),
            req.params.cat_id,
            updateCategory
        )
            .then(numRowsAffected => {
                res.status(204).end()
            })
            .catch(next)
    })

module.exports = categoriesRouter;