const express = require("express");
const https = require('https');
const fs = require('fs');
const bodyParser = require('body-parser');
const processor = require('./webhook-handler');

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

server = https.createServer(app);

app.get("/", (req, res) => {
  res.send(req.query)
  // res.sendFile("index.html", { root: __dirname });
});

app.post('/webhook', (req, res) => {
  // const body = req.body
  // console.log(req)
  console.log("requested")
  processor(req, res)
})

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server listing on port ${PORT}`);
});

