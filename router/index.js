const express = require("express");
const router = express.Router();
const path = require('path');

const app = express();

app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));
app.use('/fonts', express.static(path.join(__dirname, 'public/css/fonts')))
app.set("views", path.join(__dirname, "/views"));


/* import generated Trie */
const Trie = require("../public/scripts/trie");
const trie = require("../public/scripts/generate_trie");

// Import dictionary + details
const details = require("../public/dict/details.json");
const dict = require("../public/dict/dict.json");

// Import source details
const sources = require("../public/sources/sources.json");


router.get("/", async (req, res) => {
    if (req.query.q) {
        let searchInput = req.query.q.toLowerCase().trim();
        let majorFormResult = trie.search(searchInput);
        let prefixResult = trie.startsWith(searchInput);
        let results = [];
        // check if mFR is array
        // if more than one majorFormResult is found, show selection page
        if (majorFormResult && Array.isArray(majorFormResult) && majorFormResult.length > 1) {
            // trim prefix results
            let pRTemp = [];
            prefixResult.forEach((result) => {
                if (result != searchInput) {
                    pRTemp.push(result);
                }
            });
            prefixResult = pRTemp;

            majorFormResult.forEach((mfr) => {
                let result = retrieveWord(dict, details, mfr);
                results.push(result);
            });

            res.render("./index", {
                searchInput: searchInput,
                results: results,
                mFRs: majorFormResult,
                showStyle: "display:block;visibility:visible;",
                chineseLangs: ["hokkien", "cantonese", "teochew", "mandarin", "hakka", "hainanese", "hockchew", "wu", "chinese", "general chinese", "min nan"],
                prefixResult: prefixResult,
                sources: sources
            });
        }

        // if query is found in trie, return major form of word
        else if (majorFormResult) {
            let [altsString, wordVars, showVar] = retrieveWord(dict, details, majorFormResult)

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
                prefixResult: prefixResult,
                sources: sources
            });
        }

        // if search query not found in Trie
        else {
            res.render("./not_found", {
                searchInput: searchInput,
                prefixResult: prefixResult,
                sources: sources
            });
        }
    }
    else {
        let wotd = Wotd(details);
        if (wotd == false || typeof (wotd) != "string") {
            res.render("./index_blank");
        } else {
            let progress = Object.keys(details).length / Object.keys(dict).length * 100 * 0.98;     // around 2% have multiple hits
            res.render("./index_landing", {
                wotd: wotd,
                progress: progress
            });
        }
    }
})


/* retrieve word from mFR */
function retrieveWord(dict, details, majorFormResult) {
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

    return [altsString, wordVars, showVar];
}

// generate WOTD for landing page
function Wotd(words) {
    if (typeof (words) != "object") {
        return false;
    }
    const date = new Date();
    let offset = date.getTimezoneOffset() * 60000;  // convert mins to ms
    let day = (date.getTime() - offset) / 86400000 << 0; // convert ms to days & truncate to int
    let len = Object.keys(words).length;
    let i = xorShift(day) % len;  // generate seeded PRN that changes which array element is accessed every loop

    // console.log(day, len, xorShift(day), i, Object.entries(words)[i][1]["word"]);
    return Object.entries(words)[i][1]["word"];
}

// xorShift seeded PRNG fn
function xorShift(seed) {
    let x = seed;
    x ^= x << 13;
    x ^= x >> 17;
    x ^= x << 5;
    return x >>> 0; // Ensure non-negative integer
}


module.exports = router;