/* Author: 1651760 Yu Luo
 * Description:
 *   This JavaScript file implements features related to localStorage of mytodo.
 */

'use strict';


const DB = 'mytodo';

/**
 * @description: initialize db in localStorage
 */
function initDB() {
    if (!localStorage.getItem(DB)) {
        localStorage.setItem(DB, '[]');
    }
}

/**
 * @description: add an item to db
 * @param {item} item - {"id": new Date.getTime(), "completed": true/false, "date": "xxxx-xx-xx", "detail": }
 */
function add(item) {
    var items = JSON.parse(localStorage.getItem(DB));
    items.push(item);
    localStorage.setItem(DB, JSON.stringify(items));
}

/**
 * @description: remove an item by id
 * @param {number} id 
 */
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

/**
 * @description: get an item by id
 * @param {number} id 
 * @return: an item
 */
function get(id) {
    var items = JSON.parse(localStorage.getItem(DB));
    for (let i = 0; i < items.length; ++i) {
        if (items[i].id == id) {
            return items[i];
        }
    }
}

/**
 * @description: get all items
 * @return: all items
 */
function getAll() {
    return JSON.parse(localStorage.getItem(DB));
}

/**
 * @description: set the item with param id as the param item
 * @param {number} id
 * @param {item} item
 */
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

/**
 * @description: update all items
 * @param {item[]} items
 */
function updateAll(items) {
    localStorage.setItem(DB, JSON.stringify(items));
}

/**
 * @description: set the attribute of completed for all items as param completed
 * @param {bool} completed
 */
function updateAllCompleted(completed) {
    var items = JSON.parse(localStorage.getItem(DB));
    for (let i = 0; i < items.length; ++i) {
        items[i].completed = completed;
    }
    localStorage.setItem(DB, JSON.stringify(items));
}

/**
 * @description: set menu filter status
 * @param {String} status 
 */
function setStatus(status) {
    localStorage.setItem('status', status);
}

/**
 * @description: get menu filter status
 * @return: menu filter status1
 */
function getStatus() {
    return localStorage.getItem('status');
}