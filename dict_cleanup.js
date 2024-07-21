const fs = require("fs");

let dict = require("./public/dict/dict.json");
var jsonOutPath = "./public/dict/dict.json";
var cleanCount = 0;

// create backup
fs.writeFile("./public/dict/dict BU.json", JSON.stringify(dict), "utf8", (err) => {
    if (err) throw err;
    console.log(`Created backup`);
});

// // sort
// let sorted = Object.keys(details).sort().reduce(
//     (obj, key) => {
//         obj[key] = details[key];
//         return obj;
//     },
//     {}
// );
// details = sorted;
// console.log(`Sorted all entries.`);


// edit file (delete unnecessary lines, change code as needed)
for (let [majForm, alts] of Object.entries(dict)) {
    // console.log(`${majForm} - ${alts}`);

    // delete majForm from the alts array
    if (alts.includes(majForm)) {
        alts = alts.filter((alt) => alt != majForm);
        dict[majForm] = alts;
        // console.log(`removed - ${majForm} -`)
        cleanCount++;
    }
}

fs.writeFile(jsonOutPath, JSON.stringify(dict), "utf8", (err) => {
    if (err) throw err;
    console.log(`Cleaned up dict: ${cleanCount} lines removed.`);
});