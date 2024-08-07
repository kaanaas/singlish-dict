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
const details = require("../public/dict/details.json");
const langs = require("../public/lists/lang/langs.json");
const langsExclPie = require("../public/lists/lang/langsExclPie.json");
let langsPie = Object.assign({}, langs);

// calculate pie chart info
let totalCount = 0;
let totalCountExcl = 0;
let langsArray = [];
let dashArray = [];
let colourArray = [];
let goldenAngle = 137.508;
let totalEntries = Object.keys(details).length;

for (const [lang, count] of Object.entries(langs)) {
    totalCount += count;
}
for (const [lang, count] of Object.entries(langsExclPie)) {
    totalCountExcl += count;
    langsPie[lang] -= count;
}

// resort pie langs
const alphaSortedLangsPie = Object.keys(langsPie).sort().reduce(
    (obj, key) => {
        obj[key] = langsPie[key];
        return obj;
    },
    {}
);
const sortedLangsPie = Object.fromEntries(
    Object.entries(alphaSortedLangsPie).sort(([, a], [, b]) => b - a)
);
langsPie = sortedLangsPie;
// console.log(langsPie);
// console.log(langs);

// calculate pie angles
const radius = 13;
const cf = 2 * Math.PI * radius;
let i = 0;
// const strokeOffset = cf / 4;
for (const [lang, count] of Object.entries(langsPie)) {
    let angle = count / (totalCount - totalCountExcl);
    // console.log(lang, angle);
    langsArray.push(lang);
    dashArray.push(angle * cf);
    colourArray.push(`hsl(${i * goldenAngle}, 72%, 34%)`);
    i++;
}


router.get("/langs", async (req, res) => {
    if (req.query.l) {
        let lang = req.query.l.toLowerCase();
        let Lang = lang.split(' ');
        let LangTemp = "";
        for (let i = 0; i < Lang.length; i++) {
            Lang[i] = Lang[i][0].toUpperCase() + Lang[i].substring(1);
            LangTemp += Lang[i];
            if (i != Lang.length) LangTemp += " ";
        }
        Lang = LangTemp;

        const filePath = path.join(__dirname, `../public/lists/lang/${lang}.js`);
        if (fs.existsSync(filePath)) {
            const langTerms = require(filePath);

            res.render("./langTerms", {
                lang: Lang,
                langTerms: langTerms
            });
        } else {
            res.render("./langNotFound", {
                searchInput: Lang
            });
        }
    } else {
        // generate main lang page
        // render page
        res.render("./langs", {
            langs: langs,
            langsPie: langsPie,

            // for pie chart only
            radius: radius,
            dashArray: dashArray,
            langsArray: langsArray,
            colourArray: colourArray,
            totalEntries: totalEntries
        });
    }
})

module.exports = router;