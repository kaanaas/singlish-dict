const path = require('path');
const express = require("express");
require("dotenv").config();
const port = process.env.PORT || 3000;

const app = express();

app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));
app.set("views", path.join(__dirname, "/views"));

app.listen(port);

const index = require("./index");
app.get("/", index);

// word request page
app.get("/word_request", (req, res) => {
    res.render("./word_request", {});
});

// sources page
const sources = require("./public/sources/sources.json");
app.get("/sources", (req, res) => {
    res.render("./sources", { sources: sources });
});

// 404
app.use("/", (req, res) => {
    res.status(404).render("./404", {});
});