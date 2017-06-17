var express = require('express');
var router = express.Router();
var firebase = require('firebase');
var admin = require("firebase-admin");
var fbRef = admin.database();
//var ref = db.ref("users");

router.get('/register', function(req, res, next)  {
  res.render('users/register');
});

router.get('/login', function(req, res, next) {
  res.render('users/login');
});

router.post('/register', function(req, res, next) {
    var first_name = req.body.first_name;
    var last_name = req.body.last_name;
    var email = req.body.email;
    var password = req.body.password;
    var password2 = req.body.password2;
    var location = req.body.location;
    var fav_artists = req.body.fav_artists;
    var fav_genres = req.body.fav_genres;

    // Validation
    req.checkBody('first_name', 'First name is required').notEmpty();
    req.checkBody('email', 'Email is required').notEmpty();
    req.checkBody('email', 'Email is not valid').isEmail();
    req.checkBody('password', 'Password is required').notEmpty();
    req.checkBody('password2', 'Passwords do not match').equals(req.body.password);

    var errors = req.validationErrors();

    if(errors){
        res.render('users/register', {
            errors: errors
        });
    } else {
        firebase.auth().createUserWithEmailAndPassword(email, password)
        .then(
            function(user){
                console.log("Successfully created user with uid:", user.uid);
                var user = {
                    uid: user.uid,
                    email: email,
                    first_name: first_name,
                    last_name: last_name,
                    location: location,
                    fav_genres: fav_genres,
                    fav_artists: fav_artists
                }

                var userRef = fbRef.ref('users');
                userRef.push().set(user);

                req.flash('success_msg', 'You are now registered and can login');
                res.redirect('/users/login');
            }
        )
        .catch(function(error){
            console.log("Error creating user: ", error);
        });
    }
});

router.post('/login', function(req, res, next)  {
  var email = req.body.email;
  var password = req.body.password;

  // Validation
  req.checkBody('email', 'Email is required').notEmpty(); //required
  req.checkBody('email', 'Email is not valid').isEmail(); //required
  req.checkBody('password', 'Password is required').notEmpty();

  var errors = req.validationErrors();
  if (errors) {
    res.render('users/login', {errors: errors});
  } else {
    firebase.auth().signInWithEmailAndPassword(email, password)
    .then(function(authData) {
      console.log("Authenticaed user with uid:", authData);
      req.flash('success_msg', 'You are now logged in');
      res.redirect('/albums');
    })
    .catch(function(error) {
      console.log("Login Failed: ", error);
      req.flash('error_msg', 'Login Failed');
      res.redirect('/users/login');
    });
  }
});

// Logout User
router.get('/logout', function(req, res){
  // Unauthenticate the client
  firebase.auth().signOut();

  req.flash('success_msg', 'You are logged out');
  res.redirect('/users/login');
});

module.exports = router;
