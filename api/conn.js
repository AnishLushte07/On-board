
var mongojs = require('mongojs');
var db  = mongojs('mongodb://anish:root@ds151554.mlab.com:51554/on-boarding', ['intros']);

module.exports = db;