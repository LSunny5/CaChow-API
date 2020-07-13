require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const { NODE_ENV, CLIENT_ORIGIN  } = require('./config')
const validateBearerToken = require('./validate-token');
const errorHandler = require('./error-handler');

const categoriesRouter = require('./categories/categories-router');
const usersRouter = require('./users/users-router');
//const restaurantsRouter = require('./restaurants/restaurants-router');
const hoursRouter = require('./hours/hours-router');
//const menuRouter = require('./menu/menu-router');

const app = express();

app.use(morgan((NODE_ENV === 'production') ? 'tiny' : 'common', { skip: () => NODE_ENV === 'test' }))
app.use(cors({origin: CLIENT_ORIGIN }));
app.use(helmet());
app.use(validateBearerToken);

app.get('/api', (req, res) => {
    res.send('Hello, world!')
})

app.use('/api/category', categoriesRouter);
app.use('/api/users', usersRouter);
//app.use('/api/restaurants', restaurantsRouter);
app.use('/api/restaurants/hours', hoursRouter);
//app.use('/api/restaurants/menu', menuRouter);

app.use(errorHandler);

module.exports = app;