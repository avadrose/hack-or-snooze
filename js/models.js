"use strict";

const BASE_URL = "https://hack-or-snooze-api.onrender.com";


/******************************************************************************
 * Story: a single story in the system
 */

class Story {

  /** Make instance of Story from data object about story:
   *   - {title, author, url, username, storyId, createdAt}
   */

  constructor({ storyId, title, author, url, username, createdAt }) { // represents item from the API
    this.storyId = storyId; // destructered objects
    this.title = title;
    this.author = author;
    this.url = url;
    this.username = username;
    this.createdAt = createdAt;
  }

  /** Parses hostname out of URL and returns it. */

  getHostName() { // utility mehod for UI display, parses the url and extracts domain
    return new URL(this.url).hostname;
  }
}


/******************************************************************************
 * List of Story instances: used by UI to show story lists in DOM.
 */

class StoryList { // represents collection of stories, stores arrayof story instances
  constructor(stories) {
    this.stories = stories;
  }

  /** Generate a new StoryList. It:
   *
   *  - calls the API
   *  - builds an array of Story instances
   *  - makes a single StoryList instance out of that
   *  - returns the StoryList instance.
   */

  
    // Note presence of `static` keyword: this indicates that getStories is
    //  **not** an instance method. Rather, it is a method that is called on the
    //  class directly. Why doesn't it make sense for getStories to be an
    //  instance method?

    // query the /stories endpoint (no auth required)
  static async getStories() { // static means this is called on the class StoryList.getStories() and fetches all stories from /stories
    const response = await axios({
      url: `${BASE_URL}/stories`,
      method: "GET",
    });

    // turn plain old story objects from API into instances of Story class
    const stories = response.data.stories.map(story => new Story(story)); // converts raw api objects into story objects

    // build an instance of our own class using the new array of stories
    return new StoryList(stories); // wraps into storyList instance and returns it
  }

  /** Adds story data to API, makes a Story instance, adds it to story list.
   * - user - the current instance of User who will post the story
   * - obj of {title, author, url}
   *
   * Returns the new Story instance
   */

  async addStory(user, newStory) { // instance method, adding to 'this' list, not making a brand new list
    const response = await axios({
      url: `${BASE_URL}/stories`,
      method: "POST", // creates a new story
      data: {
        token: user.loginToken,
        story: newStory,
      },
    });
    const story = new Story(response.data.story); // turns the returned story into a story instance

    this.stories.unshift(story); // adds new story to the front of the global list
    user.ownStories.unshift(story); // adds it to the current users 'own stories' list
    return story; // returns created story so UI can immediately render it
  } 

  async removeStory(user, storyId) {
    const url = `${BASE_URL}/stories/${storyId}`; // builds the story-speific endpoint
    console.log("DELETE URL: ", url);

    await axios.delete(url, {
      params: { token: user.loginToken }, // DELETE with token passed as query params
    });
// removes deleted story and updates local state so the UI can update immediately
    this.stories = this.stories.filter(s => s.storyId !== storyId); 
    user.ownStories = user.ownStories.filter(s => s.storyId !== storyId);
    user.favorites = user.favorites.filter(s => s.storyId !== storyId);
  }
}


/******************************************************************************
 * User: a user in the system (only used to represent the current user)
 */

class User { // represents logged in user
  /** Make user instance from obj of user data and a token:
   *   - {username, name, createdAt, favorites[], ownStories[]}
   *   - token
   */

  constructor({ // accepts a user data object and a token
                username,
                name,
                createdAt,
                favorites = [],
                ownStories = []
              },
              token) {
    this.username = username; // stores user identity fields
    this.name = name;
    this.createdAt = createdAt;

    // instantiate Story instances for the user's favorites and ownStories
    this.favorites = favorites.map(s => new Story(s)); // converts those arrays into Story instances
    this.ownStories = ownStories.map(s => new Story(s)); 

    // store the login token on the user so it's easy to find for API calls.
    this.loginToken = token; // stores token for authenticated API calls
  }

  /** Register new user in API, make User instance & return it.
   *
   * - username: a new username
   * - password: a new password
   * - name: the user's full name
   */

  static async signup(username, password, name) {
    const response = await axios({ // creates new account
      url: `${BASE_URL}/signup`,
      method: "POST",
      data: { user: { username, password, name } },
    });

    let { user } = response.data // pulls user object from response

    return new User(
      {
        username: user.username,
        name: user.name,
        createdAt: user.createdAt,
        favorites: user.favorites,
        ownStories: user.stories
      },
      response.data.token // returns user instance with token 
    );
  }

  isFavorite(story) { // checks if story is already in favorites
    return this.favorites.some(s => s.storyId === story.storyId);
  }

  async addFavorite(story) { // calls api to add favorite, updates local favorites list
    await axios({
      url: `${BASE_URL}/users/${this.username}/favorites/${story.storyId}`,
      method: "POST",
      data: { token: this.loginToken },
    });

    this.favorites.push(story);
  }

  async removeFavorite(story) { // calls api to remove this.favorites, then removes loaclly
    await axios({
      url: `${BASE_URL}/users/${this.username}/favorites/${story.storyId}`,
      method: "DELETE",
      data: { token: this.loginToken },
    });

    this.favorites = this.favorites.filter(s => s.storyId !== story.storyId);
  }


  /** Login in user with API, make User instance & return it.

   * - username: an existing user's username
   * - password: an existing user's password
   */

  static async login(username, password) {
    const response = await axios({
      url: `${BASE_URL}/login`,
      method: "POST",
      data: { user: { username, password } },
    });

    let { user } = response.data;

    return new User(
      {
        username: user.username,
        name: user.name,
        createdAt: user.createdAt,
        favorites: user.favorites,
        ownStories: user.stories
      },
      response.data.token
    );
  }

  /** When we already have credentials (token & username) for a user,
   *   we can log them in automatically. This function does that.
   */

  static async loginViaStoredCredentials(token, username) {
    try {
      const response = await axios({
        url: `${BASE_URL}/users/${username}`,
        method: "GET",
        params: { token },
      });

      let { user } = response.data;

      return new User(
        {
          username: user.username,
          name: user.name,
          createdAt: user.createdAt,
          favorites: user.favorites,
          ownStories: user.stories
        },
        token
      );
    } catch (err) {
      console.error("loginViaStoredCredentials failed", err);
      return null;
    }
  }
}
