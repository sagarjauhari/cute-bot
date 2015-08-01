Error.stackTraceLimit = Infinity;

var ack = require('ac-koa').require('hipchat');
var request = require('koa-request');
var crypto = require('crypto');
var pkg = require('./package.json');

var app = ack(pkg);

var addon = app.addon().
            hipchat().
            allowRoom(true).
            scopes('send_notification');

addon.webhook('room_message', /^\/hello$/, function *() {
  yield this.roomClient.sendNotification('Hi, ' + this.sender.name + '!');
});

function randomValueHex (len) {
    return crypto.randomBytes(Math.ceil(len/2)).
           toString('hex').
           slice(0, len);
}

var cuteMe = function *() {
  var cacheBust = "_cache=" + randomValueHex(8);

  var subreddits = [
    "aww",
    "awwgifs",
    "babybeastgifs",
    "corgis",
    "goldenretrievers",
    "puppies",
    "Rabbits"
  ];

  var url = "http://reddit.com/r/" +  
            subreddits.join("+") +
            "/random.json?" +
            cacheBust

  var requestOptions = {
    url: url,
    headers: {
      "User-Agent": "cute-bot/v0.1.0 (by sre9981)",
      "Cache-Control": "no-cache"
    }
  };

  var response = yield request(requestOptions);
  var post = JSON.parse(response.body)[0].data.children[0];
  var message = "<a href='" + post.data.url + "'>" +
                "<img src='" + post.data.thumbnail + "'/>" + 
                "<br />" + post.data.url + "</a>"

  yield this.roomClient.sendNotification(message);
};

addon.webhook('room_message', /^\/cute$/, cuteMe);

app.listen();
