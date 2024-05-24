const express = require("express");
const router = express.Router();
const path = require('path');
const fs = require("fs");

const app = express();

app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));
app.use('/fonts', express.static(path.join(__dirname, 'public/css/fonts')))
app.set("views", path.join(__dirname, "/views"));


// Import langs lists
const cats = require("../public/lists/cat/categories.js");


router.get("/cat", async (req, res) => {
    if (req.query.c) {
        let cat = req.query.c.toLowerCase();

        const filePath = path.join(__dirname, `../public/lists/cat/${cat}.js`);
        if (fs.existsSync(filePath)) {
            const catTerms = require(filePath);

            res.render("./catTerms", {
                cat: cat,
                catTerms: catTerms
            });
        } else {
            res.render("./langNotFound", {
                searchInput: cat
            });
        }
    } else {
        // generate main cats page
        res.render("./cats", {
            cats: cats,
        });
    }
})

module.exports = router;