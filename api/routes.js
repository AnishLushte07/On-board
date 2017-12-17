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

router.get('/onboard/fetch/:name/:id/file.js', function (req, res, next) {
    var params = req.params;
    db.intros.findOne({name: params.name, uniqueId: parseInt(params.id)}, function(err, introSteps){
        if(err){
            res.send(err);
        }
        console.log(introSteps);
        var fileJs = fs.readFileSync('./loadIntro.js', 'utf-8');
        var out = fileJs.replace('$steps', JSON.stringify(introSteps));
        // var jsonObject = JSON.stringify(introSteps.steps);
        res.setHeader('content-type', 'application/javascript');
        res.send(out);
    });
});

router.post('/getSteps', function (req, res, next) {
    var data = req.body;

    console.log(data);

    if(!data.hostname){
        res.status(400);
        res.json({
            "error" : "Bad Data"
        });
    }else{
         db.intros.find({"websiteName": data.hostname}, {"intros" : 1} , function(err, intros){

            if(err){
                res.send(err);
            }
 			
 			res.header('Access-Control-Allow-Origin', '*');
 			res.json(intros);

        });
    }
});

// define the home page route
router.post('/steps', function (req, res, next) {
    var intro = req.body;
    // intro.websiteName = 'localhost'
    if(!intro.websiteName){
        res.status(400);
        res.json({
            "error" : "Bad Data"
        });
    }else{
         db.intros.findOne({websiteName : intro.websiteName} , function(err, userIntros){
            if(err){
                res.send(err);
            }
 
            var steps = intro.steps.map(function(v){
                return { intro: v.intro, position: v.position, element: v.element};
            });

            if(userIntros){
                userIntros.intros.push({name : intro.name, steps: steps});
            }else{
                var userIntros = { websiteName: intro.websiteName, intros: [{name: intro.name, steps: steps}] };
            }


            db.intros.save(userIntros, function (err, intros) {
                console.log(intros);
                res.send(intros);
            });
        });
    }
});


router.post('/save/steps', function (req, res, next) {
    console.log('save steps api hit');
    var intro = req.body;
    intro.websiteName = 'localhost'
    if(!intro.websiteName){
        res.status(400);
        res.json({
            "error" : "Bad Data"
        });
    }else{
        
        var steps = intro.steps.map(function(v){
                return { intro: v.intro, position: v.position, element: v.element};
            });

        var data = {
            websiteName: intro.websiteName,
            steps: steps,
            name: intro.name,
            uniqueId: Date.now()
        };

         db.intros.insert(data , function(err, intro){
            if(err){
                res.send(err);
            }
            var instroUrl = `//localhost:3000/api/onboard/fetch/${intro.name}/${intro.uniqueId}/file.js`;
            res.send({ instroUrl: instroUrl});
        });
    }
});


module.exports = router;