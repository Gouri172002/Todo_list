// **************************************************
//  Todo App – Vanilla JS
//  1-level nested todos, drag & drop, filters, persistence
// ***************************************************


// State Management
let todos = [];
let currentFilter = 'all';

// DOM Elements
const listEl = document.getElementById("todo-list");
const inputEl = document.getElementById("new-todo");
const filterButtons = document.querySelectorAll(".filters button");
const emptyStateEl = document.getElementById("empty-state");

// Initialize App
function init() {
    loadFromLocalStorage();
    initFilters();
    setupEventListeners();
    render();
}

// *****************************************************
//  Event Listeners & Initialization
// *****************************************************
function setupEventListeners() {
    // Add top-level todo on Enter
    inputEl.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && inputEl.value.trim() !== "") {
            addTodo(inputEl.value.trim());
            inputEl.value = "";
        }
    });

    // Handle URL Hash change for filtering
    window.addEventListener("hashchange", handleHashChange);
}

function initFilters() {
    // Set initial filter based on URL hash or default to 'all'
    const hash = window.location.hash.replace('#', '');
    if (['all', 'active', 'completed'].includes(hash)) {
        currentFilter = hash;
    } else {
        currentFilter = 'all';
        window.location.hash = '#all';
    }
    updateFilterButtonsUI();

    // Add click listeners to filter buttons
    filterButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            const filter = btn.getAttribute("data-filter");
            window.location.hash = `#${filter}`;
        });
    });
}

function handleHashChange() {
    const hash = window.location.hash.replace('#', '');
    if (['all', 'active', 'completed'].includes(hash)) {
        currentFilter = hash;
        updateFilterButtonsUI();
        render();
    }
}

function updateFilterButtonsUI() {
    filterButtons.forEach(btn => {
        if (btn.getAttribute("data-filter") === currentFilter) {
            btn.classList.add("active");
        } else {
            btn.classList.remove("active");
        }
    });
}

// **************************************************
//  Todo Operations
// **************************************************
function addTodo(text, parentId = null) {
    const newTodo = {
        id: 'todo_' + Date.now() + Math.random().toString(36).substr(2, 5),
        text: text,
        completed: false,
        parentId: parentId // null for parent, string ID for subtask
    };

    todos.push(newTodo);
    saveToLocalStorage();
    render();
}

function toggleTodo(id) {
    const todo = todos.find(t => t.id === id);
    if (todo) {
        todo.completed = !todo.completed;

        // Cascade down: If a parent is toggled, update all its subtasks
        if (!todo.parentId) {
            todos.forEach(sub => {
                if (sub.parentId === todo.id) {
                    sub.completed = todo.completed;
                }
            });
        }

        saveToLocalStorage();
        render();
    }
}

function deleteTodo(id) {
    // Remove the item, and cascade delete subtasks if it's a parent
    todos = todos.filter(t => t.id !== id && t.parentId !== id);
    saveToLocalStorage();
    render();
}

function promptSubtask(parentId) {
    const text = prompt("Enter subtask description:");
    if (text && text.trim() !== "") {
        addTodo(text.trim(), parentId);
    }
}

// ******************************************************
//  Local Storage Persistence
// ******************************************************
function saveToLocalStorage() {
    localStorage.setItem("three_matters_todos", JSON.stringify(todos));
}

function loadFromLocalStorage() {
    const stored = localStorage.getItem("three_matters_todos");
    if (stored) {
        try {
            const parsed = JSON.parse(stored);
            todos = Array.isArray(parsed) ? parsed : [];
        } catch (e) {
            todos = [];
        }
    }
}

// ******************************************************
//  Drag and Drop (HTML5 API)
// ******************************************************
let draggedId = null;

function handleDragStart(e, id) {
    draggedId = id;
    e.currentTarget.classList.add("dragging");
    e.dataTransfer.effectAllowed = "move";
    // Some browsers require data to be set for drag to work properly
    e.dataTransfer.setData("text/plain", id);
}

function handleDragEnd(e) {
    e.currentTarget.classList.remove("dragging");
    draggedId = null;

    document.querySelectorAll('.todo').forEach(el => {
        el.classList.remove('drag-over');
    });
}

function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";

    const li = e.currentTarget;
    const targetId = li.dataset.id;

    // Don't highlight the item being dragged over itself
    if (draggedId && targetId !== draggedId) {
        li.classList.add('drag-over');
    }
}

function handleDragLeave(e) {
    e.currentTarget.classList.remove('drag-over');
}

function handleDrop(e, targetId) {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');

    if (!draggedId || draggedId === targetId) return;

    const draggedIdx = todos.findIndex(t => t.id === draggedId);
    const targetIdx = todos.findIndex(t => t.id === targetId);

    if (draggedIdx === -1 || targetIdx === -1) return;

    const draggedItem = todos[draggedIdx];
    const targetItem = todos[targetIdx];

    // --- 1-Level Nesting Constraints ---

    if (draggedItem.parentId && targetItem.parentId) {
        // Subtask dropped on Subtask -> Adopts the same parent
        draggedItem.parentId = targetItem.parentId;
    } 
    
    else if (draggedItem.parentId && !targetItem.parentId) {
        // Subtask dropped on Parent -> Becomes subtask of this parent
        draggedItem.parentId = targetItem.id;
    } 
    
    else if (!draggedItem.parentId && targetItem.parentId) {
        // Parent dropped on a Subtask
        if (targetItem.parentId === draggedItem.id) {
            // The subtask belongs to the dragged parent itself.
            // Dropping a parent "into" its own subtask list doesn't
            // make sense - instead, just orphan its subtasks to the
            // top level so the structure stays valid (1-level deep).
            todos.forEach(t => {
                if (t.parentId === draggedItem.id) t.parentId = null;
            });

        } 
        else {
            // Turn the dragged parent into a sibling subtask, and
            // orphan its own subtasks to the top-level to protect
            // the 1-level nesting limit.
            const newParentId = targetItem.parentId;
            todos.forEach(t => {
                if (t.parentId === draggedItem.id) t.parentId = null;
            });

            draggedItem.parentId = newParentId;
        }
    } 
    else {
        // Parent dropped on Parent -> Remains a top-level parent,
        // only its position in the list order changes.
        draggedItem.parentId = null;
    }

    // Reorder data array: move dragged item next to the target item.
    // If the dragged item is a top-level parent, bring its subtasks
    // along with it so the underlying order stays grouped.

    const children = draggedItem.parentId === null
        ? todos.filter(t => t.parentId === draggedItem.id)
        : [];

    todos = todos.filter(t => t.id !== draggedItem.id && !children.includes(t));

    const newTargetIdx = todos.findIndex(t => t.id === targetId);
    const insertAt = newTargetIdx === -1 ? todos.length : newTargetIdx;

    todos.splice(insertAt, 0, draggedItem, ...children);

    saveToLocalStorage();
    render();
}

// *****************************************************
//  Rendering Engine
// *****************************************************
function render() {
    listEl.innerHTML = "";

    const parents = todos.filter(t => !t.parentId);
    let visibleCount = 0;

    parents.forEach(parent => {
        const subtasks = todos.filter(t => t.parentId === parent.id);

        const passParent = matchFilter(parent);
        const visibleSubtasks = subtasks.filter(matchFilter);

        // Render the parent if it matches the filter itself, or if any
        // of its subtasks match - so a visible subtask always has its
        // parent shown for context.

        if (passParent || visibleSubtasks.length > 0) {
            const parentLi = createTodoDOMElement(parent, false);
            if (!passParent) {

                // Parent doesn't match the current filter on its own,
                // but is shown to give context for its visible subtasks.

                parentLi.classList.add("context-only");
            }

            listEl.appendChild(parentLi);
            visibleCount++;

            visibleSubtasks.forEach(sub => {
                const subLi = createTodoDOMElement(sub, true);
                listEl.appendChild(subLi);
                visibleCount++;
            });
        }
    });

    // Empty state messaging
    if (visibleCount === 0) {
        emptyStateEl.textContent = todos.length === 0
            ? "Nothing here yet. Add a task above to get started."
            : `No ${currentFilter} tasks.`;
        emptyStateEl.style.display = "block";
    } else {
        emptyStateEl.style.display = "none";
    }
}

function matchFilter(todo) {
    if (currentFilter === 'active') return !todo.completed;
    if (currentFilter === 'completed') return todo.completed;
    return true;
}

function createTodoDOMElement(todo, isSubtask) {
    const li = document.createElement("li");
    li.className = "todo";
    if (isSubtask) {
        li.classList.add("subtask");
    }

    li.setAttribute("draggable", "true");
    li.dataset.id = todo.id;

    const textStyle = todo.completed ? "text-decoration: line-through; opacity: 0.6;" : "";

    li.innerHTML = `
        <input type="checkbox" ${todo.completed ? 'checked' : ''} aria-label="Mark task complete" />
        <span class="text" style="${textStyle}">${escapeHTML(todo.text)}</span>
        ${!isSubtask ? '<span class="subtask-btn" title="Add Subtask" role="button" aria-label="Add subtask">➕</span>' : ''}
        <span class="delete" title="Delete Task" role="button" aria-label="Delete task">🗑️</span>
    `;

    // Interaction handlers
    const checkbox = li.querySelector('input[type="checkbox"]');
    checkbox.addEventListener("change", () => toggleTodo(todo.id));

    const deleteBtn = li.querySelector('.delete');
    deleteBtn.addEventListener("click", () => deleteTodo(todo.id));

    if (!isSubtask) {
        const subtaskBtn = li.querySelector('.subtask-btn');
        subtaskBtn.addEventListener("click", () => promptSubtask(todo.id));
    }

    // Drag events
    li.addEventListener("dragstart", (e) => handleDragStart(e, todo.id));
    li.addEventListener("dragend", handleDragEnd);
    li.addEventListener("dragover", handleDragOver);
    li.addEventListener("dragleave", handleDragLeave);
    li.addEventListener("drop", (e) => handleDrop(e, todo.id));

    return li;
}

// XSS Protection Helper
function escapeHTML(str) {
    return str.replace(/[&<>'"]/g,
        tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
}

// Fire up application on load
init();
