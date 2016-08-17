var express = require('express');
var router = express.Router();
var Parse = require('parse/node').Parse;
var multer = require('multer');
var upload = multer({
    dest: 'uploads/'
});

Parse.initialize("8Nx1MZhNZzI6jw1SM73isCHpmGGIPBvx0OQTJJl3", "jU9dbSvBPVQLHD9saDx4PU7FNvqUkxZLCYFgLLpq");


router.post('/postComments', function(req, res) {
    //This only supports comments on recordings not comments on comments
    // var commentsID = req.body.commentsID;
    console.log(req);
    var objectID = req.body.objectID;
    var comments = req.body.comments; //Can be different depends
    var userID = req.body.userID;
    if (objectID === undefined || comments === undefined) {
        res.status(403).end();
        return;
    }
    var RecordingObject = Parse.Object.extend("RecordingObject");
    var query = new Parse.Query(RecordingObject);
    query.get(objectID, {
        success: function(matchedObj) {}
    });

    var CommentObject = Parse.Object.extend("CommentObject");
    var commentTable = new CommentObject();
    commentTable.save({
        comments: comments,
        objectID: objectID,
        commenterID : userID
    }, {
        success: function(obj) {
            console.log("Comments posted!");
            res.status(200).end();
            return;

        }
    });
    res.send('OK');
});

router.get('/getComments/:objectID', function(req, res, next) {
    var objectID = req.params.objectID;
    if (objectID === undefined) {
        console.log('here');
        res.status(403).end('error');
        return;
    }
    var CommentObject = Parse.Object.extend("CommentObject");
    var query = new Parse.Query(CommentObject);
    query.equalTo('objectID', objectID);
    query.find({
        success: function(results) {
            res.send(results);
        },
        error: function(error) {
            res.status('404');
            res.send('error');
        }
    });
	
});

router.post('/deleteComments', function(req, res) {
    var objectId = req.body.objectId;
    var userID = req.body.userID;
    console.log("user id is "+userID);
    var CommentTable = Parse.Object.extend('CommentObject');
    var query = new Parse.Query(CommentTable);
    query.get(objectId, {
        success: function(obj) {

            if (obj.commenterID === userID) {
                console.log('user id ' + ' commenter id ' + obj.commenterID);
                obj.destroy({});
                res.status(200);

                res.send('Requested Comment Deleted!');
            }
        },
        error: function(obj, error) {
            console.log(error);
            res.status(403);
            res.send('error');
        }
    });
});



module.exports = router;
