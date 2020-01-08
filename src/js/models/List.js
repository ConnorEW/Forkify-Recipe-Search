import uniqid from 'uniqid';

export default class List {
    constructor () {
        this.items = [];
    }

    additem (count, unit, ingredient) {
        const item = {
            id: uniqid(),
            count,
            unit,
            ingredient
            //adding a library called unique ID 
        }
        this.items.push(item);
        return item;
    }

    deleteItem (id){
        const index = this.items.findIndex(el => el.id === id);
        //splice, returns an element
        this.items.splice(index, 1);
    }

    updateCount (id, newCount) {
        this.items.find(el => el.id === id).count = newCount;
    }

    deleteAllItems(){
        //empty the items array
        this.items = [];
    }
}