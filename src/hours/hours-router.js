const path = require('path')
const express = require('express')
const logger = require('../logger');
const HoursService = require('./hours-service');
const { requireAuth } = require('../middleware/jwt-auth');

const hoursRouter = express.Router()
const jsonParser = express.json()

hoursRouter
    .route('/')
    .get((req, res, next) => {
        HoursService.getAllHours(
            req.app.get('db')
        )
            .then(hours => {
                res.json(hours.map(HoursService.serializeHour))
            })
            .catch(next)
    })
    .post(requireAuth, jsonParser, (req, res, next) => {
        const { sun_open, sun_close, mon_open, mon_close, tues_open, tues_close, wed_open,
            wed_close, thu_open, thu_close, fri_open, fri_close, sat_open, sat_close, hours_owner } = req.body
        const newHours = {
            sun_open, sun_close, mon_open, mon_close, tues_open, tues_close, wed_open,
            wed_close, thu_open, thu_close, fri_open, fri_close, sat_open, sat_close, hours_owner
        }

        //check to see all keys are in the response body
        for (const [key, value] of Object.entries(newHours)) {
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

        const error = HoursService.validateHour(newHours);
        if (error) {
            logger.error({
                message: `POST Validation Error`,
                request: `${req.originalUrl}`,
                method: `${req.method}`
            });
            return res.status(400).send(error);
        }

        //add hours to database
        HoursService.insertHours(
            req.app.get('db'),
            newHours
        )
            .then(hours => {
                res
                    .status(201)
                    .location(path.posix.join(req.originalUrl, `/${hours.hours_id}`))
                    .json(HoursService.serializeHour(hours))
            })
            .catch(next)
    })

hoursRouter
    .route('/:hours_id')
    .all((req, res, next) => {
        HoursService.getById(
            req.app.get('db'),
            req.params.hours_id
        )
            .then(hours => {
                if (!hours) {
                    return res.status(404).json({
                        error: { message: `There are no hours.` }
                    })
                }
                res.hours = hours
                next()
            })
            .catch(next)
    })
    .get((req, res, next) => {
        res.json(HoursService.serializeHour(res.hours))
    })
    .delete(requireAuth, (req, res, next) => {
        HoursService.deleteHours(
            req.app.get('db'),
            req.params.hours_id
        )
            .then(numRowsAffected => {
                res.status(204).end()
            })
            .catch(next)
    })

    .patch(requireAuth, jsonParser, (req, res, next) => {
        const { hours_id, sun_open, sun_close, mon_open, mon_close, tues_open, tues_close, wed_open,
            wed_close, thu_open, thu_close, fri_open, fri_close, sat_open, sat_close, hours_owner } = req.body
        const updateHour = {
            hours_id, sun_open, sun_close, mon_open, mon_close, tues_open, tues_close, wed_open,
            wed_close, thu_open, thu_close, fri_open, fri_close, sat_open, sat_close, hours_owner
        }

        const numberOfValues = Object.values(updateHour).filter(Boolean).length

        for (const [key, value] of Object.entries(updateHour)) {
            if (numberOfValues === 0) {
                return res.status(400).json({
                    error: {
                        message: `Request body must contain '${key}' in request body`
                    }
                })
            }
        }

        const error = HoursService.validateHour(updateHour);
        if (error) {
            logger.error({
                message: `PATCH Validation Error`,
                request: `${req.originalUrl}`,
                method: `${req.method}`,
                ip: `${req.ip}`
            });
            return res.status(400).send(error);
        }

        HoursService.updateHours(
            req.app.get('db'),
            req.params.hours_id,
            updateHour
        )
            .then(numRowsAffected => {
                res.status(204).end()
            })
            .catch(next)
    })

module.exports = hoursRouter;