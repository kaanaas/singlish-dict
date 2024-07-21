class TrieNode {
    constructor() {
        this.children = {};
        this.isWordEnd = false;
        this.isMajorForm = false;
        this.word = [];
    }
};

class Trie {
    // Constructs the Trie w empty root node
    constructor() {
        this.root = new TrieNode();
    }

    // Word insertion
    insert(word) {
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
        node.word.push(word);
    }

    // Word insertion with major spelling(s)
    insert(word, majorForm) {
        // // prevent double entries (NOTE!!: adding this removes ability to return multiple hits)
        // if (this.search(word)) {
        //     return false;
        // }
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
        if (word == majorForm) {
            node.isMajorForm = true;
        }
        node.word.push(majorForm);
    }

    // Search for word
    search(word) {
        let node = this.root;
        for (let i = 0; i < word.length; i++) {
            let char = word[i];
            // return false if word w next letter is not present
            if (!node.children[char]) {
                return false;
            }
            // else move to next letter node
            node = node.children[char];
        }
        // if this is a valid word end, return true
        if (node.isWordEnd) return node.word;
        else return false;
    }

    // search by prefix (starts with)
    startsWith(prefix) {
        let ans = [];

        // prevent too short queries (1 or less)
        if (prefix.length < 2) return [];

        let node = this.root;
        for (let i = 0; i < prefix.length; i++) {
            let char = prefix[i];
            // return false if word w next letter is not present
            if (!node.children[char]) {
                return [];
            }
            // prev boolean implmentation: else move to next letter node
            node = node.children[char];
        }
        // console.log(node);

        // return array of ALL children
        let searchStack = [[node, prefix]];
        while (searchStack.length > 0) {
            // analyse top of stack (end element of array)
            [node, prefix] = searchStack.pop();

            // found a major form
            if (node.isWordEnd) {
                ans.push(prefix);
            }

            // add children to the stack with their letter appended to the running prefix
            for (const [letter, child] of Object.entries(node.children)) {
                searchStack.push([child, prefix + letter]);
            }
        }
        // if there are nodes in trie with this prefix, return them
        // console.log(ans);
        return ans;
    }
}

module.exports = Trie;