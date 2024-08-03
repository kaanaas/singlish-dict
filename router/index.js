const express = require("express");
const router = express.Router();
const path = require("path");
try {
    const natural = require("natural");
} catch (e) {
    console.log(e);
}

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

// Import reverse indices
const rindexP = require("../public/lists/reverse_indexP.json");
const rindexS = require("../public/lists/reverse_indexS.json");

// Import source details
const sources = require("../public/sources/sources.json");

// predefined arrays
let chineseLangs = ["hokkien", "cantonese", "teochew", "mandarin", "hakka", "hainanese", "hockchew", "wu", "chinese", "general chinese", "min nan"];
let diacriticList = ["ã", "ẽ", "ĩ", "õ", "ũ"];

router.get("/", async (req, res) => {
    // Singlish direct search
    if (req.query.stype == undefined || req.query.stype == "sg") {
        if (req.query.q) {
            let searchInput = req.query.q.toLowerCase().trim().normalize('NFD').replace(/\p{Diacritic}/gu, '');     // removes ending spaces and punctuations, diacritics, etc.
            let majorFormResult = trie.search(searchInput);
            let prefixResult = trie.startsWith(searchInput);
            let results = [];

            // check if mFR is array
            // if more than one majorFormResult is found, show selection page
            if (majorFormResult && Array.isArray(majorFormResult) && majorFormResult.length > 1) {
                // // trim prefix results
                // let pRTemp = [];
                // prefixResult.forEach((result) => {
                //     if (result != searchInput) {
                //         pRTemp.push(result);
                //     }
                // });
                // prefixResult = pRTemp;
                prefixResult = prefixResult.filter((result) => result != searchInput && !majorFormResult.includes(result));

                majorFormResult.forEach((mfr) => {
                    let result = retrieveWord(dict, details, mfr);
                    results.push(result);
                });

                res.render("./index", {
                    searchInput: searchInput,
                    results: results,
                    mFRs: majorFormResult,
                    showStyle: "display:block;visibility:visible;",
                    chineseLangs: chineseLangs,
                    diacriticList: diacriticList,
                    prefixResult: prefixResult,
                    sources: sources
                });
            }

            // if query is found in trie, return major form of word
            else if (majorFormResult) {
                let [alts, wordVars, showVar] = retrieveWord(dict, details, majorFormResult)

                // trim prefix results
                let pRTemp = [];
                prefixResult.forEach((result) => {
                    if (!dict[majorFormResult].includes(result) && result != majorFormResult && result != searchInput) {
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
                    alts: alts,
                    chineseLangs: chineseLangs,
                    diacriticList: diacriticList,
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
    }

    // English type search
    else if (req.query.stype == "en") {
        let searchInput = req.query.q.toLowerCase().trim().normalize('NFD').replace(/\p{Diacritic}/gu, '');     // removes ending spaces and punctuations, diacritics, etc.
        let stemInput = natural.PorterStemmer.stem(searchInput);
        let enResultP = false, enResultS = false;

        if (rindexP.hasOwnProperty(stemInput)) {
            enResultP = rindexP[stemInput];
        }
        if (rindexP.hasOwnProperty(stemInput)) {
            enResultS = rindexS[stemInput];
        }

        // search details[searchInput] for result
        // if cannot find (?) give start of first def.
        // else if in both P and S top prio
        // else if in P second prio
        //      give excerpt "(pos.) ... abdfb s dbf *WORD* df ad ...."
        // else (in S) low prio
        //      give excerpt "... abdfb s dbf *WORD* df ad ...."

        res.render("./index_en", {
            searchInput: searchInput,
            stemInput: stemInput,
            checkedEn: true,
            enResultP: enResultP,
            enResultS: enResultS
        });
    }
})


/* retrieve word from mFR */
function retrieveWord(dict, details, majorFormResult) {
    // retreive data from details hash object
    let wordVars = [];
    let word = details[majorFormResult];
    // let altsString = "";

    // list alternative spellings (OLD CODE - Now just return alts array.)
    // if (dict[majorFormResult] && dict[majorFormResult].length) {
    //     for (let i = 0; i < dict[majorFormResult].length; i++) {
    //         if (dict[majorFormResult][i] != majorFormResult) {
    //             altsString += dict[majorFormResult][i];
    //             if (i < dict[majorFormResult].length - 1 && dict[majorFormResult][i + 1] != majorFormResult) {
    //                 altsString += `, `;
    //             }
    //         }
    //     }
    // }

    let alts = dict[majorFormResult];
    // this could save repeating alts in every dict entry
    // let alts = [majorFormResult, ...dict[majorFormResult]];

    // either word not yet defined, or multiple words same spelling
    if (!word) {
        word = details[`${majorFormResult}@1`];
        if (word) {
            let v = 1;
            while (word) {
                v++;
                wordVars.push(word);
                word = details[`${majorFormResult}@${v}`];
            }
        }
        else {
            // dummy word without details
            word = {
                // this line could be causing single letter result bug
                "word": majorFormResult[0],
                "origin": []
            };
        }
        // console.log(word);
    }

    if (wordVars.length == 0) wordVars = [word];
    let showVar = (wordVars.length > 1);

    return [alts, wordVars, showVar];
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