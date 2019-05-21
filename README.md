# FCC Backend Projects!!!

This is filled with example backend API and Microservices Projects done for FreeCodeCamp's Backend License.
You can navigate the different projects by going to the main entry point for the site at url=https://apis.ricotrebeljahr.de and selecting the api you like.

If you want to clone and use this repository on your own machine simply clone it via git commands and then npm install, populate the .env.example with your own values for a mongo at mlab or similar and then you are good to go. Simply npm start to start the server at url=http://localhost:3000

# API Project: URL Shortener Microservice for freeCodeCamp

### User Stories

I can POST a URL to [project_url]/api/shorturl/new and I will receive a shortened URL in the JSON response. Example : {"original_url":"www.google.com","short_url":1}
If I pass an invalid URL that doesn't follow the valid http(s)://www.example.com(/more/routes) format, the JSON response will contain an error like {"error":"invalid URL"}. HINT: to be sure that the submitted url points to a valid site you can use the function dns.lookup(host, cb) from the dns core module.
When I visit the shortened URL, it will redirect me to my original link.
Creation Example:
POST [project_url]/api/shorturl/new - body (urlencoded) : url=https://www.google.com

Usage:
[this_project_url]/api/shorturl/3

Will redirect to:
https://www.freecodecamp.org/forum/

# Exercise Tracker REST API

#### A microservice project, part of Free Code Camp's curriculum

### User Stories

1. I can create a user by posting form data username to /api/exercise/new-user and returned will be an object with username and \_id.
2. I can get an array of all users by getting api/exercise/users with the same info as when creating a user.
3. I can add an exercise to any user by posting form data userId(\_id), description, duration, and optionally date to /api/exercise/add. If no date supplied it will use current date. Returned will the the user object with also with the exercise fields added.
4. I can retrieve a full exercise log of any user by getting /api/exercise/log with a parameter of userId(\_id). Return will be the user object with added array log and count (total exercise count).
5. I can retrieve part of the log of any user by also passing along optional parameters of from & to or limit. (Date format yyyy-mm-dd, limit = int)
