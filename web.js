var ack = require('ac-koa').require('hipchat');
var request = require('koa-request');
var crypto = require('crypto');
var pkg = require('./package.json');

var app = ack(pkg);

var addon = app.addon().
            hipchat().
            allowRoom(true).
            scopes('send_notification');

// Makes a random hex value of a given length
var randomValueHex = function (len) {
    return crypto.randomBytes(Math.ceil(len/2)).
           toString('hex').
           slice(0, len);
}

// Gets a cute animal from reddit
var getCute = function *() {
  var subreddits = [
    "aww",
    "awwgifs",
    "babybeastgifs",
    "corgis",
    "goldenretrievers",
    "puppies",
    "Rabbits"
  ];

  var cacheBust = "_cache=" + randomValueHex(8);

  var url = "http://reddit.com/r/" +  
            subreddits.join("+") +
            "/random.json?" +
            cacheBust;

  console.log(url);

  var requestOptions = {
    url: url,
    headers: {
      "User-Agent": "cute-bot/v0.1.0 (by sre9981)",
      "Cache-Control": "no-cache"
    }
  };

  var response = yield request(requestOptions);
  var post = JSON.parse(response.body)[0].data.children[0];

  return {
    url: post.data.url,
    thumbnail: post.data.thumbnail,
    subreddit: post.data.subreddit
  }
};

// Sends a cute animal to hipchat
var sendCute = function *() {
  var cute = yield getCute();
  var message = "<strong>Here's a random cute animal from " +
                "/r/" + cute.subreddit +
                "</strong>" +
                "<br /><a href='" + cute.url + "'>" +
                "<img src='" + cute.thumbnail + "'/>" + 
                "<br />" + cute.url + "</a>"

  yield this.roomClient.sendNotification(message);
};

addon.webhook('room_message', /^\/cute$/, sendCute);

app.listen();
