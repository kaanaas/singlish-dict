const fs = require("fs");

const details = require("./public/dict/details.json");
// const langs = require("./langs");

// structures for output
let langs = {};
let langTerms = {};
let sudah = [];

// trawl details
for (const [word, detail] of Object.entries(details)) {
    if (detail["origin"]) {
        sudah = [];
        for (let i = 0; i < detail["origin"].length; i++) {
            if (detail["origin"][i]["lang"]) {
                // add lang to langs + term to list
                // cases e.g. lang = "min nan / hakka"
                let language = detail["origin"][i]["lang"].split(" / ");

                for (let k = 0; k < language.length; k++) {
                    if (langs.hasOwnProperty(language[k]) && !sudah.includes(language[k])) {
                        langs[language[k]]++;
                        langTerms[language[k]].push(detail["word"]);
                        sudah.push(language[k]);
                    } else if (!langs.hasOwnProperty(language[k]) && !sudah.includes(language[k])) {
                        langs[language[k]] = 1;
                        langTerms[language[k]] = [detail["word"]];
                        sudah.push(language[k]);
                    }
                }
            }

            if (detail["origin"][i]["etyPath"]) {
                for (let j = 0; j < detail["origin"][i]["etyPath"].length; j++) {
                    // add path-lang to langs, ignore if primary is same lang + term to list
                    let langPath = detail["origin"][i]["etyPath"][j].split(" / ");

                    for (let k = 0; k < langPath.length; k++) {
                        if (langs.hasOwnProperty(langPath[k]) && !sudah.includes(langPath[k])) {
                            langs[langPath[k]]++;
                            langTerms[langPath[k]].push(detail["word"]);
                            sudah.push(langPath[k]);
                        } else if (!langs.hasOwnProperty(langPath[k]) && !sudah.includes(langPath[k])) {
                            langs[langPath[k]] = 1;
                            langTerms[langPath[k]] = [detail["word"]];
                            sudah.push(langPath[k]);
                        }
                    }
                }

            }
        }
        // console.log(sudah);
    }
}

// add special cases
for (let [lang, count] of Object.entries(langs)) {
    if (lang.toLowerCase().includes("latin")) {
        for (let i = 0; i < langTerms[lang].length; i++) {
            if (!langTerms["latin"].includes(langTerms[lang][i])) {
                langTerms["latin"].push(langTerms[lang][i]);
                langs["latin"]++;
            }
        }
    }
    if (lang.toLowerCase().includes("min nan")) {
        for (let i = 0; i < langTerms[lang].length; i++) {
            if (!langTerms["hokkien"].includes(langTerms[lang][i])) {
                langTerms["hokkien"].push(langTerms[lang][i]);
                langs["hokkien"]++;
            }
            if (!langTerms["teochew"].includes(langTerms[lang][i])) {
                langTerms["teochew"].push(langTerms[lang][i]);
                langs["teochew"]++;
            }
        }
    }
    if (lang.toLowerCase().includes("hindi") || lang.toLowerCase().includes("urdu")) {
        for (let i = 0; i < langTerms[lang].length; i++) {
            if (!langTerms["hindustani"].includes(langTerms[lang][i])) {
                langTerms["hindustani"].push(langTerms[lang][i]);
                langs["hindustani"]++;
            }
        }
    }
}

// sort
const alphaSortedLangs = Object.keys(langs).sort().reduce(
    (obj, key) => {
        obj[key] = langs[key];
        return obj;
    },
    {}
);

const sortedLangs = Object.fromEntries(
    Object.entries(alphaSortedLangs).sort(([, a], [, b]) => b - a)
);
langs = sortedLangs;

for (const [lang, entries] of Object.entries(langTerms)) {
    entries.sort();
}

console.log(`Found -${Object.keys(langs).length}- unique langs:\n`, langs);


// write to file
// clear old versions
fs.rmSync(`./public/lists/lang`, { recursive: true, force: true });
fs.mkdirSync(`./public/lists/lang`);

// langs list
const outPath = `./public/lists/lang/langs.json`;
fs.writeFile(outPath, JSON.stringify(langs), "utf8", (err) => {
    if (err) throw err;
    console.log(`\nCreated langs list.\n`);
});

// individual lang word lists
for (const [lang, entries] of Object.entries(langTerms)) {
    const outPath = `./public/lists/lang/${lang}.js`;
    entries.sort();
    fs.writeFile(outPath, `const langTerms = ` + JSON.stringify(entries) + `; module.exports = langTerms;`, "utf8", (err) => {
        if (err) throw err;
        // console.log(`Added -${lang}- with entries:\n`, entries);
    });
}



