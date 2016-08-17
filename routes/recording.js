var express = require('express');
var router = express.Router();
var Parse = require('parse/node').Parse;
var multer = require('multer');
var upload = multer({
    dest: 'uploads/'
});
var crypto = require('crypto');
var findHashtags = require('find-hashtags');

var path = require('path');

var storage = multer.diskStorage({
    destination: './uploads/',
    filename: function(req, file, cb) {
        cb(null, file.originalname);


    }
})


var upload = multer({
    storage: storage
});

var s3 = require('s3');

var client = s3.createClient({
    maxAsyncs3: 20,
    s3RetryCount: 3,
    s3RetryDelay: 1000,
    multipartUploadThreshold: 20971520,
    multipartUploadSize: 15728640,
    s3Options: {
        accessKeyId: 'AKIAJXM3YWA3HNOBNXVQ',
        secretAccessKey: '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',
    }
});




Parse.initialize("8Nx1MZhNZzI6jw1SM73isCHpmGGIPBvx0OQTJJl3", "jU9dbSvBPVQLHD9saDx4PU7FNvqUkxZLCYFgLLpq");

/* GET users listing. */
router.get('/', function(req, res, next) {
    console.log(req);
    res.send('respond with a resource');
});

router.get('/list/:user_id', function(req, res, next) {
    console.log(req.params.user_id);

    var Recording = Parse.Object.extend("RecordingObject");
    var query = new Parse.Query(Recording);
    var commentsTable = Parse.Object.extend("CommentObject");
    var query1 = new Parse.Query(commentsTable);
    query.equalTo("UserID", req.params.user_id);
    query.find({
        success: function(results) {
            console.log("Successfully retrieved " + results.length);
            // Do something with the returned Parse.Object values
            for (var i = 0; i < results.length; i++) {
                var object = results[i];
                console.log(object.id + ' - ' + object.get('column'));
                query1.equalTo('objectID', object.objectId);
                query1.find({
                    success: function(results1) {
                        object.numOfComments = results1.length;
                    },
                    error: function(error) {
                        console.error(error.message);
                        res.send('error');
                    }
                });
            }
            console.log("Successfully retrieved " + results.length);
            res.send(results);

        },
        error: function(error) {
            console.error("Error: " + error.code + " " + error.message);
            res.status('404');
            res.send('error');

        }
    });
    // res.send('respond with a resource');
});

router.post('/delete', function(req, res) {
    console.log(req.body.recordingID);
    var recordingID = req.body.recordingID;
    var Recording = Parse.Object.extend("RecordingObject");
    var query = new Parse.Query(Recording);
    query.equalTo("objectId", recordingID);
    query.get(recordingID, {
        success: function(myObj) {
            // The object was retrieved successfully.
            myObj.destroy({});
            console.log('destroying object');
            res.status(200);
            res.send("OK");

        },
        error: function(object, error) {
            // The object was not retrieved successfully.
            // error is a Parse.Error with an error code and description.
            res.status(403);
            res.send("error");
        }
    });
});
//'EZAudioTest'
router.post('/upload', upload.single('EZAudioTest'), function(req, res, next) {
    // req.file is the `avatar` file
    // req.body will hold the text fields, if there were any
    var longitude = parseFloat(req.query.longitude);
    var latitude = parseFloat(req.query.latitude);
    var description = req.query.description;
    var title = req.query.title;
    var userID = req.query.userID;
    var upVotes = 0;
    var downVotes = 0;

    var processedDescription = description.split('_').join(' ');
    var processedDescription = processedDescription.split('*').join('#');
    console.log(findHashtags(processedDescription));

    var hashtagArray = findHashtags(processedDescription);
    var hashtag;

    if (hashtagArray.length != 0) {
        hashtag = hashtagArray[0];
    }
    else {
        hashtag = null;
    }

    console.log('title:' + title + ', description:' + description + ', userID:' + userID + ', latitude:' + latitude + ', longitude:' + longitude + ', upVotes:' + upVotes + ', downVotes' + downVotes);
    var RecordingObject = Parse.Object.extend("RecordingObject");
    var recordingObject = new RecordingObject();

    var point = new Parse.GeoPoint({
        latitude: latitude,
        longitude: longitude
    });

    recordingObject.set("location", point);

    recordingObject.save({
        Data: req.file,
        RecordingTitle: title,
        RecordingDescription: description,
        UserID: userID,
        upVotes: upVotes,
        downVotes: downVotes,
        HashTag: hashtag
    }, {
        success: function(Object) {
            res.status(200).end();
        },
        error: function(obj, error) {
            console.log(error);
            res.status(403).end();
        }
    });
    var params = {
        localFile: "./uploads/EZAudioTest.m4a",

        s3Params: {
            Bucket: "famus",
            Key: "uploads/" + title + ".m4a",
            // other options supported by putObject, except Body and ContentLength.
            // See: http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#putObject-property
        },
    };
    var uploader = client.uploadFile(params);
    uploader.on('error', function(err) {
        console.error("unable to upload:", err.stack);
    });
    uploader.on('progress', function() {
        console.log("progress", uploader.progressMd5Amount,
            uploader.progressAmount, uploader.progressTotal);
    });
    uploader.on('end', function() {
        console.log("done uploading");
    });
    console.log("success!!!");
});

router.post('/newrecord', function(req, res) {
    var title = req.body.title
    var description = req.body.description;
    var userID = req.body.userID;
    var longitude  = req.body.latitude;
    var latitude = req.body.longitude;
    var upVote = 0;
    var downVote = 0;

    console.log(req.body);
    console.log('title:' + title + ', description:' + description + ', userID:' + userID + ', latitude:' + latitude + ', longitude:' + longitude);
    var RecordingObject = Parse.Object.extend("RecordingObject");
    var recordingObject = new RecordingObject();
    console.log("here !");
    // , Longitutde: longitude, Latitude: latitude
    var point = new Parse.GeoPoint({
        latitude: longitude,
        longitude: latitude
    });
    recordingObject.set("location", point);
    recordingObject.save({
        RecordingTitle: title,
        RecordingDescription: description,
        UserID: userID,
        upVote: upVote,
        downVote: downVote
    }, {
        success: function(Object) {
            console.log("success!!!");
            res.status(200);
            res.send("sucess");
        }
    });
    res.send('OK');
});

/* Get listing recordings */
router.get('/list', function(req, res, next) {
    console.log('here');
    // res.send(apple = appl, orange = org, charles, crls);
    var userLongitude = parseFloat(req.query.longitude);
    console.log(userLongitude);
    var userLatitude = parseFloat(req.query.latitude);
    console.log('Longitude: ' + userLongitude + ',Latitude: ' + userLatitude);
    var point = new Parse.GeoPoint({
        latitude: userLatitude,
        longitude: userLongitude
    });
    var Recording = Parse.Object.extend("RecordingObject");
    var commentsTable = Parse.Object.extend("CommentObject");
    var query = new Parse.Query(Recording);
    var query1 = new Parse.Query(commentsTable);
    query.near("location", point);
    query.withinMiles("location", point, 20);
    query.find({
        success: function(results) {
            console.log("Successfully retrieved 1:" + results.length);
            // Do something with the returned Parse.Object values
            for (var i = 0; i < results.length; i++) {
                var object = results[i];
                //Query to count number of comments an object that assocaited with
                query1.equalTo('objectID', object.objectId);
                query1.find({
                    success: function(results1) {
                        //console.log('The object retrieved looks like this: ' + object.objectId);
                        // console.log('The object ID is: ', object.objectId);
                        // console.log('Number of comments get from database is: ' + results1.length);
                        object.numOfComments = results1.length;
                        results[i] = object;
                        // console.log('Number of comments for this object is: ' + object.numOfComments);
                    },
                    error: function(error) {
                        console.error(error.message);
                        res.send('error');
                    }
                });
            }
            console.log("Successfully retrieved 2:" + results.length);
            console.log('The object before return is: ' + results[0]);
            res.send(results);
        },
        error: function(error) {
            console.error("Error: " + error.code + " " + error.message);
            res.status('404');
            res.send('error');
        }
    })
});

router.get('/send', function(req, res, next) {
    //
    var RecordingObject = Parse.Object.extend("RecordingObject");
    var recordingObject = new RecordingObject();
    console.log("here !");
    recordingObject.save({
        foo: "bar"
    }, {
        success: function(Object) {
            console.log("success!!!");
        },
        error: function(obj, error) {
            console.log(error);
        }
    });
    res.json([{
        a: 1222
    }, {
        a: 233333
    }, {
        a: 34444
    }]);
});


module.exports = router;
