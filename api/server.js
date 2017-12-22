var express = require('express');

var dotenv = require('dotenv');
dotenv.load();

var api = require('./routes');
var bodyParser = require('body-parser');
var path = require('path');

var port = process.env.PORT || 4000;
var app = express();


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname, 'intro')));

app.use('/api', api);

app.listen(port, function(){
	console.log(`On-boarding api server running on port number ${port}`);
});