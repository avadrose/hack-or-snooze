"use strict";

// So we don't have to keep re-finding things on page, find DOM elements once:

const $body = $("body"); // stores jQuery reference to body, prevents repeat

const $storiesLoadingMsg = $("#stories-loading-msg"); // refers to loading div, removed after stories load
const $allStoriesList = $("#all-stories-list"); // refers to ol where stories are rendered

const $storiesContainer = $(".stories-container"); // refers to stories section, used to hide or show main view
const $accountFormsContainer = $(".account-forms-container"); // wraps login forms and shown when user clicks

const $loginForm = $("#login-form");
const $signupForm = $("#signup-form");

const $navLogin = $("#nav-login");
const $navUserProfile = $("#nav-user-profile");
const $navLogOut = $("#nav-logout");

const $storyForm = $("#story-form");
const $storyTitle = $("#story-title");
const $storyAuthor = $("#story-author");
const $storyUrl = $("#story-url");

const $navSubmit = $("#nav-submit");
const $navFavorites = $("#nav-favorites");


/** To make it easier for individual components to show just themselves, this
 * is a useful function that hides pretty much everything on the page. After
 * calling this, individual components can re-show just what they want.
 */

function hidePageComponents() { // creates an array of page sections 
  const components = [
    $storiesContainer,
    $accountFormsContainer,
    $storyForm,
  ];
  components.forEach(c => c.hide()); // calls hide on each 
}

/** Overall function to kick off the app. */

async function start() {
  console.debug("start");

  // "Remember logged-in user" and log in, if credentials in localStorage
  await checkForRememberedUser();
  await getAndShowStoriesOnStart();

  // if we got a logged-in user
  if (currentUser) updateUIOnUserLogin();
}

// Once the DOM is entirely loaded, begin the app

console.warn("HEY STUDENT: This program sends many debug messages to" +
  " the console. If you don't see the message 'start' below this, you're not" +
  " seeing those helpful debug messages. In your browser console, click on" +
  " menu 'Default Levels' and add Verbose");
$(start);
