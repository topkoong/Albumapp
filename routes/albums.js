var express = require('express');
var router = express.Router();
var firebase = require('firebase');
var admin = require("firebase-admin");
var db = admin.database();
var multer = require('multer');
var upload = multer({dest:'./public/images/uploads'});
var ref = db.ref("genres");


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

// Album
// Fetch data stored in database on album index page
router.get('/', function(req, res, next) {
  var albumRef = db.ref('albums');
  albumRef.once('value', function(snapshot){
    var albums = [];
    snapshot.forEach(function(childSnapshot){
      var key = childSnapshot.key;
      var childData = childSnapshot.val();
      // Ensure that another user cannot see each other album
      if (childData.uid == firebase.auth().currentUser.uid) {
        albums.push({
          id: key,
          artist: childData.artist,
          genre: childData.genre,
          info: childData.info,
          title: childData.title,
          label: childData.label,
          tracks: childData.tracks,
          cover: childData.cover
        });
      }
    });
    res.render('albums/index',{albums: albums});
  });
});
// Fetch genre on album add page (Form)
// We also have to fetch the genre from the database.

router.get('/add', function(req, res, next) {
  var genreRef = ref;
  genreRef.once('value', function(snapshot) {
    var data = [];
    snapshot.forEach(function(childSnapshot) {
      var key = childSnapshot.key;
      var childData = childSnapshot.val();
      data.push({id: key, name: childData.name});
    });
    res.render('albums/add',{genres: data});
  });
});

// Store data in database on album add page.
// Upload image
router.post('/add', upload.single('cover'), function(req, res, next) {
  // Check File Upload
  if (req.file) {
    console.log('Uploading File...');
    var cover = req.file.filename;
  } else {
    console.log('No File Uploaded...');
    var cover = 'noimage.jpg';
  }

  // Build Album Object
	var album = {
		artist: req.body.artist,
		title: req.body.title,
		genre: req.body.genre,
		info: req.body.info,
		year: req.body.year,
		label: req.body.label,
		tracks: req.body.tracks,
		cover: cover,
    uid: firebase.auth().currentUser.uid
	}
  // Create Reference
  var albumRef = db.ref('albums/');

  // Push Album
  albumRef.push().set(album);

  req.flash('success_msg', 'Album Saved');
  res.redirect('/albums');

});

//Fetch data stored in database on albums details page

router.get('/details/:id', function(req, res) {
  var id = req.params.id;
  var albumRef = db.ref("albums/"+id);
  albumRef.once('value', function(snapshot) {
    var album = snapshot.val();
    res.render('albums/details', {album: album, id: id});
  });
});

// Update data stored in database on the album edit page
// We also have to fetch the genre to display in our form.
router.get('/edit/:id', function(req, res, next) {
  var id = req.params.id;
  var albumRef = db.ref("albums/"+id);

  var genreRef = ref;
  genreRef.once('value', function(snapshot) {
    var genres = [];
    snapshot.forEach(function(childSnapshot) {
      var key = childSnapshot.key;
      var childData = childSnapshot.val();
      genres.push({id: key, name: childData.name});
    });
    albumRef.once('value', function(snapshot) {
      var album = snapshot.val();
      res.render('albums/edit', {
        album: album,
        id: id,
        genres: genres
      });
    });
  });
});

// Update data stored in database on the album edit page
router.post('/edit/:id', upload.single('cover'), function(req, res, next) {
  var id = req.params.id;
  var albumRef = db.ref("albums/"+id);
  // Check File Upload
  if (req.file) {
    console.log('Uploading File...');
    // get Cover Filename
    var cover = req.file.filename;

    // Update Album Cover including album Object
    albumRef.update({
      artist: req.body.artist,
      title: req.body.title,
      genre: req.body.genre,
      info: req.body.info,
      year: req.body.year,
      label: req.body.label,
      tracks: req.body.tracks,
      cover: cover
    });

  } else {
    console.log('No File Uploaded...');
    var cover = 'noimage.jpg';
    // Update Album Without Cover
    albumRef.update({
      artist: req.body.artist,
      title: req.body.title,
      genre: req.body.genre,
      info: req.body.info,
      year: req.body.year,
      label: req.body.label,
      tracks: req.body.tracks
    });
  }

  req.flash('success_msg', 'Album Updated');
  res.redirect('/albums/details/'+id);
});

// Delete
router.delete('/delete/:id', function(req, res, next) {
  var id = req.params.id;
  var albumRef = db.ref("albums/"+id);
  albumRef.remove();
  req.flash('success_msg', 'Genre Deleted');
  res.send(200);
});



module.exports = router;
