"use strict";

/******************************************************************************
 * Handling navbar clicks and updating navbar
 */

/** Show main list of all stories when click site name */

function navAllStories(evt) {
  console.debug("navAllStories", evt);
  evt.preventDefault();

  hidePageComponents();
  $storiesContainer.show();
  putStoriesOnPage();
}

$body.on("click", "#nav-all", navAllStories);

/** Show login/signup on click on "login" */

function navLoginClick(evt) {
  console.debug("navLoginClick", evt);
  evt.preventDefault();

  hidePageComponents();
  $accountFormsContainer.show();
  $loginForm.removeClass("hidden").show();
  $signupForm.removeClass("hidden").show();
}

$navLogin.on("click", navLoginClick);

/** When a user first logins in, update the navbar to reflect that. */

function updateNavOnLogin() {
  console.debug("updateNavOnLogin");
  $navLogin.hide();
  $navLogOut.removeClass("hidden");
  $navUserProfile.text(`${currentUser.username}`).show();
  $navSubmit.removeClass("hidden");
  $navFavorites.removeClass("hidden");

}

function navSubmitClick(evt) {
  console.debug("navSubmitClick", evt);
  evt.preventDefault();
  hidePageComponents();
  $storyForm.removeClass("hidden").show();
}

function navFavoritesClick(evt) {
  console.debug("navFavoritesClick", evt);
  evt.preventDefault();

  hidePageComponents();
  $storiesContainer.show();
  putFavoritesListOnPage();
}

$navSubmit.on("click", navSubmitClick);
$navFavorites.on("click", navFavoritesClick);
