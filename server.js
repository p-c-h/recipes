const express = require("express");
const fs = require("fs");
var bodyParser = require("body-parser");

const app = express();

app.set("view engine", "ejs");

app.listen(5050);

app.use(bodyParser.urlencoded({ extended: false }));

app.use(bodyParser.json());

app.get("/", (req, res) => {
  fs.readFile("./data/ingredients.json", (err, data) => {
    if (err) {
      console.log(err);
    }

    let sortedIngredients;

    if (data.length > 0) {
      const items = JSON.parse(data);

      sortedIngredients = items.sort((a, b) => {
        const nameA = a.name.toLowerCase();
        const nameB = b.name.toLowerCase();

        if (nameA < nameB) {
          return -1;
        }
        if (nameA > nameB) {
          return 1;
        }
        return 0;
      });
    }

    res.render("index", { ingredients: sortedIngredients });
  });
});

app.post("/", (req, res) => {
  console.log(req.body);
  res.send(req.body);
});
