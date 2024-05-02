const express = require("express");
const router = express.Router();
const path = require('path');

const app = express();

app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));
app.use('/fonts', express.static(path.join(__dirname, 'public/css/fonts')))
app.set("views", path.join(__dirname, "/views"));


/* import generated Trie */
const Trie = require("./public/scripts/trie");
const trie = require("./public/scripts/generate_trie");

// Import dictionary + details
const details = require("./public/dict/details.json");
const dict = require("./public/dict/dict.json");


router.get("/", async (req, res) => {
    if (req.query.q) {
        let searchInput = req.query.q.toLowerCase()
        let majorFormResult = trie.search(searchInput);
        let prefixResult = trie.startsWith(searchInput);

        // if query is found in trie, return major form of word
        if (majorFormResult) {
            // retreive data from details hash object
            let wordVars = [];
            let word = details[majorFormResult];
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
            }

            // either word not yet defined, or multiple words same spelling
            if (!word) {
                word = details[`${majorFormResult}@1`];
                // dummy word without details
                if (word) {
                    let v = 1;
                    while (word) {
                        v++;
                        wordVars.push(word);
                        word = details[`${majorFormResult}@${v}`];
                    }
                }
                else {
                    word = {
                        "word": majorFormResult,
                        "chinese": [],
                        "literal": "",
                        "phonetics": "",
                        "origin": [],
                        "meanings": []
                    };
                }
                // console.log(word);
            }

            if (wordVars.length == 0) wordVars = [word];
            let showVar = (wordVars.length > 1);

            // trim prefix results
            let pRTemp = [];
            prefixResult.forEach((result) => {
                if (!dict[majorFormResult].includes(result)) {
                    pRTemp.push(result);
                }
            });
            prefixResult = pRTemp;

            // render page
            res.render("./index", {
                searchInput: searchInput,
                wordVars: wordVars,
                showVar: showVar,
                showStyle: "display:block;visibility:visible;",
                alts: altsString,
                chineseLangs: ["hokkien", "cantonese", "teochew", "mandarin", "hakka", "hainanese", "hockchew", "wu", "chinese", "general chinese", "min nan"],
                prefixResult: prefixResult
            });
        }

        // if search query not found in Trie
        else {
            res.render("./not_found", {
                searchInput: searchInput,
                prefixResult: prefixResult
            });
        }
    }
    else {
        res.render("./index_blank");
    }
})


module.exports = router;