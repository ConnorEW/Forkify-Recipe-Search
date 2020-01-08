
import Search from './models/Search';
import * as searchView from './views/searchView';
import * as recipeView from './views/recipeView';
import * as listView from './views/listView';
import * as likeView from './views/likeView';
import { elements, renderLoader, clearLoader } from './views/base';
import Recipe from './models/Recipe';
import List from './models/List';
import Likes from './models/Likes';
/* Global State of the app 
    Search object
    Current recipe object
    Shopping List object
    Liked recipes
    All be stored at the same time and accessible whenever
*/
const state = {};

// window.state = state;

const controlSearch = async () => {
    // GEt query from search.js
    const query = searchView.getInput();
    // console.log(query)

    if (query) {
        //new search object and add to state
        state.search = new Search(query);

        //3 Prepare the user interface for results
        searchView.clearResults();
        searchView.clearInput();
        searchView.clearButtons();
        renderLoader(elements.searchRes);
        try {
            //4 Do the search
            await state.search.getResults();

            //5 Render results on UI
            // console.log(state.search.result)
            clearLoader();
            searchView.renderResults(state.search.result);
        } catch(err) {
            alert('Ran out of API calls, switch keys');
            clearLoader();
        }
    }
}
elements.searchForm.addEventListener('submit', e => {
    e.preventDefault();
    controlSearch();
})

elements.searchResPages.addEventListener('click', e => {
    searchView.clearResults();
    searchView.clearButtons();
    const btn = e.target.closest('.btn-inline');
    // console.log(e.target);
    if (btn) {
        const goToPage = parseInt(btn.dataset.goto, 10);
        searchView.renderResults(state.search.result, goToPage);
    }
});

//controller gets placed into this index.js an all in one file

/* 
 * Recipe Controller
 */

const controlRecipe = async () => {
    //Get ID from the url
    const id = window.location.hash.replace('#','');

    if (id) {
        //prepare the UI for changes
        recipeView.clearRecipe();
        renderLoader(elements.recipe);

        //Highlight Selected search item
        if (state.search){
            searchView.highLightSelected(id);
        }
        
        //create a new recipe object
        state.recipe = new Recipe(id);
        try {
            //get recipe data and parse ingredients
            await state.recipe.getRecipe();
            state.recipe.parseIngredients();

            //calc time and servings
            state.recipe.calcTime();
            state.recipe.calcServings();

            //render the recipe
            clearLoader();
            recipeView.renderRecipe(
                state.recipe,
                state.likes.isLiked(id)
                );

        } catch (err) {
            console.log(err);
            alert('Error processing recipe');
        }
    }
}

['hashchange', 'load'].forEach(event => window.addEventListener(event, controlRecipe));

/* 
    List Controller
*/

const controlList = () => {
    //Create a new list if there is none yet
    if (!state.list) state.list = new List();

    //add each ingredient to the list and the UI
    state.recipe.ingredients.forEach(el => {
        const item = state.list.additem(el.count, el.unit, el.ingredient);
        listView.renderList(item);
    });
};

//handle delete and update list item events
elements.shopping.addEventListener('click', e => {
    const id = e.target.closest('.shopping__item').dataset.itemid;
    // console.log(id);
    //handle the delete button
    if (e.target.matches('.shopping__delete, .shopping__delete *')){
        //delete item from the state
        state.list.deleteItem(id);

        //delete item from the UI
        listView.deleteItem(id);
    } else if (e.target.matches('.shopping__count-value')) {
        if (state.list.count > 1){
            const val = parseFloat(e.target.value, 10);
            state.list.updateCount(id, val);
        }
    }
});

elements.deleteIng.addEventListener('click', e =>{
    //select all the elements in the list
    //handle the delete button
    //delete item from the state
    if (state.list){
        state.list.deleteAllItems();
        //delete item from the UI
        listView.deleteAllItems();
        console.log(state.list);
    }
})
/* 
    Likes Controller
 */


const controlLike = () => {
    if (!state.likes) state.likes = new Likes();
    const currentID = state.recipe.id;

    //user has not yet liked the current recipe
    if (!state.likes.isLiked(currentID)){

        //add like to the state
        const newLike = state.likes.addLike(
            currentID, 
            state.recipe.title,
            state.recipe.author,
            state.recipe.img
            );
        //toggle the like button
        likeView.toggleLikeBtn(true);

        //add like to the ui list
        likeView.renderLike(newLike);

        //display the likes menu
        likeView.toggleLikeMenu(state.likes.getNumLikes());
        // console.log(state.likes);

    //User has liked the current data
    } else {
        //Remove like from the state
        state.likes.deleteLike(currentID);
        //toggle the like button
        likeView.toggleLikeBtn(false);
        //Remove like from the UI list
        likeView.deleteLike(currentID);
        // console.log(state.likes);
        likeView.toggleLikeMenu(state.likes.getNumLikes());
    }
    
    // console.log(state.likes.getNumLikes());
};

// Restore liked recipes on page reload

window.addEventListener('load', () => {
    state.likes = new Likes ();

    //restores likes
    state.likes.readStorage();

    //toggle like menu button
    likeView.toggleLikeMenu(state.likes.getNumLikes());

    //render all liked recipes
    state.likes.likes.forEach(like => likeView.renderLike(like));
});


//Handling button clicks in the webapp
elements.recipe.addEventListener('click', e => {
    if (e.target.matches('.btn-decrease, .btn-decrease *')){
        //decrease button is clicked
        if (state.recipe.servings > 1){
            state.recipe.updateServings('dec');
            recipeView.updateServingsIngredients(state.recipe);
        }
    } else if (e.target.matches('.btn-increase, .btn-increase *')){
        //increase button is clicked
        state.recipe.updateServings('inc');
        recipeView.updateServingsIngredients(state.recipe);
    } else if (e.target.matches('.recipe__btn--add', '.recipe__btn--add *')){
        // listView.clearList();
        // add ingredients to shopping list
        controlList();
    }else if (e.target.matches('.recipe__love, .recipe__love *')){
        controlLike();
    }
});
