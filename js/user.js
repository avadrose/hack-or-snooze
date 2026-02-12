"use strict";

// global to hold the User instance of the currently-logged-in user
let currentUser;

/******************************************************************************
 * User login/signup/login
 */

/** Handle login form submission. If login ok, sets up the user instance */

async function login(evt) { // async calls api
  console.debug("login", evt);
  evt.preventDefault(); // prevents browsers default from submit/page refresh

  // grab the username and password
  const username = $("#login-username").val(); // pulls values from form inputs
  const password = $("#login-password").val();

  // User.login retrieves user info from API and returns User instance
  // which we'll make the globally-available, logged-in user.
  currentUser = await User.login(username, password); // calls model layer, which POSTs to login and returns User instance

  $loginForm.trigger("reset"); // clears the form

  saveUserCredentialsInLocalStorage(); // stores token and username to stay logged in
  updateUIOnUserLogin(); // updates the UI to logged in state
}

$loginForm.on("submit", login); // binds handler to login form submit

/** Handle signup form submission. */

async function signup(evt) { // same pattern, calls api
  console.debug("signup", evt);
  evt.preventDefault();

  const name = $("#signup-name").val(); // reads signup input values
  const username = $("#signup-username").val();
  const password = $("#signup-password").val();

  // User.signup retrieves user info from API and returns User instance
  // which we'll make the globally-available, logged-in user.
  currentUser = await User.signup(username, password, name); // calls model layer for /signup

  saveUserCredentialsInLocalStorage(); // store token and username
  updateUIOnUserLogin(); // update UI

  $signupForm.trigger("reset"); // reset form
}

$signupForm.on("submit", signup); // bind to signup form 

/** Handle click of logout button
 *
 * Remove their credentials from localStorage and refresh page
 */

function logout(evt) { // clears stored credentials
  console.debug("logout", evt);
  localStorage.clear();
  location.reload(); // reloads page to reset all in-memory state
}

$navLogOut.on("click", logout); // binds logout to the nav logout link

/******************************************************************************
 * Storing/recalling previously-logged-in-user with localStorage
 */

/** If there are user credentials in local storage, use those to log in
 * that user. This is meant to be called on page load, just once.
 */

async function checkForRememberedUser() { // checks if localStorage has the auth info
  console.debug("checkForRememberedUser");
  const token = localStorage.getItem("token");
  const username = localStorage.getItem("username");
  if (!token || !username) return false; // if not, exit early

  // try to log in with these credentials (will be null if login failed)
  currentUser = await User.loginViaStoredCredentials(token, username); // calls model method that Gets username and returns a user instance
}

/** Sync current user information to localStorage.
 *
 * We store the username/token in localStorage so when the page is refreshed
 * (or the user revisits the site later), they will still be logged in.
 */

function saveUserCredentialsInLocalStorage() { // writes token and username into localStorage
  console.debug("saveUserCredentialsInLocalStorage");
  if (currentUser) {
    localStorage.setItem("token", currentUser.loginToken); // stays logged in after refresh
    localStorage.setItem("username", currentUser.username);
  }
}

/******************************************************************************
 * General UI stuff about users
 */

/** When a user signs up or registers, we want to set up the UI for them:
 *
 * - show the stories list
 * - update nav bar options for logged-in user
 * - generate the user profile part of the page
 */

function updateUIOnUserLogin() { // post-auth UI transition
  console.debug("updateUIOnUserLogin");

  hidePageComponents(); // hides everything
  putStoriesOnPage(); // re-renders stories (star or trash icon appear)
  updateNavOnLogin(); // updates navbar
}

