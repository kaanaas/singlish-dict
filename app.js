const express = require("express");

const app = express();

app.set("view engine", "ejs");
app.use(express.static("public"));

app.listen(3000);


/* import generated Trie */
const Trie = require("./public/scripts/trie");
const trie = require("./public/scripts/generate_trie");

// Import dictionary + details
const details = require("./public/dict/details.json");
const dict = require("./public/dict/dict.json");

app.get("/", (req, res) => {

    /* move this to another function export eventaully... */
    let searchInput = req.query.q.toLowerCase();
    let majorFormResult = trie.search(searchInput);
    if (majorFormResult) {
        // retreive data from details hash object
        let word = details[majorFormResult];
        let showAltsStyle = "display:none;visibility:hidden;"
        let altsString = "";

        if (!word) {
            // dummy word without details
            word = {
                "word": majorFormResult,
                "alt": dict[majorFormResult],
                "chinese": [],
                "literal": "",
                "phonetics": "",
                "origin": [],
                "meanings": []
            }
            // console.log(word);
        }

        // list alternative spellings
        if (dict[majorFormResult].length) {
            for (let i = 0; i < dict[majorFormResult].length; i++) {
                if (dict[majorFormResult][i] != majorFormResult) {
                    altsString += dict[majorFormResult][i];
                    if (i < dict[majorFormResult].length - 1) {
                        altsString += `, `;
                    }
                }
            }
            // console.log(altsString);
            showAltsStyle = "display:block;visibility:visible;"
        }

        // render page
        res.render("./index", {
            redirected: searchInput,
            word: word,
            showStyle: "display:block;visibility:visible;",
            showAltsStyle: showAltsStyle,
            alts: altsString,
            chineseLangs: ["hokkien", "cantonese", "teochew", "mandarin", "hakka", "hainanese", "hockchew", "wu", "chinese", "general chinese"],
        });
    }

    // Search query not found in Trie
    else {
        res.render("./not_found", {
            searchInput: searchInput
        });
    }
});

// word request page
app.get("/word_request", (req, res) => {
    res.render("./word_request", {});
});

// sources page
app.get("/sources", (req, res) => {
    res.render("./sources", {});
});

// 404
app.use("/", (req, res) => {
    res.status(404).render("./404", {});
});