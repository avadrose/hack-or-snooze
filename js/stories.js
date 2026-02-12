"use strict";

// This is the global list of the stories, an instance of StoryList
let storyList; // storyList instance, UI function read from here instead of passing it everywhere

/** Get and show stories when site first loads. */

async function getAndShowStoriesOnStart() { // calls model layer to fetch data from API
  try{
    storyList = await StoryList.getStories(); // stores result in storyList
    $storiesLoadingMsg.remove(); // removes loading message from DOM
    putStoriesOnPage(); // renders stories
  } catch (err) {
    console.error("Failed to load stories:", err); // error handling, ;ogs to console and updates UI with message
    $("#stories-loading-msg").text("Error loading stories — check console.");
  }
}

/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *
 * Returns the markup for the story.
 */

function generateStoryMarkup(story) { // render function for one story
  // console.debug("generateStoryMarkup", story);
  const showStar = Boolean(currentUser); // star only visible when logged in
  const showTrash = currentUser && story.username === currentUser.username; // trash only visible if current user posted story
  const isFav = currentUser && currentUser.isFavorite(story); // favorite state based on currentUser.isFavorite(story)
  const starType = isFav ? "fas" : "far"; // fas = solid star, far = outline star (font awesome)

  const hostName = story.getHostName(); // uses model method to extract hostname from url
  return $(` 
      <li id="${story.storyId}">
        ${showTrash ? ` <span class="trash-can"><i class="fas fa-trash-alt"></i></span>` : ""}
        ${showStar ? `<span class="star"><i class="${starType} fa-star"></i></span>` : ""}
        <a href="${story.url}" target="_blank" class="story-link">
          ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>
        <small class="story-author">by ${story.author}</small>
        <small class="story-user">posted by ${story.username}</small>
      </li>
    `); // returns jQuery object for the <li>
}

/** Gets list of stories from server, generates their HTML, and puts on page. */

function putStoriesOnPage() { // clears existing list so you don't duplicate
  console.debug("putStoriesOnPage");

  $allStoriesList.empty();

  // loop through all of our stories and generate HTML for them
  for (let story of storyList.stories) { // loops through fetched stories and appends markup
    const $story = generateStoryMarkup(story);
    $allStoriesList.append($story);
  }

  $allStoriesList.show(); // ensures list is visible
}

async function submitNewStory(evt) { // stops default form submission (no page reload)
  console.debug("submitNewStory");
  evt.preventDefault();

  const newStoryData = { // reads values from the form
    title: $storyTitle.val().trim(),
    author: $storyAuthor.val().trim(),
    url: $storyUrl.val().trim(),
  };

  const story = await storyList.addStory(currentUser, newStoryData); // calls model method POST to API and return a 'story' instance

  const $storyMarkup = generateStoryMarkup(story); // adds new story to top of list without re-fetching everything
  $allStoriesList.prepend($storyMarkup);

  $storyForm.trigger("reset"); // resets form
  $storyForm.hide(); // hides form
  $allStoriesList.show(); // ensures story list visible
}
$storyForm.on("submit", submitNewStory); // binding
$allStoriesList.on("click", ".star", toggleFavorite); 

async function toggleFavorite(evt) { // prevent jump, only logged in users can favorite
  evt.preventDefault();
  if (!currentUser) return;

  const $li = $(evt.target).closest("li"); // find story ID closet to <li>
  const storyId = $li.attr("id");

  const $icon = $(evt.target).closest(".star").find("i"); // finds the <i> element to toggle fas/far
  const story = storyList.stories.find(s => s.storyId === storyId); // finds the story object in memory

  if (currentUser.isFavorite(story)) {
    await currentUser.removeFavorite(story);
    $icon.removeClass("fas").addClass("far");
  } else {
    await currentUser.addFavorite(story);
    $icon.removeClass("far").addClass("fas");
  }
}

async function deleteStory(evt) { // calls model api delete, removes from DOM, shows alert on failure
  evt.preventDefault();
  if (!currentUser) return;

  const $li = $(evt.target).closest("li");
  const storyId = $li.attr("id");

  console.log("Deleting story: ", storyId);

  try {
    await storyList.removeStory(currentUser, storyId);
    $li.remove();
    console.log("Deleted + removed from DOM: ", storyId);
  } catch (err) {
    console.error("Delete failed: ", err);
    alert("Could not delete story");
  }
}
$allStoriesList.on("click", ".trash-can", deleteStory);


function putFavoritesListOnPage() { // clears list and reuses the same <ol> to show favorites
  console.debug("putFavoritesListOnPage");
  $allStoriesList.empty();

  if (!currentUser || currentUser.favorites.length === 0) {
    $allStoriesList.append("<li>No favorites yet!</li>");
  } else {
    for (let story of currentUser.favorites) {
      $allStoriesList.append(generateStoryMarkup(story));
    }
  }

  $allStoriesList.show();
}


