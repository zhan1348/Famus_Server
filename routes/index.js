var express = require('express');
var router = express.Router();
var Parse = require('parse/node').Parse;
Parse.initialize("8Nx1MZhNZzI6jw1SM73isCHpmGGIPBvx0OQTJJl3", "jU9dbSvBPVQLHD9saDx4PU7FNvqUkxZLCYFgLLpq");

console.log("request home page");
/* GET home page. */
router.get('/', function(req, res, next) {
 res.render('index', {
  title: 'Express'
 });
});

router.get('/getProfile/:user_id', function(req, res){
    var userID = req.params.user_id;
    var UserObject = Parse.Object.extend("UserObject");
    var userObject = new UserObject();
    var query = new Parse.Query(UserObject);
    query.equalTo("UserID", userID);
    query.first({
        success: function(matchedObj) {
            res.status(200);
            res.send(matchedObj);
        },
        error: function(matchedObj, error) {
            console.log(error);
            res.status(404);
            res.send("failed");
        }
    });
});

router.post('/updateProfile', function(req, res) {
    var name = req.body.name;
    var phone = req.body.phone;
    var email = req.body.email;
    var address = req.body.address;
    var userID = req.body.userID;

    console.log('name:' + name + ', phone:' + phone + ', email:' + email + ', address:' + address);
    var UserObject = Parse.Object.extend("UserObject");
    var userObject = new UserObject();
    console.log("here !");
    // , Longitutde: longitude, Latitude: latitude
    var query = new Parse.Query(UserObject);
    query.equalTo("UserID", userID);

    query.first({
     success: function(matchedObj) {
         matchedObj.set("Name", email);
         matchedObj.set("Email",name);
         matchedObj.set("Address",address);
         matchedObj.set("Phone",phone);
         matchedObj.save();
         res.status(200);
         res.send("successfully");
     },
     error: function(matchedObj, error) {
         userObject.save({
             Name: name,
             Phone: phone,
             Email: email,
             Address: address,
             UserID: userID
         }, {
             success: function(Object) {
                 console.log("success!!!");
                 res.status(200);
                 res.send("sucess");
             },
             error: function(obj, error) {
                 console.log(error);
                 res.status(403);
                 res.send("failed");
             }
         });
     }
    });


});


module.exports = router;
