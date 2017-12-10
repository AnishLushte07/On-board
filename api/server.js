var express = require('express');
var api = require('./routes');
var bodyParser = require('body-parser');
var port = process.env.PORT || 3000;
var app = express();


app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: false}));

app.use('/api', api);

app.listen(port, function(){
	console.log(`On-boarding api server running on port number ${port}`);
});