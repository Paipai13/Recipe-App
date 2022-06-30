const mealsEl=document.getElementById("meals");
const favoriteContainer = document.getElementById("fav-meals");
const searchTerm = document.getElementById("search-term");
const searchButton= document.getElementById("search");
const mealInfoEl = document.getElementById("meal-info");
const mealPopup=document.getElementById("meal-popup");
const popupCloseButton=document.getElementById("close-popup");

getRandomMeal();
fetchFavMeals();

async function getRandomMeal() {
const resp = await fetch("https://www.themealdb.com/api/json/v1/1/random.php");
  const respData = await resp.json();
  const randomMeal = respData.meals[0];

  addMeal(randomMeal, true);
}

async function getMealById(id) {
const resp = await fetch("https://www.themealdb.com/api/json/v1/1/lookup.php?i="+id);

  const respData = await resp.json();
  const meal = respData.meals[0];

  return meal;
}

async function getMealsBySearch(term) {
const resp = await fetch(
  "https://www.themealdb.com/api/json/v1/1/search.php?s="+term
);

  const respData = await resp.json();
  const meals =  respData.meals;

  return meals;
}

function addMeal(mealData, random = false){
 
  console.log(mealData);
  
  const meal = document.createElement('div');
  meal.classList.add('meal');

  meal.innerHTML = `<div class ="meal-header">${random ? `<span class="random"> Random Recipe </span>` : ""}
<img 
src ="${mealData.strMealThumb}" 
alt= "${mealData.strMeal}"
/>
    <div class ="meal-body">
    <h4> ${mealData.strMeal} </h4>
    <button class="fav-button"> 
    <i class="fa-solid fa-heart"></i>
    </button>
    </div>
    </div> `;

  const button = meal.querySelector(".meal-body .fav-button");
    
  button.addEventListener("click", () => {          
    if(button.classList.contains("active")){
      
      removeMealLS(mealData.idMeal);
      button.classList.remove("active");
      

    } else{
      addMealLS(mealData.idMeal);
      button.classList.add("active");
      
    }

    fetchFavMeals();
    
    
  });

  meal.addEventListener("click", () => {
    showMealInfo(mealData);
  });

  mealsEl.appendChild(meal);
}

function addMealLS(mealId){
   const mealIds = getMealsLS();

  localStorage.setItem("mealIds" , JSON.stringify ([...mealIds, mealId]));
}

function removeMealLS(mealId){
  const mealIds = getMealsLS();

  localStorage.setItem("mealIds" , JSON.stringify (mealIds.filter((id) => id !== mealId))
);
}

function getMealsLS(){
  const mealIds = JSON.parse(localStorage.getItem("mealIds"));

  return mealIds === null ? [] : mealIds;
}

async function fetchFavMeals() {

  favoriteContainer.innerHTML="";
  
  const mealIds = getMealsLS();
  
  for (let i=0; i<mealIds.length; i++) {
    const mealId = mealIds[i];
    meal = await getMealById(mealId);

    addMealFav(meal);
  }
  
}
function addMealFav(mealData){ 
  const favMeal = document.createElement("li");
  
  favMeal.innerHTML = 
  `<img src="${mealData.strMealThumb}"     
    alt="${mealData.strMeal}">
    <span>${mealData.strMeal}</span>
        <button class="clear"><i class="fas fa-window-close"></i></button>`;

  const button=favMeal.querySelector('.clear');
  
  button.addEventListener('click', () => {
    removeMealLS(mealData.idMeal);

    fetchFavMeals();
  });
  
  favMeal.addEventListener("click", () => {
    showMealInfo(mealData);
  });
  
  favoriteContainer.appendChild(favMeal);
}

function showMealInfo(mealData){
  mealInfoEl.innerHTML ="";
  
  const mealEl=document.createElement("div");

const ingredients=[];
  
  for (let i=1; i<=20; i++){
  if (mealData['strIngredient'+i]){
    ingredients.push(`${mealData["strMeasure"+i]} ${mealData["strIngredient"+i]}`)
  }else{
    break
  }
}

mealEl.innerHTML=` <h1>${mealData.strMeal}</h1>
    <img src="${mealData.strMealThumb}" alt="${mealData.strMeal}">
  <div>
    <p>
      ${mealData.strInstructions}
    </p>
    <h3> Ingredients:</h3>
    <ul>
    ${ingredients
      .map(
        (ing) => `
    <li>${ing}</li>`
      )
      .join("")}
</ul>
`;
  
  mealInfoEl.appendChild(mealEl);

  mealPopup.classList.remove('hidden');
}

searchButton.addEventListener('click', async () => {
  mealsEl.innerHTML = '';
  const search = searchTerm.value;

  const meals = await getMealsBySearch(search);

if (meals){
  meals.forEach(meal => {
    addMeal(meal);
    });
  }
});

popupCloseButton.addEventListener('click', () => {
  
  mealPopup.classList.add("hidden");
});