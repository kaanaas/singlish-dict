/* import Trie */
let json = require("../dict/dict.json");
const Trie = require("./trie");
const trie = new Trie();

// // populate Trie
// for (let i = 0; i < json.length; i++) {
//     trie.insert(json[i].toLowerCase());
// }

// populate Trie with major spellings + alts
for (const [key, value] of Object.entries(json)) {
    for (let i = 0; i < value.length; i++) {
        trie.insert(value[i].toLowerCase(), key.toLowerCase());
        // console.log(`- ${value[i]} - added to trie under entry - ${key} -.`);
    }
}

// console.log(trie, "\n\n... done!");

// Export Trie
module.exports = trie;