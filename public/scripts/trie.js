class TrieNode{
    constructor(){
        this.children = {};
        this.isWordEnd = false;
        this.word = [];
    }
};

class Trie {
    // Constructs the Trie w empty root node
    constructor(){
        this.root = new TrieNode();
    }

    // Word insertion
    insert(word){
        let node = this.root;
        for (let i = 0; i < word.length; i++) {
            // check each letter in word sequentially
            let char = word[i];
            // create new node if next letter is not already in the trie
            if(!node.children[char]){
                node.children[char] = new TrieNode();
            }
            // move to corresponding letter node
            node = node.children[char];
        }
        // once at the final letter of word, mark as a new word end (inserted)
        node.isWordEnd = true;
        node.word.push(word);
    }

    // Word insertion with major spelling(s)
    insert(word, majorForm) {
        let node = this.root;
        for (let i = 0; i < word.length; i++) {
            // check each letter in word sequentially
            let char = word[i];
            // create new node if next letter is not already in the trie
            if (!node.children[char]) {
                node.children[char] = new TrieNode();
            }
            // move to corresponding letter node
            node = node.children[char];
        }
        // once at the final letter of word, mark as a new word end (inserted)
        node.isWordEnd = true;
        node.word.push(majorForm);
    }

    // Search for word
    search(word){
        let node = this.root;
        for(let i = 0; i < word.length; i++){
            let char = word[i];
            // return false if word w next letter is not present
            if(!node.children[char]){
                return false;
            }
            // else move to next letter node
            node = node.children[char];
        }
        // if this is a valid word end, return true
        if(node.isWordEnd) return node.word;
        else return false;
    }

    // search by prefix (starts with)
    startsWith(prefix){
        let node = this.root;
        for (let i = 0; i < prefix.length; i++) {
            let char = prefix[i];
            // return false if word w next letter is not present
            if (!node.children[char]) {
                return false;
            }
            // else move to next letter node
            node = node.children[char];
        }
        // if there are nodes in trie with this prefix, return true
        return true;
    }
}

module.exports = Trie;