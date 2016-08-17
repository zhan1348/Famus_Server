var express = require('express');
var router = express.Router();
var Parse = require('parse/node').Parse;
var multer = require('multer');
var crypto = require('crypto');

var path = require('path');

Parse.initialize("8Nx1MZhNZzI6jw1SM73isCHpmGGIPBvx0OQTJJl3", "jU9dbSvBPVQLHD9saDx4PU7FNvqUkxZLCYFgLLpq");

/* GET users listing. */
console.log("about to get");


/*
  the ranks will be return in the form of
  ObjectID:
  date: numeric value of "day month" like "31 12", which is Dec 31st
  maxUpVoteNum:
*/
router.get('/getHighestRank', function(req, res, next) {
 console.log("getHighestRank");
 var today = new Date();
 var calendar = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
 var dd = today.getDate();
 var mm = today.getMonth() + 1;
 // var dd = 13;
 // var mm = 11;
 var maxUpVotes = 0;
 var maxObjectID = null;
 var maxDate = dd + " " + mm;
 var JSONresult = [];
 console.log("entering for loop");
 var recordingObject = Parse.Object.extend("RecordingObject");
 console.log("recording object created");
 var query = new Parse.Query(recordingObject);
 query.find({
  success: function(results) {
   for (var i = 0; i < results.length; i++) {
    var date = results[i].get("createdAt");
    var day = date.getUTCDate();
    var month = date.getUTCMonth() + 1;
    if ((day == dd) && (month == mm)) {
     var numVotes = results[i].get("upVotes");
     //console.log("month: " + month + " day: " + day + " vote:" + numVotes);
     if (maxUpVotes <= numVotes) {
      maxUpVotes = numVotes;
      maxObjectID = results[i].id;
      maxDate = day + " " + month;
      //console.log("maxUpVotes" + maxUpVotes + " " + maxObjectID + " " + maxDate);
     }
    }
   }
   report();
  },
  error: function(results, error) {
   console.log("error!");
  }
 });
 var reportCount = 0;
 var report = function() {
  console.log("jason object pushed");
  JSONresult.push({
   date: maxDate,
   ObjectID: maxObjectID,
   maxUpVoteNum: maxUpVotes
  });
  maxUpVotes = null;
  maxObjectID = null;
  dd--;
  if (dd == 0) {
   mm--;
   dd = calendar[mm - 1];
  }
  maxDate = dd + " " + mm;
  query.find({
   success: function(results) {
    for (var i = 0; i < results.length; i++) {
     var date = results[i].get("createdAt");
     var day = date.getUTCDate();
     var month = date.getUTCMonth() + 1;
     if ((day == dd) && (month == mm)) {
      var numVotes = results[i].get("upVotes");
      //console.log("month: " + month + " day: " + day + " vote:" + numVotes);
      if (maxUpVotes <= numVotes) {
       maxUpVotes = numVotes;
       maxObjectID = results[i].id;
       //console.log("maxUpVotes" + maxUpVotes + " " + maxObjectID + " " + maxDate);
      }
     }
    }
    if(reportCount < 5)
    {
    	report();
    	reportCount++;
    }
    else
    {
    	finalReport();
    }
   },
   error: function(results, error) {
    console.log("error!");
   }
  });
 }

 var finalReport = function() {
  console.log("jason object pushed");
  JSONresult.push({
   date: maxDate,
   ObjectID: maxObjectID,
   maxUpVoteNum: maxUpVotes
  });
  pushJasonObjects();
 }

 var pushJasonObjects = function() {
  res.send(JSON.stringify(JSONresult));
 }
});

/* voteResult has the result of the user's vote */
router.get('/getVote/:userID/:recordingID/vote', function(req, res, next) {
 var vote = Parse.Object.extend("VotingObject");
 var voteObj = new vote();
 var query = new Parse.Query(vote);
 var userID = req.params.userID;
 var recordingID = req.params.recordingID;
 var objectID;
 var voteResult; /* this is the result of the url*/
 var object; //to store the found object with userID
 console.log("vote object and ID retrieved");
 console.log("userID:" + userID);
 console.log("recordingID:" + recordingID);
 query.equalTo("UserID", userID);
 query.equalTo("recordingID", recordingID);
 console.log(query);
 query.find({
  success: function(results) {
   object = results[0];
   objectID = object.id;
   console.log("object id: " + object.id);
   console.log("object successfully retrieved ");
   console.log('vote: ');
   showID();
  }
 });
 var showID = function() {
  console.log(objectID + " is here");
  var getvote = Parse.Object.extend("VotingObject");
  var queryGetVote = new Parse.Query(getvote);
  queryGetVote.get(objectID, {
   success: function(voteObj) {
    console.log(userID + " object successfully retrieved ");
    voteResult = voteObj.get("vote");
    console.log(voteResult);
    report();
   },
   error: function(object, error) {
    console.log("error when retrieving the voting object");
   }
  });
 }
 var report = function() {
  res.send(userID + "'s upVote to recording " + recordingID + " is " + voteResult);
 }
});


console.log("before newrecord!");
router.post('/send', function(req, res) {
 var userID = req.body.userID;
 var recordingID = req.body.recordingID
 var vote = req.body.vote;
 var objectID;
 console.log(req.body);
 console.log("inside post");
 console.log('recordingID:' + recordingID + ', userID:' + userID + ', vote:' + vote);
 var VotingObject = Parse.Object.extend("VotingObject");
  var voteInstance = new VotingObject();
  console.log("Creating new object");
  voteInstance.set("UserID", userID);
  voteInstance.set("recordingID", recordingID);
  voteInstance.set("vote", vote);
  console.log("instance set up");
  voteInstance.save(null, {
   success: function(voteInstance) {
    console.log("success!!!");
    //res.status(200).end();
   },
   error: function(voteInstance, error) {
    console.log(error);
    //res.status(403).end();
   }
  }); 
 res.status(200).end();
});


module.exports = router;
