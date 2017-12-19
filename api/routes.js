var express = require('express');

var router = express.Router();
var db = require('./conn');

var fs = require('fs');
var API_HOST = 'http://127.0.0.1:3000';

// middleware that is specific to this router
router.use(function timeLog (req, res, next) {
    console.log('Time: ', Date.now());
    next()
});

//fetch intros as per name and id
//replace $step variable in files by intro.
router.get('/onboard/fetch/:name/:id/file.js', function (req, res, next) {
    var params = req.params;
    db.intros.findOne({name: params.name, uniqueId: parseInt(params.id)}, function(err, introSteps){
        if(err){
            res.send(err);
        }

        var fileJs = fs.readFileSync('./loadIntro.js', 'utf-8');
        var out = fileJs.replace('$steps', JSON.stringify(introSteps));

        res.setHeader('Allow-control-access-origin', '*');
        res.setHeader('content-type', 'application/javascript');
        res.send(out);
    });
});


router.post('/save/steps', function (req, res, next) {

    var intro = req.body;

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
            var introUrl = `<script src="${API_HOST}/api/onboard/fetch/${intro.name}/${intro.uniqueId}/file.js"></script>`;
            res.send({ introUrl: introUrl});
        });
    }
});


module.exports = router;