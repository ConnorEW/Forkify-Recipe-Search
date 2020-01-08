import axios from 'axios';
import { apikey, proxy, apikey2, apikey3 } from '../config';

export default class Recipe {
    constructor(id) {
        this.id = id;
    };

    async getRecipe() {
        try {
            const res = await axios(`${proxy}https://www.food2fork.com/api/get?key=${apikey}&rId=${this.id}`);
            // console.log(res);
            this.title = res.data.recipe.title;
            this.author = res.data.recipe.publisher;
            this.img = res.data.recipe.image_url;
            this.url = res.data.recipe.source_url;
            this.ingredients = res.data.recipe.ingredients;
            // console.log(res);
            
        }catch (error) {
            console.log(error);
        };
    };

    calcTime() {
        const numIng = this.ingredients.length;
        const periods = Math.ceil(numIng / 3);
        this.time = periods * 15;
    }

    calcServings() {
        this.servings = 4;
    }

    parseIngredients() {
        const unitsLong = ['tablespoons', 'tablespoon', 'ounces', 'ounce', 'oz,', 'teaspoons', 'teaspoon', 'cups', 'pound', 'heaping'];
        const unitsShort = ['tbsp', 'tbsp', 'oz', 'oz', 'oz', 'tsp', 'tsp', 'cup', 'pound', ''];

        const units = [...unitsShort, 'kg', 'g'];

        const newIngredients = this.ingredients.map(el => {
            
            // 1) Uniform units
            let ingredient = el.toLowerCase();
            
            unitsLong.forEach((unit, i) => {
                ingredient = ingredient.replace(unit, unitsShort[i]);
            });
            // console.log(ingredient);
            //2) Remove parentheses
            //this is a regular expression
            ingredient = ingredient.replace(/ *\([^)]*\) */g, " ");
            //3) Parse ingredients into count, unit and ingredient
            const arrIng = ingredient.split(' ');
            // console.log(arrIng);
            const unitIndex = arrIng.findIndex(el2 => units.includes(el2));

            let objIng;
            if(unitIndex > -1) {
                //there is a unit
                const arrCount = arrIng.slice(0, unitIndex);
                let count;
                if (arrCount.length === 1) {
                    count = eval(arrIng[0].replace('-', '+'));
                } else {
                    //eval, will calculate the value of the numbers
                    count = eval(arrIng.slice(0, unitIndex).join('+'));
                };

                objIng = {
                    count, 
                    unit: arrIng[unitIndex],
                    ingredient: arrIng.slice(unitIndex + 1).join(' ')
                };

            } else if (parseInt(arrIng[0], 10)) {
                //there is no unit but the first element is a number
                objIng = {
                    unit: '',
                    count: parseInt(arrIng[0], 10),
                    ingredient: arrIng.slice(1).join(' ')
                };
            } else if(unitIndex == -1) {
                //there is no unit and no number in the first position
                objIng = {
                    count: 1,
                    unit: '',
                    ingredient
                };
            };
            return objIng; 
        });
        this.ingredients = newIngredients;
    };

    updateServings (type) {
        //servings
        const newServings = type === 'dec' ? this.servings -1 : this.servings + 1;
        
        
        //ingredients
        this.ingredients.forEach(ing => {
            ing.count = ing.count * (newServings /this.servings);
        });

        this.servings = newServings;
    }


};