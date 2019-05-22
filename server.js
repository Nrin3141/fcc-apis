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
db.once("open", () => {});
const cors = require("cors");
const app = express();
const port = process.env.PORT || 3000;
const urlRegex = /^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/;
const multer = require("multer");
const upload = multer({ dest: "uploads/" });
const fs = require("fs");

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

app.get("*/api/timestamp/:date_string?", function(req, res) {
  let date;
  if (req.params.date_string) {
    date = new Date(req.params.date_string);
  } else {
    date = new Date();
  }
  res.json({ unix: date.getTime(), utc: date.toUTCString() });
});

app.get("*/api/whoami", function(req, res) {
  res.json({
    ipaddress: req.ip,
    language: req.headers["accept-language"],
    software: req.headers["user-agent"]
  });
});
app.post("*/api/shorturl/new", (req, res) => {
  if (urlRegex.test(req.body.url)) {
    urlModel.find((err, urls) => {
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
app.get("*/api/shorturl/:id", (req, res) => {
  urlModel.find({ short_url: req.params.id }, (err, data) => {
    if (err && !data) console.error(err);
    else res.redirect(data[0].original_url);
  });
});

app.post("*/api/exercise/new-user", (req, res) => {
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

app.post("*/api/exercise/add", (req, res) => {
  let newExercise = {
    description: req.body.description,
    date: req.body.date || new Date(),
    duration: req.body.duration
  };
  Users.findOne({ _id: req.body.userId }, (err, doc) => {
    if (err) console.error(err);
    doc.log = [...doc.log, newExercise];
    doc.count = doc.log.length;
    doc.save((err, data) => {
      if (err) console.error(err);
    });
    res.send(doc);
  });
});

app.get("*/api/exercise/users", (req, res) => {
  Users.find((err, users) => {
    res.send(users);
  });
});

app.get("*/api/exercise/log/:id", (req, res) => {
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

app.post("*/api/fileanalyse", upload.single("upfile"), (req, res) => {
  let answer = { filename: req.file.originalname, size: req.file.size };
  fs.unlinkSync(__dirname + "/" + req.file.path);
  res.send(answer);
});
app.get("/", (req, res) => {
  res.sendFile(process.cwd() + "/views/index.html");
});
app.get("/timestamp", (req, res) => {
  res.sendFile(process.cwd() + "/views/timestamp.html");
});
app.get("/headers", (req, res) => {
  res.sendFile(process.cwd() + "/views/headers.html");
});
app.get("/shorturls", (req, res) => {
  res.sendFile(process.cwd() + "/views/shorturls.html");
});
app.get("/filedata", (req, res) => {
  res.sendFile(process.cwd() + "/views/filedata.html");
});
app.get("/exercises", (req, res) => {
  res.sendFile(process.cwd() + "/views/exercises.html");
});

app.listen(port, () => {
  console.log("Node.js listening on port " + port);
});
