const findRecipes = document.getElementById("findRecipes");
findRecipes.addEventListener("submit", function (e) {
  e.preventDefault();
  const checked = findRecipes.querySelectorAll(
    'input[type="checkbox"]:checked'
  );
  const selected = Array.from(checked).map((x) => x.value);
  fetch("/find", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(selected),
  })
    .then((res) => {
      if (res.ok) {
        console.log("SUCCESS");
      }
      return res.json();
    })
    .then((json) => console.log(json))
    .catch((err) => console.log("ERROR"));
});
