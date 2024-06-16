const fs = require("fs");

let dict = require("./public/dict/dict.json");
const A = 'abcdefghijklmnopqrstuvwxyz'.split('');
console.log(A);
let numWords = [];
for (let i = 0; i < A.length; i++) {
    const outPath = `./public/lists/az/${A[i]}.js`;
    let words = [];
    for (let [word, alts] of Object.entries(dict)) {
        // start with number
        if ((word[0] >= '0' && word[0] <= '9')) {
            numWords.push(word);
            delete dict[word];
        }
        // start with letter
        else if ((word[0] >= 'A' && word[0] <= 'Z') || (word[0] >= 'a' && word[0] <= 'z')) {
            if (word[0] == A[i]) {
                words.push(word);
                delete dict[word];
            }
        }
        // start with symbol
        else {
            // check next char
            if ((word[1] >= '0' && word[1] <= '9')) {
                numWords.push(word);
                delete dict[word];
            }
            else if (word[1] == A[i]) {
                words.push(word);
                delete dict[word];
            }
        }
    }
    words.sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));
    fs.writeFile(outPath, `const ${A[i]}List = ` + JSON.stringify(words) + `; module.exports = ${A[i]}List;`, "utf8", (err) => {
        if (err) throw err;
        console.log(`Added -${A[i]}- with entries:\n`, words);
    });
}

// num
fs.writeFile(`./public/lists/az/0-9.js`, `const numList = ` + JSON.stringify(numWords) + `; module.exports = numList;`, "utf8", (err) => {
    if (err) throw err;
    console.log(`Added -0-9- with entries:\n`, numWords);
});



