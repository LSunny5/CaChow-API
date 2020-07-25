require('dotenv').config()

process.env.NODE_ENV = 'test'
process.env.JWT_SECRET = 'test-jwt-secret'
process.env.JWT_EXPIRY = '15m'

const { expect } = require('chai')
const supertest = require('supertest')

global.expect = expect
global.supertest = supertest