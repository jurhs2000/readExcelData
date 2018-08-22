var express = require('express');
var setData = require('../controllers/data.controller');

const routes = express.Router();

routes.post('/data', setData)

module.exports = routes;