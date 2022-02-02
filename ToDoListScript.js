// Call load function on page load to restore any previous tasks from internalStorage.
window.addEventListener('load', load);

// Enable/disable 'add task' button depending on the input value.
document.getElementById('input-task').addEventListener('input', function () {
    const addBtn = document.getElementById('add-task-button');
    (this.value.trim() === '') ?
        addBtn.disabled = true
        : addBtn.disabled = false;
});

// Adding new task with 'Enter' key.
document.getElementById('input-task').addEventListener('keydown', function () {
    if (event.key === 'Enter') {
        addSave();
    }
});

// Function for adding new task. Saves current state to localStorage and reloads list sorting.
function addSave() {
    addTask();
    save();
    setSorting();
}
document.getElementById('add-task-button').onclick = addSave;

// Main function for adding tasks (also used when loading from localStorage).
function addTask() {
    const text = document.getElementById('input-task');
    
    // Create all the necessary elements and text nodes for new list item.
    const liNode = document.createElement('li');
    const inputNode = document.createElement('input');
    const spanNode = document.createElement('span');
    const upBtnNode = document.createElement('button');
    const downBtnNode = document.createElement('button');
    const delBtnNode = document.createElement('button');
    const textNode = document.createTextNode(text.value);
    const up = document.createTextNode('\u25b3');
    const down = document.createTextNode('\u25bd');
    const del = document.createTextNode('\u2717');
    
    // Apply properties to created elements.
    inputNode.type = 'checkbox';
    inputNode.onclick = checkTask;
    inputNode.checked = false;
    spanNode.classList.add('task');
    upBtnNode.className = 'up-btn';
    upBtnNode.onclick = moveUp;
    downBtnNode.className = 'down-btn';
    downBtnNode.onclick = moveDown;
    delBtnNode.className = 'delete-btn';
    delBtnNode.onclick = delTask;
    
    // Set up DOM elements bindings.
    spanNode.appendChild(textNode);
    upBtnNode.appendChild(up);
    downBtnNode.appendChild(down);
    delBtnNode.appendChild(del);
    liNode.appendChild(inputNode);
    liNode.appendChild(spanNode);
    liNode.appendChild(upBtnNode);
    liNode.appendChild(downBtnNode);
    liNode.appendChild(delBtnNode);
    document.getElementById('task-list').appendChild(liNode);
    
    // Clear input field and disable 'add task' button.
    text.value = '';
    document.getElementById('add-task-button').disabled = true;
}

// Delete tasks, call save function.
function delTask() {
    this.parentElement.remove();
    save();
}

// Cross out finished tasks, call save function.
function checkTask() {
    this.nextElementSibling.classList.toggle('done');
    save();
}

// Save current state to internalStorage as JSON file.
function save() {
    const taskList = [];
    const tasks = document.querySelectorAll('li > span');
    for (let task of tasks) {
        let entry = {};
        entry.text = task.innerHTML;
        entry.class = task.className;
        taskList.push(entry);
    }
    localStorage.setItem('tasks', JSON.stringify(taskList));
}

// Load previous state from internalStorage from JSON file. Call addTask function for each entry.
// Call setSorting function to reload tasks sorting.
function load() {
    const taskList = JSON.parse(localStorage.getItem('tasks')) || [];
    for (let entry of taskList) {
        addTask();
        let last = document.querySelector('#task-list li:last-child span');
        last.innerHTML = entry.text;
        last.className = entry.class;
        if (last.className.includes('done')) {
            last.previousElementSibling.checked = true;
        }
    }
    setSorting();
}

// Function used to enable drag-sorting of tasks.
function setSorting () {
    const list = document.getElementById('task-list');
    const items = list.getElementsByTagName('li');
    let current = null;
    
    // Add drag events to all items of task list.
    for (let i of items) {
        i.draggable = true;
        i.ondragstart = () => {
            current = i;
            
            // Add class '.option' styling to all list items except the one being dragged.
            for (let it of items) {
                if (current !== it) {
                    it.classList.add('option');
                }
            }
            
            // Prevent triggering dragleave event when moving over item's child elements.
            for (let el of list.querySelectorAll('button, input, span')) {
                el.style.pointerEvents = 'none';
            }
        };
        
        // Remove added style classes after dragend.
        i.ondragend = () => {
            for (let it of items) {
                it.classList.remove('option', 'highlight');
            }
            
            // Restore initial pointer events of item's child elements after dragend.
            for (let el of list.querySelectorAll('button, input, span')) {
                el.style.pointerEvents = 'initial';
            }
        };
        
        // Enable drag/drop events other than default on items.
        i.ondragover = (ev) => ev.preventDefault();
        
        // Set/remove '.highlight' class of item when dragging over/out of it.
        i.ondragenter = () => {
            if (i !== current) {
                i.classList.add('highlight');
            }
        };
        i.ondragleave = () => i.classList.remove('highlight');
        
        // Set drop event handling. Insert item on proper position in the list. Call save function afterwards.
        i.ondrop = () => {
            let currentPos, dropPos;
            for (let it = 0; it < items.length; it++) {
                if (items[it] === current) {
                    currentPos = it;
                }
                if (items[it] === i) {
                    dropPos = it;
                }
            }
            if (dropPos < currentPos) {
                list.insertBefore(current, i);
            } else {
                list.insertBefore(current, i.nextSibling);
            }
            save();
        };
    }
}

// Function moves tasks up the list. Then calls save function.
function moveUp() {
    const item = this.parentNode;
    if (item.previousSibling !== null) {
        document.getElementById('task-list').insertBefore(item, item.previousSibling);
        save();
    }
}

// Function moves tasks down the list. Then calls save function.
function moveDown() {
    const item = this.parentNode;
    if (item.nextSibling !== null) {
        document.getElementById('task-list').insertBefore(item.nextSibling, item);
        save();
    }
}