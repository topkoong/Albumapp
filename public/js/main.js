$(document).ready(function(){
  $('.delete-genre').on('click', function(){
    var id = $(this).data('id');
    var url = '/genres/delete/'+id;
    if(confirm('Delete genre?')){
      $.ajax({
        url: url,
        type: 'DELETE',
        success: function(result) {
          console.log('Deleting genre...');
          window.location.href='/genres'; // redirect
        },
        error: function(err) {
          console.log(err);
        }
      })
    }
  });

  $('.delete-album').on('click', function(){
    var id = $(this).data('id');
    var url = '/albums/delete/'+id;
    if(confirm('Delete Album?')){
      $.ajax({
        url: url,
        type: 'DELETE',
        success: function(result) {
          console.log('Deleting album...');
          window.location.href='/albums'; // redirect
        },
        error: function(err) {
          console.log(err);
        }
      })
    }
  });
});
