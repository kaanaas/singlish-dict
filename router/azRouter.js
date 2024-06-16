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
router.get(`/letter/:id?`, async (req, res) => {
    let id = req.params.id;
    if (!id || id == undefined || id == "") {
        id = '0-9';
    }

    const filePath = path.join(__dirname, `../public/lists/az/${id}.js`);
    if (fs.existsSync(filePath)) {
        const terms = require(filePath);
        res.render("./azTerms", {
            letter: id,
            terms: terms
        });
    } else {
        res.redirect("/404");
    }
});

module.exports = router;