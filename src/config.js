module.exports = {
  PORT: process.env.PORT || 8000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  CLIENT_ORIGIN: 'http://localhost:8000/',
  API_TOKEN: process.env.API_TOKEN || 'false-api-token',
  DB_URL: process.env.DB_URL || 'postgresql://admin@localhost/cachow',
  TEST_DB_URL: process.env.TEST_DB_URL || 'postgresql://admin@localhost/cachow-test',
  API_BASE_URL: process.env.REACT_APP_API_BASE_URL || "http://localhost:3000/api",
  JWT_SECRET: process.env.JWT_SECRET || 'change-this-secret',
}