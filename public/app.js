$(document).ready(function() {
  $(document).on("click", "h2", function() {
    $(".comments-div").empty();
    var thisId = $(this).attr("data-id");
    $(".comment-title").val("");
    $(".comment-text").val("");

    // Now make an ajax call for the Article
    $.ajax({
      method: "GET",
      url: "/articles/" + thisId
    })
      // With that done, add the note information to the page
      .then(function(data) {
        console.log(data);
        $(".article-h3").text(data.title);
        $(".comment-submit").attr("data-id", thisId);

        // If there's a note in the article
        if (data.note) {
          if (data.note.length < 1) {
            $(".comments-div").append("No notes saved yet...");
          } else {
            data.note.forEach(note => {
              let newCommentDiv = $("<div>")
                .addClass("note-div")
                .append(
                  `<div class="note-header"><span class="note-title">${
                    note.title
                  }</span><span class="note-created">${
                    note.createdAt
                  }</span><div class="note-options-div" data-id=${
                    note._id
                  } title="Delete note">-</div>`
                )
                .append(`<div class="note-body">${note.body}</div>`);
              $(".comments-div").append(newCommentDiv);
            });
          }
        }
      });
  });

  $(document).on("click", ".note-options-div", function() {
    const thisElement = $(this);
    const thisId = thisElement.attr("data-id");
    console.log(thisElement);
    $.ajax({
      method: "DELETE",
      url: "/notes/" + thisId
    }).then(function() {
      thisElement
        .parent()
        .parent()
        .remove();
    });
  });

  $(document).on("click", "#save-btn", function() {
    const thisElement = $(this);
    const savedValue = $.parseJSON(thisElement.attr("data-saved"));
    let newSavedValue = savedValue ? false : true;
    const thisId = thisElement.attr("data-id");
    $.ajax({
      method: "PUT",
      url: "/articles/" + thisId,
      data: {
        saved: newSavedValue
      }
    }).then(function(data) {
      console.log(data);
      const newText = newSavedValue ? "Saved!" : "Save";
      thisElement
        .removeClass("saved-false")
        .removeClass("saved-true")
        .attr("data-saved", newSavedValue)
        .addClass("saved-" + newSavedValue)
        .text(newText);
    });
  });

  // When you click the savenote button
  $(document).on("click", ".comment-submit", function(e) {
    e.preventDefault();
    // Grab the id associated with the article from the submit button
    const thisId = $(this).attr("data-id");

    // Run a POST request to change the note, using what's entered in the inputs
    $.ajax({
      method: "POST",
      url: "/articles/" + thisId,
      data: {
        // Value taken from title input
        title: $(".comment-title").val(),
        // Value taken from note textarea
        body: $(".comment-text").val()
      }
    }).then(function(data) {
      console.log(data);
      // $("#notes").empty();
    });

    // Also, remove the values entered in the input and textarea for note entry
    $(".comment-title").val("");
    $(".comment-text").val("");
  });

  $("#scrape-btn").click(function() {
    $.ajax({
      method: "GET",
      url: "/scrape"
    }).then(function(data) {
      console.log(data);
      location.reload();
    });
  });

  $(".saved-true").text("Saved!");
});
