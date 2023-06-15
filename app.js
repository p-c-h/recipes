const express = require("express");
const fs = require("fs");
var bodyParser = require("body-parser");

const app = express();

app.set("view engine", "ejs");

app.listen(5050, () => {
  console.log("Listening on port 5050");
});

app.use(express.static("public"));

app.use(bodyParser.urlencoded({ extended: false }));

app.use(bodyParser.json());

app.get("/", (req, res) => {
  fs.readFile("./data/ingredients.json", (err, data) => {
    let ingredients = [];
    const errors = [];
    if (err) {
      errors.push(err);
    } else {
      if (!data.length) {
        errors.push(new Error("ingredients.json is empty"));
      } else {
        ingredients = JSON.parse(data);

        ingredients.sort((a, b) => {
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
    }

    res.render("index", { ingredients, errors });
  });
});

app.post("/find", (req, res) => {
  function findMatchingRecipes(ingredients, recipes) {
    const matchedRecipes = [];

    for (let i = 0; i < recipes.length; i++) {
      const recipe = recipes[i];
      let matchedCount = 0;
      const missingIngredients = [];

      for (let j = 0; j < recipe.ingredients.length; j++) {
        const ingredient = recipe.ingredients[j];
        let ingredientName = ingredient.original;
        const substitutes = ingredient.substitutes || []; // Support for multiple substitutes

        if (
          ingredients.includes(ingredientName) ||
          substitutes.some((substitute) => ingredients.includes(substitute))
        ) {
          matchedCount++;
        } else {
          missingIngredients.push(ingredient);
        }

        const matchingSubstitute = substitutes.find((substitute) =>
          ingredients.includes(substitute)
        );
        if (matchingSubstitute) {
          ingredientName = matchingSubstitute;
        }
      }

      if (matchedCount > 0) {
        const ingredientNames = recipe.ingredients.map(
          (ingredient) => ingredient.original
        );

        matchedRecipes.push({
          name: recipe.name,
          ingredients: ingredientNames,
          matchedCount,
          missingIngredients,
        });
      }
    }

    matchedRecipes.sort((a, b) => b.matchedCount - a.matchedCount);

    return matchedRecipes;
  }

  const errors = [];
  const p1 = new Promise((resolve, reject) => {
    fs.readFile("./data/recipes.json", function (err, data) {
      if (err) {
        errors.push(err);
        resolve();
      } else {
        if (!data.length) {
          errors.push(new Error("recipes.json is empty"));
          resolve();
        } else {
          const recipes = JSON.parse(data);
          const selectedIngredients = req.body;
          const matchedRecipes = findMatchingRecipes(
            selectedIngredients,
            recipes
          );
          resolve(matchedRecipes);
        }
      }
    });
  });

  const p2 = new Promise((resolve, reject) => {
    fs.readFile("./data/ingredients.json", (err, data) => {
      if (err) {
        errors.push(err);
        resolve();
      }
      if (!data.length) {
        errors.push(new Error("ingredients.json is empty"));
        resolve();
      } else {
        data = JSON.parse(data.toString());
        const selectedIngredients = req.body;
        data.forEach((item) => {
          if (selectedIngredients.includes(item.name)) {
            item.inStock = true;
          } else {
            item.inStock = false;
          }
        });
        fs.writeFile("./data/ingredients.json", JSON.stringify(data), (err) => {
          if (err) {
            errors.push(err);
          }
        });
        resolve();
      }
    });
  });

  Promise.all([p1, p2]).then((data) => {
    console.log(data);
    res.send({ matchedRecipes: data[0] || [], errors });
  });
});
