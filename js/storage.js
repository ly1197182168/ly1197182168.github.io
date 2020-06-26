(function () {
    'use strict';

    const db = 'mytodo';

    function add(item){
        var items = JSON.parse(localStorage.getItem(db));
        items.push(item);
        localStorage.setItem(db, JSON.stringify(items));
    }

    function remove(id){
        var items = JSON.parse(localStorage.getItem(db));
        for(var i = 0; i < items.length; ++i){
            if(items[i].id == id){
                items.splice(i, 1);
                return;
            }
        }
        localStorage.setItem(db, JSON.stringify(items));
    }

    function update(id, item){
        var items = JSON.parse(localStorage.getItem(db));
        for(var i = 0; i < items.length; ++i){
            if(items[i].id == id){
                items[i].completed = item.completed;
                items[i].date = item.date;
                items[i].detail = item.detail;
            }
        }
        localStorage.setItem(db, JSON.stringify(items));
    }
    
})();