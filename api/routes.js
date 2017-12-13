var express = require('express');
var router = express.Router();
var db = require('./conn');
var fs = require('fs');
var path = require('path');
var filepath = path.join(__dirname, 'script.js');

console.log(filepath);

// middleware that is specific to this router
router.use(function timeLog (req, res, next) {
  console.log('Time: ', Date.now())
  next()
});


router.get('/onboard/loadfiles/:filename', function (req, res, next) {
	fs.readFile(filepath, function (err, data) {
	  if (err) throw err;
	  res.sendFile(filepath);
	});
});

router.get('/onboard/fetch', function (req, res, next) {
  var query = req.query;
  db.intros.findOne({name: query.name, time: parseInt(query.time)}, function(err, introSteps){
		if(err){
			res.send(err);
		}

		var jsonObject = JSON.stringify(introSteps.steps);

		res.send(`var jsonObject = ${jsonObject}`);
	});
});

// define the home page route
router.post('/steps', function (req, res, next) {
  var steps = req.body;
  if(!steps.length){
		res.status(400);
		res.json({
			"error" : "Bad Data"
		});
	}else{
		steps = steps.map(function(v){
			return { intro: v.intro, position: v.position, element: v.element};
		})

		var time = Date.now();
		var data = {
			name: 'name',
			steps: steps,
			time: time
		}

		db.intros.insert(data ,function(err, steps){
			if(err){
				res.send(err);
			}
			res.json(steps);
		});
	}
});


module.exports = router;