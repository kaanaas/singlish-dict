const express = require("express");

const app = express();

app.set("view engine", "ejs");
app.use(express.static("public"));

const fs = require("fs");

app.listen(8000);


// /* import generated Trie */
// const Trie = require("./public/scripts/trie");
// const trie = require("./public/scripts/generate_trie");

// Import dictionary details
var jsonOutPath = "./public/dict/dict.json";
let dict = require(jsonOutPath);


app.get("/", (req, res) => {
    // create backup
    fs.writeFile("./public/dict/dict copy.json", JSON.stringify(dict), "utf8", (err) => {
        if (err) throw err;
        console.log(`Created backup`);
    });

    if (req.query.sort == "") {
        const sorted = Object.keys(dict).sort().reduce(
            (obj, key) => {
                obj[key] = dict[key];
                return obj;
            },
            {}
        );

        fs.writeFile(jsonOutPath, JSON.stringify(sorted), "utf8", (err) => {
            if (err) throw err;
            console.log(`Sorted dict`);
        });
    }
    else if (req.query.main) {
        let main = req.query.main.toLowerCase();
        let alts = req.query.alts.toLowerCase();

        if (alts.length > 0) alts = alts.split(", ");
        else alts = false;

        if (main != "") {
            // insert
            if (dict[main] == undefined) dict[main] = [main];
            if (alts) {
                for (let i = 0; i < alts.length; i++) {
                    if (alts[i] != main && !dict[main].includes(alts[i])) dict[main].push(alts[i]);
                }
            }
        }

        fs.writeFile(jsonOutPath, JSON.stringify(dict), "utf8", (err) => {
            if (err) throw err;
            console.log(`Added -${main}- with alts`, alts);
        });
    }

    res.render("./dict_insert", {});
});