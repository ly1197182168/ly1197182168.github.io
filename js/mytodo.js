'use strict';

const SECONDS = 1000 * 60 * 60 * 24;
const MONTHS = ['Jan.', 'Feb.', 'Mar.', 'Apr.', 'May.', 'Jun.', 'Jul.', 'Aug.', 'Sept.', 'Oct.', 'Nov.', 'Dec.'];
const PER_SECOND = 1000;

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

function initMenu() {
    var all = document.getElementById('all');
    var active = document.getElementById('active');
    var completed = document.getElementById('completed');
    var clearCompleted = document.getElementById('clear-completed');

    if (getStatus()) {
        all.classList.remove('selected');
        active.classList.remove('selected');
        completed.classList.remove('selected');
        document.getElementById(getStatus()).classList.add('selected');
    }

    all.addEventListener('click', function () {
        all.classList.add('selected');
        active.classList.remove('selected');
        completed.classList.remove('selected');
        setStatus('all');
        updatePage();
    });

    active.addEventListener('click', function () {
        all.classList.remove('selected');
        active.classList.add('selected');
        completed.classList.remove('selected');
        setStatus('active');
        updatePage();
    });

    completed.addEventListener('click', function () {
        all.classList.remove('selected');
        active.classList.remove('selected');
        completed.classList.add('selected');
        setStatus('completed');
        updatePage();
    });

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
                i--;
            }
        }
        updatePage();
    });
}

function initInput() {
    var toggleAll = document.getElementById('toggle-all');
    toggleAll.addEventListener('click', function () {
        let todoItems = document.getElementsByClassName('todo-item');
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

function initTodoLists() {
    var todoItems = getAll();
    for (let i = 0; i < todoItems.length; ++i) {
        addTodoItemUI(todoItems[i].date, todoItems[i]);
    }
}

function addTodoItem(detail, date) {
    var item = {};
    item.id = new Date().getTime();
    item.completed = false;
    item.date = date;
    item.detail = detail;
    add(item);

    addTodoItemUI(date, item)
}

function addTodoItemUI(date, item) {
    var todoDates = document.getElementsByClassName('todo-date');
    if (todoDates.length == 0) {
        addTodoList(item);
    } else {
        for (let i = 0; i < todoDates.length; i++) {
            if (date == todoDates[i].innerHTML) {
                addTodoItemInDate(todoDates[i].nextElementSibling, item);
                initTodoItem(item.id, item);
                updatePage();
                return;
            }
        }
        addTodoList(item);
    }

    initTodoItem(item.id, item);
    updatePage();
}

function addTodoList(item) {
    var container = document.getElementById('todo-list-container');
    var todoList = document.createElement('div');
    todoList.classList.add('todo-list');
    var status;
    var now = new Date().getTime();
    var date = new Date(item.date).getTime();
    if ((date - now) / SECONDS < -1) {
        status = 'expired';
    } else if ((date - now) / SECONDS < 3) {
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
            let curDate = new Date(todoDates[i].innerText);
            if (date < curDate) {
                container.insertBefore(todoList, todoDates[i].parentNode);
                return;
            }
        }
        container.appendChild(todoList);
    }
}

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

function getOffset(item) {
    var offset = [];
    offset[0] = item.offsetLeft;
    offset[1] = item.offsetTop;
    offset[2] = item.offsetWidth;
    offset[3] = item.offsetHeight;
    return offset;
}

function initTodoItem(id, item) {
    var todoItem = document.getElementById(id);
    var drag = false;
    var dragAlt;

    todoItem.addEventListener('touchstart', function (event) {
        drag = true;
        todoItem.classList.add('dragging');
        todoItem.style.zIndex = 100;
        let offset = getOffset(todoItem);
        todoItem.x = event.touches[0].clientX - offset[0];
        todoItem.y = event.touches[0].clientY - offset[1];

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

    todoItem.addEventListener('touchmove', function (event) {
        if (drag) {
            todoItem.style.left = (event.touches[0].clientX - todoItem.x) + 'px';
            todoItem.style.top = (event.touches[0].clientY - todoItem.y) + 'px';

            let todoItems = document.getElementsByClassName('todo-item');
            for (let i = 0; i < todoItems.length; ++i) {
                if (todoItems[i].id == todoItem.id) {
                    continue;
                }
                let offset = getOffset(todoItems[i]);
                if ((event.touches[0].clientX > offset[0]) && (event.touches[0].clientX < offset[0] + offset[2]) &&
                    (event.touches[0].clientY > offset[1]) && (event.touches[0].clientY < offset[1] + offset[3])) {
                    if (event.touches[0].clientY < offset[1] + offset[3] / 2) {
                        todoItems[i].parentElement.insertBefore(dragAlt, todoItems[i]);
                        break;
                    } else {
                        if (!todoItems[i].nextElementSibling) {
                            todoItems[i].parentElement.appendChild(dragAlt);
                            break;
                        } else {
                            todoItems[i].parentElement.insertBefore(dragAlt, todoItems[i].nextElementSibling);
                            break;
                        }
                    }

                }
            }

        }
    }, false);

    todoItem.addEventListener('touchend', function (event) {
        if (drag) {
            todoItem.style.position = 'static';
            todoItem.classList.remove('dragging');
            dragAlt.parentElement.insertBefore(todoItem, dragAlt);
            todoItem.parentElement.removeChild(dragAlt);
            drag = false;

            let offset = getOffset(todoItem);
            if (event.changedTouches[0].clientX > offset[0] + 0.85 * offset[2]) {
                let todoContent = todoItem.parentElement;
                let todoList = todoContent.parentElement;
                let container = document.getElementById('todo-list-container');
                if (todoContent.children.length == 1) {
                    container.removeChild(todoList);
                } else {
                    todoContent.removeChild(todoItem);
                }
            }

            let todoContents = document.getElementsByClassName('todo-content');
            for (let i = 0; i < todoContents.length; ++i) {
                let offset = getOffset(todoContents[i].parentElement.querySelector('.todo-date'));
                if ((event.changedTouches[0].clientX > offset[0]) && (event.changedTouches[0].clientX < offset[0] + offset[2]) &&
                    (event.changedTouches[0].clientY > offset[1]) && (event.changedTouches[0].clientY < offset[1] + offset[3])) {
                    todoContents[i].appendChild(todoItem);
                }
            }

            updateAllFromPage();
            updatePage();
        }
    }, false);


    todoItem.querySelector('.toggle').addEventListener('click', function () {
        updateTodo(id, item);
    });

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

    todoItem.querySelector('.delete').addEventListener('click', function () {
        removeTodo(id);
    });
}

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

function removeTodo(id) {
    remove(id);
    var container = document.getElementById('todo-list-container');
    var todoItem = document.getElementById(id);
    var todoContent = todoItem.parentElement;
    var todoList = todoContent.parentElement;
    if (todoContent.querySelectorAll('.todo-item').length == 1) {
        container.removeChild(todoList);
    } else {
        todoContent.removeChild(todoItem);
    }
    updatePage();
}

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

    let todoContents = document.getElementsByClassName('todo-content');
    for (let i = 0; i < todoContents.length; ++i) {
        if (todoContents[i].children.length == 0) {
            let todoList = todoContents[i].parentElement;
            container.removeChild(todoList);
        }
    }

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