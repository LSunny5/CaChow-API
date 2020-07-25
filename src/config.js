module.exports = {
  PORT: process.env.PORT || 8000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  CLIENT_ORIGIN: 'https://cachow.vercel.app',
  //CLIENT_ORIGIN: 'http://localhost:3000',
  API_TOKEN: process.env.API_TOKEN || 'false-api-token',
  DATABASE_URL: process.env.DATABASE_URL || 'postgresql://admin@localhost/cachow',
  TEST_DATABASE_URL: process.env.TEST_DATABASE_URL || 'postgresql://admin@localhost/cachow-test',
  API_BASE_URL: process.env.REACT_APP_API_BASE_URL || "http://localhost:3000/api",
  JWT_SECRET: process.env.JWT_SECRET || 'change-this-secret',
  JWT_EXPIRY: process.env.JWT_EXPIRY || '30m',
}