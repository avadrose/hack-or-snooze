"use strict";

// This is the global list of the stories, an instance of StoryList
let storyList;

/** Get and show stories when site first loads. */

async function getAndShowStoriesOnStart() {
  try{
    storyList = await StoryList.getStories();
    $storiesLoadingMsg.remove();
    putStoriesOnPage();
  } catch (err) {
    console.error("Failed to load stories:", err);
    $("#stories-loading-msg").text("Error loading stories — check console.");
  }
}

/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *
 * Returns the markup for the story.
 */

function generateStoryMarkup(story) {
  // console.debug("generateStoryMarkup", story);
  const showStar = Boolean(currentUser);
  const isFav = currentUser && currentUser.isFavorite(story);
  const starType = isFav ? "fas" : "far";


  const hostName = story.getHostName();
  return $(`
      <li id="${story.storyId}">
        ${showStar ? `<span class="star"><i class="${starType} fa-star"></i></span>` : ""}
        <a href="${story.url}" target="_blank" class="story-link">
          ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>
        <small class="story-author">by ${story.author}</small>
        <small class="story-user">posted by ${story.username}</small>
      </li>
    `);
}

/** Gets list of stories from server, generates their HTML, and puts on page. */

function putStoriesOnPage() {
  console.debug("putStoriesOnPage");

  $allStoriesList.empty();

  // loop through all of our stories and generate HTML for them
  for (let story of storyList.stories) {
    const $story = generateStoryMarkup(story);
    $allStoriesList.append($story);
  }

  $allStoriesList.show();
}

async function submitNewStory(evt) {
  console.debug("submitNewStory");
  evt.preventDefault();

  const newStoryData = {
    title: $storyTitle.val().trim(),
    author: $storyAuthor.val().trim(),
    url: $storyUrl.val().trim(),
  };

  const story = await storyList.addStory(currentUser, newStoryData);

  const $storyMarkup = generateStoryMarkup(story);
  $allStoriesList.prepend($storyMarkup);

  $storyForm.trigger("reset");
  $storyForm.hide();
  $allStoriesList.show();
}
$storyForm.on("submit", submitNewStory);
$allStoriesList.on("click", ".star", toggleFavorite);

async function toggleFavorite(evt) {
  evt.preventDefault();
  if (!currentUser) return;

  const $li = $(evt.target).closest("li");
  const storyId = $li.attr("id");

  const $icon = $(evt.target).closest(".star").find("i");
  const story = storyList.stories.find(s => s.storyId === storyId);

  if (currentUser.isFavorite(story)) {
    await currentUser.removeFavorite(story);
    $icon.removeClass("fas").addClass("far");
  } else {
    await currentUser.addFavorite(story);
    $icon.removeClass("far").addClass("fas");
  }
}

function putFavoritesListOnPage() {
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
