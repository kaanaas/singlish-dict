const express = require("express");
const app = express();

app.set("view engine", "ejs");
app.use(express.static("public"));

const fs = require("fs");
app.listen(5000);



// /* import generated Trie */
// const Trie = require("./public/scripts/trie");
// const trie = require("./public/scripts/generate_trie");

// Import dictionary details
var jsonOutPath = "./public/dict/details.json";
var jsonOutPathDict = "./public/dict/dict.json";
let details = require(jsonOutPath);
let dict = require(jsonOutPathDict);

var noDefDict = [];
for (const key in dict) {
    if (details[key] == undefined) noDefDict.push(key);
}

function splitQs(queries) {
    if (queries) {
        if (queries.length > 0) return queries.split(", ");
        else return false;
    }
    else return false;
}


app.get("/", (req, res) => {
    // create backup
    fs.writeFile("./public/dict/details copy.json", JSON.stringify(details), "utf8", (err) => {
        if (err) throw err;
        console.log(`Created backup`);
    });

    // sort
    if (req.query.sort == "") {
        const sorted = Object.keys(details).sort().reduce(
            (obj, key) => {
                obj[key] = details[key];
                return obj;
            },
            {}
        );

        fs.writeFile(jsonOutPath, JSON.stringify(sorted), "utf8", (err) => {
            if (err) throw err;
            console.log(`Sorted details`);
        });
    }

    // insertion
    else if (req.query.main) {
        let main = req.query.main.toLowerCase();

        if (main != "") {
            // insert blank entry
            if (details[main] == undefined) details[main] = {
                "word": main,
                "related": [],
                "usage": "",
                "phonetics": "",
                "origin": [],
                "meanings": [],
                "particles": []
            };

            /* process queries */
            let related = req.query.related.toLowerCase();
            let usage = req.query.usage;
            let phone = req.query.phone;

            let origin = req.query.origin;
            let script = req.query.script;
            let trad = req.query.trad;
            let roman = req.query.roman;
            let scheme = req.query.scheme;
            let lit = req.query.lit;
            let etyPath = req.query.etyPath;
            let etymology = req.query.ety;
            let etyLit = req.query.etyLit;

            let pos = req.query.pos;
            let def = req.query.def;
            let eg = req.query.eg;
            let egSrc = req.query.src;
            let syn = req.query.syn;
            let ant = req.query.ant;

            let pt = req.query.pt;
            console.log(pt);
            let ptMeaning = req.query.ptMeaning;
            let ptEg = req.query.ptEg;
            let ptSrc = req.query.ptSrc;
            let ptEffect = req.query.ptEffect;

            // formatting to arrays
            related = splitQs(related);

            if (!Array.isArray(origin)) {
                origin = [origin];
                script = [script];
                trad = [trad];
                roman = [roman];
                scheme = [scheme];
                lit = [lit];
            }
            if (!Array.isArray(pos)) {
                pos = splitQs(pos);
                def = [def];
                eg = [eg];
                egSrc = [egSrc];
                syn = [syn];
                ant = [ant];
            }
            if (!Array.isArray(pt)) {
                pt = [pt];
                ptMeaning = [ptMeaning];
                ptEg = [ptEg];
                ptSrc = [ptSrc];
                ptEffect = [ptEffect];
            }

            // format origin
            for (let i = 0; i < origin.length; i++) {
                origin[i] = origin[i].toLowerCase();
                script[i] = script[i].toLowerCase();
                roman[i] = roman[i].toLowerCase();
                scheme[i] = scheme[i].toLowerCase();
                lit[i] = lit[i].toLowerCase();
            }
            // console.log("origin:", origin);
            // console.log("script:", script);



            // related
            if (related) {
                console.log(details[main].hasOwnProperty("related"));
                if (!details[main].hasOwnProperty("related")) details[main].related = [];
                for (let i = 0; i < related.length; i++) {
                    if (related[i] != main && !details[main].related.includes(related[i])) details[main].related.push(related[i]);
                    details[main].related.sort();
                }
            }
            // usage
            if (usage != "") details[main].usage = usage;
            // phonetics
            if (phone != "") details[main].phonetics = phone;
            // origin
            if (origin && origin.length != 0 && origin[0].length != 0) {
                if (!details[main].hasOwnProperty("origin")) details[main].origin = [];
                for (let i = 0; i < origin.length; i++) {
                    details[main].origin.push({
                        "lang": origin[i],
                        "traditional": trad[i],
                        "simplified": script[i],
                        "roman": roman[i],
                        "romanization": scheme[i],
                        "lit": lit[i],
                        "etyPath": splitQs(etyPath[i]),
                        "etymology": splitQs(etymology[i]),
                        "etyLit": splitQs(etyLit[i])
                    });
                }
            }

            // meanings (allow for pushing new meaning w/o overwriting old ones)
            if (pos) {
                if (!details[main].hasOwnProperty("meanings") || details[main].meanings.length == 0) details[main].meanings = {};

                for (let i = 0; i < pos.length; i++) {
                    if (!details[main].meanings.hasOwnProperty(pos[i])) {
                        details[main].meanings[pos[i]] = [];
                    }
                    console.log(details[main].meanings[pos[i]]);
                    details[main].meanings[pos[i]].push({
                        "definition": def[i],
                        "example": eg[i],
                        "exampleSource": egSrc[i],
                        "synonyms": splitQs(syn[i]),
                        "antonyms": splitQs(ant[i])
                    });
                }
            }

            // // particles (allow for pushing new particle w/o overwriting old ones)
            if (pt && pt.length != 0 && pt[0].length != 0) {
                if (!details[main].hasOwnProperty("particles")) details[main].particles = [];
                for (let i = 0; i < pt.length; i++) {
                    details[main].particles.push({
                        "particle": pt[i],
                        "meaning": ptMeaning[i],
                        "example": ptEg[i],
                        "exampleSource": ptSrc[i],
                        "effect": ptEffect[i]
                    });
                }
            }

            // Write to file
            fs.writeFile(jsonOutPath, JSON.stringify(details), "utf8", (err) => {
                if (err) throw err;
                console.log(`Defined -${main}- with details: `, details[main]);
            });
        }
    }

    res.render("./detail_insert", { noDefDict });
});