/* Author: 1651760 Yu Luo
 * Description:
 *   This JavaScript file implements features related to UI of mytodo, with calling functions in storage.js.
 */

'use strict';

// Milliseconds per day
const PER_DAY = 1000 * 60 * 60 * 24;
// Abbreviations of 12 months
const MONTHS = ['Jan.', 'Feb.', 'Mar.', 'Apr.', 'May.', 'Jun.', 'Jul.', 'Aug.', 'Sept.', 'Oct.', 'Nov.', 'Dec.'];
// Milliseconds per second
const PER_SECOND = 1000;


/**
 * @description: Set time in customized format and update it
 */
function updateTime() {
    var date = new Date();
    var year = date.getFullYear();
    var month = date.getMonth();
    month = MONTHS[month];
    var day = date.getDate();
    var hour = date.getHours();
    var minute = date.getMinutes();

    document.getElementById('clock').innerHTML = (hour < 10 ? '0' + hour : hour) +
        ':' + (minute < 10 ? '0' + minute : minute);
    document.getElementById('day').innerHTML = month + (day < 10 ? '0' + day : day);
    document.getElementById('year').innerHTML = year;
}

/**
 * @description: Initialize filter menu
 */
function initMenu() {
    var all = document.getElementById('all');
    var active = document.getElementById('active');
    var completed = document.getElementById('completed');
    var clearCompleted = document.getElementById('clear-completed');

    // Add filter according to the status in localStorage
    if (getStatus()) {
        all.classList.remove('selected');
        active.classList.remove('selected');
        completed.classList.remove('selected');
        document.getElementById(getStatus()).classList.add('selected');
    }

    // Add click listener for filter 'all'
    all.addEventListener('click', function () {
        all.classList.add('selected');
        active.classList.remove('selected');
        completed.classList.remove('selected');
        setStatus('all');
        updatePage();
    });

    // Add click listener for filter 'active'
    active.addEventListener('click', function () {
        all.classList.remove('selected');
        active.classList.add('selected');
        completed.classList.remove('selected');
        setStatus('active');
        updatePage();
    });

    // Add click listener for filter 'completed'
    completed.addEventListener('click', function () {
        all.classList.remove('selected');
        active.classList.remove('selected');
        completed.classList.add('selected');
        setStatus('completed');
        updatePage();
    });

    // Add click listener for clearing completed todos
    clearCompleted.addEventListener('click', function () {
        var container = document.getElementById('todo-list-container');
        var todoItems = document.getElementsByClassName('todo-item');
        for (let i = 0; i < todoItems.length; ++i) {
            let todoDetail = todoItems[i].querySelector('.todo-detail');
            if (todoDetail.classList.contains('completed')) {
                remove(todoItems[i].id);
                let todoContent = todoItems[i].parentElement;
                let todoList = todoContent.parentElement;
                if (todoContent.querySelectorAll('.todo-item').length == 1) {
                    container.removeChild(todoList);
                } else {
                    todoContent.removeChild(todoItems[i]);
                }
                // Ensure to get todoItems[i+1] in next loop
                i--;
            }
        }
        updatePage();
    });
}


/**
 * @description: Initialize todo input
 */
function initInput() {
    // Add click listener for toggling all todos
    var toggleAll = document.getElementById('toggle-all');
    toggleAll.addEventListener('click', function () {
        let todoItems = document.getElementsByClassName('todo-item');
        // All completed to all incompleted, part completed to all completed
        if (toggleAll.classList.contains('all-checked')) {
            updateAllCompleted(false);
            toggleAll.classList.remove('all-checked');
            for (let i = 0; i < todoItems.length; ++i) {
                let toggleImg = todoItems[i].querySelector('img');
                let todoDetail = todoItems[i].querySelector('.todo-detail');
                toggleImg.classList.remove('checked');
                todoDetail.classList.remove('completed');
            }
        } else {
            updateAllCompleted(true);
            toggleAll.classList.add('all-checked');
            for (let i = 0; i < todoItems.length; ++i) {
                let toggleImg = todoItems[i].querySelector('img');
                let todoDetail = todoItems[i].querySelector('.todo-detail');
                if (!toggleImg.classList.contains('checked')) {
                    toggleImg.classList.add('checked');
                    todoDetail.classList.add('completed');
                }
            }
        }
        updatePage();
    });

    // Add 'Enter' keyup listener for todo input
    var newDate = document.getElementById('new-date');
    newDate.valueAsDate = new Date();
    var newTodo = document.getElementById('new-todo');
    newTodo.addEventListener('keyup', function (event) {
        if (event.keyCode == 13) {
            let detail = newTodo.value;
            let date = newDate.value;
            if (detail != '') {
                addTodoItem(detail, date);
                newTodo.value = '';
            }
        }
        updatePage();
    });
}

/**
 * @description: Initialize todolists
 */
function initTodoLists() {
    var todoItems = getAll();
    for (let i = 0; i < todoItems.length; ++i) {
        addTodoItemUI(todoItems[i].date, todoItems[i]);
    }
}

/**
 * @description: Add a todo according to inputs
 * @param {String} detail
 * @param {Date} date
 */
function addTodoItem(detail, date) {
    var item = {};
    item.id = new Date().getTime();
    item.completed = false;
    item.date = date;
    item.detail = detail;

    // Add an item in localStorage
    add(item);
    addTodoItemUI(date, item)
}


/**
 * @description: Add a todo item if date exits or a todo list if date doesn't exit
 * @param {Date} date
 * @param {item} - {"id": new Date.getTime(), "completed": true/false, "date": "xxxx-xx-xx", "detail": }
 */
function addTodoItemUI(date, item) {
    var todoDates = document.getElementsByClassName('todo-date');
    if (todoDates.length == 0) {
        addTodoList(item);
    } else {
        for (let i = 0; i < todoDates.length; i++) {
            if (date == todoDates[i].innerHTML) {
                // Date of item already exits
                addTodoItemInDate(todoDates[i].nextElementSibling, item);
                initTodoItem(item.id, item);
                updatePage();
                return;
            }
        }
        addTodoList(item);
    }

    // Date of item doesn't exit
    initTodoItem(item.id, item);
    updatePage();
}

/**
 * @description: Add a todo list
 * @param {item} item
 */
function addTodoList(item) {
    var container = document.getElementById('todo-list-container');
    var todoList = document.createElement('div');
    todoList.classList.add('todo-list');
    var status;
    var now = new Date().getTime();
    var date = new Date(item.date).getTime();

    // Set todo status according to deadline
    if ((date - now) / PER_DAY < -1) {
        status = 'expired';
    } else if ((date - now) / PER_DAY < 3) {
        status = 'urgent';
    } else {
        status = 'adequate';
    }

    todoList.innerHTML = [
        '<div class="todo-date ' + status + '">' + item.date + '</div>',
        '<ul class="todo-content">',
        '   <li id=' + item.id + ' class="todo-item" >',
        '       <span class="toggle"><img ' + 'class="' + (item.completed ? 'checked' : '') + '"></span>',
        '       <div class="todo-detail ' + (item.completed ? 'completed' : '') + '">' + item.detail + '</div>',
        '       <span class="delete"><img></span>',
        '   </li>',
        '</ul>'
    ].join('');

    var todoDates = document.getElementsByClassName('todo-date');
    if (todoDates.length == 0) {
        container.appendChild(todoList);
    } else {
        for (let i = 0; i < todoDates.length; i++) {
            // Todo lists sorted by date ascending
            let curDate = new Date(todoDates[i].innerText);
            if (date < curDate) {
                container.insertBefore(todoList, todoDates[i].parentNode);
                return;
            }
        }
        container.appendChild(todoList);
    }
}

/**
 * @description: Add a todo item in param todoContent
 * @param {<ul>} todoContent
 * @param {item} item
 */
function addTodoItemInDate(todoContent, item) {
    var todoItem = document.createElement('li');
    todoItem.id = item.id;
    todoItem.classList.add('todo-item');
    todoItem.innerHTML = [
        '<span class="toggle"><img ' + 'class="' + (item.completed ? 'checked' : '') + '"></span>',
        '<div class="todo-detail ' + (item.completed ? 'completed' : '') + '">' + item.detail + '</div>',
        '<span class="delete"><img></span>'
    ].join('');
    todoContent.appendChild(todoItem);
}

/**
 * @description: Get offsetLeft, offsetTop, offsetWidth, offsetHeight of item
 * @param {<div todoitem>} item 
 * @return: An array consists of four offsets
 */
function getOffset(item) {
    var offset = [];
    offset[0] = item.offsetLeft;
    offset[1] = item.offsetTop;
    offset[2] = item.offsetWidth;
    offset[3] = item.offsetHeight;
    return offset;
}


/**
 * @description: Initialize all todo items
 * @param {Number} id
 * @param {<div todo-item>} item
 */
function initTodoItem(id, item) {
    var todoItem = document.getElementById(id);
    var drag = false;
    // Blank alternative element while dragging
    var dragAlt;

    // Add touch start listener for todo item
    todoItem.addEventListener('touchstart', function (event) {
        drag = true;
        todoItem.classList.add('dragging');
        todoItem.style.zIndex = 100;
        let offset = getOffset(todoItem);
        todoItem.x = event.touches[0].clientX - offset[0];
        todoItem.y = event.touches[0].clientY - offset[1];

        // Set the style.position of dragged item as absolute
        // Easier to set absolute position of dragged item while dragging
        todoItem.style.position = 'absolute';
        todoItem.style.left = offset[0] + 'px';
        todoItem.style.top = offset[1] + 'px';
        todoItem.style.width = offset[2] + 'px';
        todoItem.style.height = offset[3] + 'px';

        dragAlt = document.createElement('li');
        dragAlt.style.width = todoItem.style.width;
        dragAlt.style.height = todoItem.style.height;
        todoItem.parentElement.insertBefore(dragAlt, todoItem);
    }, false);

    // Add touch move listener for todo item
    todoItem.addEventListener('touchmove', function (event) {
        if (drag) {
            // Set absolute position of dragged item while touch moves
            todoItem.style.left = (event.touches[0].clientX - todoItem.x) + 'px';
            todoItem.style.top = (event.touches[0].clientY - todoItem.y) + 'px';

            // Check all todo items and find one to change its position
            let todoItems = document.getElementsByClassName('todo-item');
            for (let i = 0; i < todoItems.length; ++i) {
                if (todoItems[i].id == todoItem.id) {
                    continue;
                }
                let offset = getOffset(todoItems[i]);
                // Check if the touch point are in the area of todoItems[i]
                if ((event.touches[0].clientX > offset[0]) && (event.touches[0].clientX < offset[0] + offset[2]) &&
                    (event.touches[0].clientY > offset[1]) && (event.touches[0].clientY < offset[1] + offset[3])) {
                    // Check if clientY of touch point is above a half of todoItems[i] while moving up
                    if (event.touches[0].clientY < offset[1] + offset[3] / 2) {
                        // If it is. insert drag alternative before todoItems[i]
                        todoItems[i].parentElement.insertBefore(dragAlt, todoItems[i]);
                        break;
                    } else {
                        // If todoItems[i] is the last child in one todo list, use appendChild() instead of insertBefore
                        if (!todoItems[i].nextElementSibling) {
                            todoItems[i].parentElement.appendChild(dragAlt);
                            break;
                        } else {
                            // clientY of touch point is below a half of todoItems[i] while moving down
                            todoItems[i].parentElement.insertBefore(dragAlt, todoItems[i].nextElementSibling);
                            break;
                        }
                    }

                }
            }

        }
    }, false);

    // Add touch end listener for todo item
    todoItem.addEventListener('touchend', function (event) {
        if (drag) {
            todoItem.style.position = 'static';
            todoItem.classList.remove('dragging');
            dragAlt.parentElement.insertBefore(todoItem, dragAlt);
            todoItem.parentElement.removeChild(dragAlt);
            drag = false;

            let offset = getOffset(todoItem);
            // If clientX of touch end point is in the 20% of todo item in th rightside, then reove this item
            if (event.changedTouches[0].clientX > offset[0] + 0.8 * offset[2]) {
                let todoContent = todoItem.parentElement;
                let todoList = todoContent.parentElement;
                let container = document.getElementById('todo-list-container');
                if (todoContent.children.length == 1) {
                    container.removeChild(todoList);
                } else {
                    todoContent.removeChild(todoItem);
                }
            }

            // If touch end point is in the area of todo date tile, then add the dragged item to the end of the corresponding list
            let todoContents = document.getElementsByClassName('todo-content');
            for (let i = 0; i < todoContents.length; ++i) {
                let offset = getOffset(todoContents[i].parentElement.querySelector('.todo-date'));
                if ((event.changedTouches[0].clientX > offset[0]) && (event.changedTouches[0].clientX < offset[0] + offset[2]) &&
                    (event.changedTouches[0].clientY > offset[1]) && (event.changedTouches[0].clientY < offset[1] + offset[3])) {
                    todoContents[i].appendChild(todoItem);
                }
            }

            // Get all items from page and update localStorage
            updateAllFromPage();
            // Remove todo lists without any todo item
            updatePage();
        }
    }, false);

    // Add click listener for toggle button
    todoItem.querySelector('.toggle').addEventListener('click', function () {
        updateTodo(id, item);
    });

    // Add dblclick listener for todo detail
    var todoDetail = todoItem.querySelector('.todo-detail');
    todoDetail.addEventListener('dblclick', function () {
        todoItem.classList.add('editing');
        let edit = document.createElement('input');
        let finished = false;
        edit.setAttribute('type', 'text');
        edit.setAttribute('class', 'edit');
        edit.setAttribute('value', todoDetail.innerHTML);

        function finish() {
            if (finished) return;
            finished = true;
            todoItem.removeChild(edit);
            todoItem.classList.remove('editing');
        }

        edit.addEventListener('blur', function () {
            finish();
        });

        edit.addEventListener('keyup', function (event) {
            if (event.keyCode == 27) {
                finish();
            } else if (event.keyCode == 13) {
                todoDetail.innerHTML = this.value;
                item.detail = this.value;
                update(id, item);
                finish();
            }
        });

        todoItem.appendChild(edit);
        edit.focus();
    }, false);

    // Add click listener for delete button
    todoItem.querySelector('.delete').addEventListener('click', function () {
        removeTodo(id);
    });
}

/**
 * @description: Get all items from page and update localStorage
 */
function updateAllFromPage() {
    var todoItems = document.getElementsByClassName('todo-item');
    var items = [];
    for (let i = 0; i < todoItems.length; ++i) {
        let item = {};
        item.id = todoItems[i].id;
        item.completed = todoItems[i].querySelector('.todo-detail').classList.contains('completed');
        item.date = todoItems[i].parentElement.parentElement.querySelector('.todo-date').innerHTML;
        item.detail = todoItems[i].querySelector('.todo-detail').innerHTML;
        items.push(item);
    }
    updateAll(items);
}

/**
 * @description: Update the attribute completed for item with id and change css of it
 * @param {Number} id
 * @param {item} item
 */
function updateTodo(id, item) {
    item.completed = !item.completed;
    update(id, item);
    var todoItem = document.getElementById(id);
    var toggleImg = todoItem.querySelector('img');
    var todoDetail = todoItem.querySelector('.todo-detail');
    if (toggleImg.classList.contains('checked')) {
        toggleImg.classList.remove('checked');
        todoDetail.classList.remove('completed');
    } else {
        toggleImg.classList.add('checked');
        todoDetail.classList.add('completed');
    }
    updatePage();
}

/**
 * @description: Remove todo item
 * @param {Number} id
 */
function removeTodo(id) {
    remove(id);
    var container = document.getElementById('todo-list-container');
    var todoItem = document.getElementById(id);
    var todoContent = todoItem.parentElement;
    var todoList = todoContent.parentElement;
    // If the todo list only has one todo item and this item is going to be removed 
    if (todoContent.querySelectorAll('.todo-item').length == 1) {
        // Remove the whole list from container
        container.removeChild(todoList);
    } else {
        todoContent.removeChild(todoItem);
    }
    updatePage();
}

/**
 * @description: Update the whole page including filter menu, todo lists, toggle status and so on
 */
function updatePage() {
    var newTodo = document.getElementById('new-todo');
    var container = document.getElementById('todo-list-container');
    var todoItems = document.getElementsByClassName('todo-item');
    var menuFilter = document.getElementsByClassName('selected')[0].innerHTML;
    var textFilter = newTodo.value.toUpperCase();
    var leftCount = 0;

    for (let i = 0; i < todoItems.length; ++i) {
        let todoDetail = todoItems[i].querySelector('.todo-detail');
        if (!todoDetail.classList.contains('completed')) {
            leftCount++;
        }
        // Filter todo lists combining menu filter with text filter
        if ((menuFilter == 'All' || (menuFilter == 'Active' && !todoDetail.classList.contains('completed')) ||
                (menuFilter == 'Completed' && todoDetail.classList.contains('completed'))) && (todoDetail.innerHTML.toUpperCase().indexOf(textFilter) > -1)) {
            if (todoItems[i].parentElement.parentElement.style.display == 'none') {
                todoItems[i].parentElement.parentElement.style.display = 'block';
            }
            todoItems[i].style.display = 'flex';
        } else {
            todoItems[i].style.display = 'none';
            let noneCount = 0;
            let todoContent = todoItems[i].parentElement;
            let todoItemsInSameDate = todoContent.querySelectorAll('.todo-item');
            for (let j = 0; j < todoItemsInSameDate.length; ++j) {
                if (todoItemsInSameDate[j].style.display == 'none') {
                    noneCount++;
                }
            }
            if (noneCount == todoItemsInSameDate.length) {
                todoContent.parentElement.style.display = 'none';
            }
        }
    }

    // If a todo list doesn't have any todo item, then remove it 
    let todoContents = document.getElementsByClassName('todo-content');
    for (let i = 0; i < todoContents.length; ++i) {
        if (todoContents[i].children.length == 0) {
            let todoList = todoContents[i].parentElement;
            container.removeChild(todoList);
        }
    }

    // Update left todo count
    var completedCount = todoItems.length - leftCount;
    var count = document.getElementById('count');
    count.innerHTML = (leftCount || '0') + ' todo(s) left';
    var clearCompleted = document.getElementById('clear-completed');
    clearCompleted.style.visibility = completedCount > 0 ? 'visible' : 'hidden';

    var toggleAll = document.getElementById('toggle-all');
    if (todoItems.length != 0 && todoItems.length == completedCount) {
        toggleAll.classList.add('all-checked');
    } else {
        toggleAll.classList.remove('all-checked');
    }
}

window.onload = function () {
    updateTime();
    setInterval(updateTime, PER_SECOND);
    initDB();
    initMenu();
    initInput();
    initTodoLists();
};