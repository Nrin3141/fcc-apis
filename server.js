require("dotenv").config();
const express = require("express");
const mongo = require("mongodb");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const promise = mongoose.connect(
  process.env.MONGO_DB_CONNECTION_STRING,
  { useMongoClient: true }
);
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function() {});
const cors = require("cors");
const app = express();
const port = process.env.PORT || 3000;
const urlRegex = /^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/;

let urlSchema = new mongoose.Schema({
  original_url: String,
  short_url: Number
});

let urlModel = mongoose.model("sampleURL", urlSchema);

let userSchema = new mongoose.Schema({
  username: String,
  log: Array,
  count: Number
});

let Users = mongoose.model("user", userSchema);

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use("/public", express.static(process.cwd() + "/public"));
app.post("/api/shorturl/new", (req, res) => {
  if (urlRegex.test(req.body.url)) {
    urlModel.find(function(err, urls) {
      if (err) return console.error(err);
      let sampleURL = new urlModel({
        original_url: req.body.url,
        short_url: urls.length
      });
      sampleURL.save(err => {
        if (err) {
          return console.error(err);
        }
      });
      res.send(sampleURL);
    });
  } else {
    res.send({ error: "invalid URL" });
  }
});
app.get("/api/shorturl/:id", (req, res) => {
  urlModel.find({ short_url: req.params.id }, (err, data) => {
    if (err && !data) console.error(err);
    else res.redirect(data[0].original_url);
  });
});

app.post("/api/exercise/new-user", (req, res) => {
  let user = new Users({
    username: req.body.username
  });
  user.save(err => {
    if (err) {
      return console.error(err);
    }
  });
  res.send(user);
});

app.post("/api/exercise/add", (req, res) => {
  let newExercise = {
    description: req.body.description,
    date: req.body.date || new Date(),
    duration: req.body.duration
  };
  Users.findOne({ _id: req.body.userId }, function(err, doc) {
    if (err) console.error(err);
    doc.log = [...doc.log, newExercise];
    doc.count = doc.log.length;
    doc.save((err, data) => {
      if (err) console.error(err);
    });
    res.send(doc);
  });
});

app.get("/api/exercise/users", (req, res) => {
  Users.find((err, users) => {
    res.send(users);
  });
});

app.get("/api/exercise/log/:id", (req, res) => {
  Users.findOne({ _id: req.params.id }, (err, user) => {
    if (err && !data) console.error(err);
    else {
      let log = user.log.filter(entry => {
        if (req.query.from && req.query.to) {
          return entry.date >= req.query.from && entry.date <= req.query.to;
        } else {
          return true;
        }
      });
      let final = log.filter((e, i) => {
        if (req.params.id && i < req.query.int) {
          return true;
        }
      });
      let out = { count: user.count, log: final };
      res.send(out);
    }
  });
});
app.get("/", (req, res) => {
  res.sendFile(process.cwd() + "/views/index.html");
});
app.get("/shorturls", function(req, res) {
  res.sendFile(process.cwd() + "/views/shorturls.html");
});
app.get("/filedata", (req, res) => {
  res.sendFile(process.cwd() + "/views/filedata.html");
});
app.get("/exercises", function(req, res) {
  res.sendFile(process.cwd() + "/views/exercises.html");
});

app.listen(port, function() {
  console.log("Node.js listening on port " + port);
});
