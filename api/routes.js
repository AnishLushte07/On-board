var express = require('express');
var router = express.Router();
var db = require('./conn');
var fs = require('fs');
var API_HOST = process.env.API_HOST;


router.get('/onboard/fetch/:nameId/:id/file.js', fetchStep);
router.post('/save/steps', saveIntro);


function handleError(res, err, statusCode){
    statusCode = statusCode || 500;
    res.status(statusCode).send(err);
}

function fetchStep(req, res) {
    var params = req.params;
    db.intros.findOne({nameId: params.nameId, uniqueId: parseInt(params.id)}, function(err, introSteps){

        if(err){
            handleError(res, err);
        }

        if(introSteps){
            var fileJs = fs.readFileSync('./loadIntro.js', 'utf-8');
            var out = fileJs.replace('$steps', JSON.stringify(introSteps));

            res.setHeader('Allow-control-access-origin', '*');
            res.setHeader('content-type', 'application/javascript');
            res.send(out);
        }else{
            handleError(res, {error: 'Intro not found.'});
        }

        
    });
}

function saveIntro(req, res){
    var intro = req.body;

    intro.websiteName = 'localhost';

    if(!intro.websiteName || !intro.name || !intro.steps){
        handleError(res, {error : 'Bad data.'});

    }else{
        
        var steps = intro.steps.map(function(v){
                return { intro: v.intro, position: v.position, element: v.element};
            });

        var nameId  = intro.name.trim().split(' ').filter(function(v){
            return v != '';
        }).join('_');

        var data = {
            websiteName: intro.websiteName,
            steps: steps,
            name: intro.name,
            nameId: nameId,
            uniqueId: Date.now()
        };

         db.intros.insert(data , function(err, intro){
            if(err){
                handleError(res, err);
                return;
            }
            var introUrl = `<script src="${API_HOST}/api/onboard/fetch/${nameId}/${intro.uniqueId}/file.js"></script>`;
            res.json({ introUrl: introUrl});
        });
    }
}

module.exports = router;