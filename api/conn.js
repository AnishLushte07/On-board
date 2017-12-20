
var mongojs = require('mongojs');

var db  = mongojs(process.env.DB_URL, ['intros']);

module.exports = db;