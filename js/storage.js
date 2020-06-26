'use strict';

const DB = 'mytodo';

function initDB() {
    if (!localStorage.getItem(DB)) {
        localStorage.setItem(DB, '[]');
    }
}

function add(item) {
    var items = JSON.parse(localStorage.getItem(DB));
    items.push(item);
    localStorage.setItem(DB, JSON.stringify(items));
}

function remove(id) {
    var items = JSON.parse(localStorage.getItem(DB));
    for (let i = 0; i < items.length; ++i) {
        if (items[i].id == id) {
            items.splice(i, 1);
            break;
        }
    }
    localStorage.setItem(DB, JSON.stringify(items));
}

function get(id) {
    var items = JSON.parse(localStorage.getItem(DB));
    for (let i = 0; i < items.length; ++i) {
        if (items[i].id == id) {
            return items[i];
        }
    }
}

function getAll() {
    return JSON.parse(localStorage.getItem(DB));
}

function update(id, item) {
    var items = JSON.parse(localStorage.getItem(DB));
    for (let i = 0; i < items.length; ++i) {
        if (items[i].id == id) {
            items[i].completed = item.completed;
            items[i].date = item.date;
            items[i].detail = item.detail;
            break;
        }
    }
    localStorage.setItem(DB, JSON.stringify(items));
}

function updateAll(items) {
    localStorage.setItem(DB, JSON.stringify(items));
}

function updateAllCompleted(completed) {
    var items = JSON.parse(localStorage.getItem(DB));
    for (let i = 0; i < items.length; ++i) {
        items[i].completed = completed;
    }
    localStorage.setItem(DB, JSON.stringify(items));
}

function setStatus(status) {
    localStorage.setItem('status', status);
}

function getStatus() {
    return localStorage.getItem('status');
}