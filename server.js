const express = require("express");
const fs = require("fs");
var bodyParser = require("body-parser");

const app = express();

app.set("view engine", "ejs");

app.listen(5050);

app.use(express.static("public"));

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

app.post("/find", (req, res) => {
  function findMatchingRecipes(ingredients, recipes) {
    const matchedRecipes = [];

    for (let i = 0; i < recipes.length; i++) {
      const recipe = recipes[i];
      let matchedCount = 0;

      for (let j = 0; j < recipe.ingredients.length; j++) {
        if (ingredients.includes(recipe.ingredients[j])) {
          matchedCount++;
        }
      }

      if (matchedCount > 0) {
        matchedRecipes.push({
          name: recipe.name,
          ingredients: recipe.ingredients,
          matchedCount,
        });
      }
    }

    matchedRecipes.sort((a, b) => b.matchedCount - a.matchedCount);

    return matchedRecipes;
  }

  fs.readFile("./data/recipes.json", function (err, data) {
    if (err) {
      console.log(err);
    }
    if (data.length > 0) {
      const recipes = JSON.parse(data);
      const ingredients = req.body["inStock[]"];
      const matchedRecipes = findMatchingRecipes(ingredients, recipes);
      res.render("index", matchedRecipes);
    } else {
      res.end();
    }
  });
});
