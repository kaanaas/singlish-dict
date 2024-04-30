const express = require("express");
const router = express.Router();
const path = require('path');

const app = express();

app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));
app.use('*/fonts', express.static(path.join(__dirname, 'public/fonts')))
app.set("views", path.join(__dirname, "/views"));


/* import generated Trie */
const Trie = require("./public/scripts/trie");
const trie = require("./public/scripts/generate_trie");

// Import dictionary + details
const details = require("./public/dict/details.json");
const dict = require("./public/dict/dict.json");


router.get("/", async (req, res) => {
    if ("fonts/SimSum.ttf") console.log("yes");
    if (req.query.q) {
        let searchInput = req.query.q.toLowerCase()
        let majorFormResult = trie.search(searchInput);

        // if query is found in trie, return major form of word
        if (majorFormResult) {
            // retreive data from details hash object
            let word = details[majorFormResult];
            let showAltsStyle = "display:none;visibility:hidden;"
            let altsString = "";

            // list alternative spellings
            if (dict[majorFormResult] && dict[majorFormResult].length) {
                for (let i = 0; i < dict[majorFormResult].length; i++) {
                    if (dict[majorFormResult][i] != majorFormResult) {
                        altsString += dict[majorFormResult][i];
                        if (i < dict[majorFormResult].length - 1 && dict[majorFormResult][i + 1] != majorFormResult) {
                            altsString += `, `;
                        }
                    }
                }
                // console.log(altsString);
                if (altsString.length > 0) showAltsStyle = "display:block;visibility:visible;"
            }

            // either word not yet defined, or multiple words same spelling
            if (!word) {
                word = details[`${majorFormResult}@1`];
                // dummy word without details
                if (!word) word = {
                    "word": majorFormResult,
                    "chinese": [],
                    "literal": "",
                    "phonetics": "",
                    "origin": [],
                    "meanings": []
                }
                // console.log(word);
            }

            // render page
            res.render("./index", {
                redirected: searchInput,
                word: word,
                showStyle: "display:block;visibility:visible;",
                showAltsStyle: showAltsStyle,
                alts: altsString,
                chineseLangs: ["hokkien", "cantonese", "teochew", "mandarin", "hakka", "hainanese", "hockchew", "wu", "chinese", "general chinese", "min nan"],
            });
        }

        // if search query not found in Trie
        else {
            res.render("./not_found", {
                searchInput: searchInput
            });
        }
    }
    else {
        res.render("./index_blank");
    }
})

module.exports = router;