var express = require('express');
var router = express.Router();
var firebase = require('firebase');
var admin = require("firebase-admin");
var db = admin.database();
var ref = db.ref("restricted_access/secret_document");
ref.once("value", function(snapshot) {
  console.log(snapshot.val());
});

router.get('*', function(req, res, next) {
	// Check Authentication
	// if(firebase.auth().currentUser == null){
  //   res.redirect('/users/login');
	// }
  firebase.auth().onAuthStateChanged(function(user) {
    if (!user) {
      // No user is signed in.
      res.redirect('/users/login');
    }
    next();
  });
  // next();
});

// Genres


// Fetch data stored in database on genre index page
router.get('/', function(req, res, next) {
  var genreRef = db.ref("genres");
  genreRef.once('value', function(snapshot){
    var genres = [];
    snapshot.forEach(function(childSnapshot){
      var key = childSnapshot.key;
      var childData = childSnapshot.val();

      // Ensure that another user cannot see each other genres
      if (childData.uid == firebase.auth().currentUser.uid) {
        genres.push({
          id: key,
          name: childData.name
        });
      }
    });
    res.render('genres/index', {genres: genres});
  });
});

router.get('/add', function(req, res, next) {
  res.render('genres/add');
});

// Store data in database on genre add page.
router.post('/add', function(req, res, next) {
  var genre = {
    name: req.body.name,
    uid: firebase.auth().currentUser.uid
  }
  var genreRef = db.ref('genres/');
  genreRef.push().set(genre); // store data in database
  req.flash('success_msg', 'Genre Saved');
  res.redirect('/genres');
});

// Fetch data stored in database on albums edit page
router.get('/edit/:id', function(req, res, next) {
  var id = req.params.id;
  var genreRef = db.ref("genres/"+id);
  genreRef.once('value', function(snapshot) {
    var genre = snapshot.val();
    res.render('genres/edit', {genre: genre, id: id});
  });
});

// Update data stored in database on the genre edit page
router.post('/edit/:id', function(req, res, next) {
  var id = req.params.id;
  var name = req.body.name;
  var genreRef = db.ref("genres/"+id);
  genreRef.update({
    name: name
  });
  res.redirect('/genres');
});

// Delete
router.delete('/delete/:id', function(req, res, next) {
  var id = req.params.id;
  var genreRef = db.ref("genres/"+id);
  genreRef.remove();
  req.flash('success_msg', 'Genre Deleted');
  res.send(200);
});


module.exports = router;
