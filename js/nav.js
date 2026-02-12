"use strict";

/******************************************************************************
 * Handling navbar clicks and updating navbar
 */

/** Show main list of all stories when click site name */

function navAllStories(evt) { // this handler runs when user clicks the site name
  console.debug("navAllStories", evt); // helpful trace during development
  evt.preventDefault(); // stops href link form jumping to top of page

  hidePageComponents(); // resets UI and hides major sections
  $storiesContainer.show(); // show stories container again
  putStoriesOnPage(); // rerender stories list
}

$body.on("click", "#nav-all", navAllStories); // listens for clicks on nav-all

/** Show login/signup on click on "login" */

function navLoginClick(evt) {
  console.debug("navLoginClick", evt);
  evt.preventDefault();

  hidePageComponents();
  $accountFormsContainer.show();
  $loginForm.removeClass("hidden").show();
  $signupForm.removeClass("hidden").show();
}

$navLogin.on("click", navLoginClick); // direct binding to the login link element

/** When a user first logins in, update the navbar to reflect that. */

function updateNavOnLogin() {
  console.debug("updateNavOnLogin");
  $navLogin.hide(); // hide login link after successful login
  $navLogOut.removeClass("hidden"); // makes logout visible by removing hidden class
  $navUserProfile.text(`${currentUser.username}`).show(); // displays username in navbar
  $navSubmit.removeClass("hidden"); // shows submit and favorites link for logged in users
  $navFavorites.removeClass("hidden");

}

function navSubmitClick(evt) { // resets UI and shows submit story form
  console.debug("navSubmitClick", evt);
  evt.preventDefault();
  hidePageComponents();
  $storyForm.removeClass("hidden").show(); // correctly removes the hidden class
}

function navFavoritesClick(evt) { // resets UI 
  console.debug("navFavoritesClick", evt);
  evt.preventDefault();

  hidePageComponents();
  $storiesContainer.show(); // shows main stories container
  putFavoritesListOnPage(); // calls function to render favorites into the list element
}

$navSubmit.on("click", navSubmitClick); // direct binding on nav elements
$navFavorites.on("click", navFavoritesClick);
