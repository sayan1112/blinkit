// Force bundler to include ejs
require('ejs');
const serverless = require('serverless-http');
const app = require('../../app');

module.exports.handler = serverless(app);
