# Take-Home: Todo List (Vanilla JS)

**Goal**: Build a todo app with **1-level nested drag & drop**, filters, and persistence — **no frameworks, no libraries**.

---

#  Todo App

A responsive, single-page **Nested Todo App** built with vanilla JavaScript, featuring **1-level nesting**, **drag & drop**, **filters**, and **persistent storage**.

---

## Overview

This project allows users to manage tasks and subtasks in an intuitive interface.
You can add todos, nest subtasks, reorder items with drag-and-drop, and filter by completion status.
All data is saved in **localStorage** for persistence between sessions.

---

### Tech Stack

-   HTML
-   CSS
-   JavaScript (Vanilla)

##  Core Requirements (Must-Have)

### 1. Add Todos

-   Add **top-level todos** by typing into an input and pressing **Enter**.
-   Each todo has a button or icon to **add a sub-task** beneath it.
-   Sub-tasks are displayed visually indented below their parent.
    Example

```
-   Buy groceries
    -   Buy milk
    -   Buy eggs
-   Read a book
    -   Chapter 1: Introduction
```

---

### 2. Drag & Drop (1-Level Nested)

Uses the **HTML5 Drag API** (`draggable`, `dragstart`, `dragover`, `drop`) to reorder tasks.

-   **Drag parent task:** Moves along with all its sub-tasks.
-   **Drag sub-task:** Can be dropped under a different parent or promoted to top-level.
-   **Visual indent:** Sub-tasks appear slightly indented for clarity.

---

### 3. Mark Complete / Delete

-   Each todo has a **checkbox** to mark completion.
-   Completed tasks are shown with a **strikethrough**.
-   A **delete icon** removes a task (and its sub-tasks, if any).

---

### 4. Filter Tabs

Toggle between task views:

-   **All**
-   **Active**
-   **Completed**

When filters are selected, the **URL hash** updates automatically:

-   `#all` → Show all tasks
-   `#active` → Show uncompleted tasks
-   `#completed` → Show completed tasks

---

### 5. Persistence (Local Storage)

-   Todos are **saved to localStorage** on every change.
-   On refresh, data is automatically reloaded.

---

### 6. Responsive Design

-   Works on both **desktop and mobile**.
-   Touch drag-and-drop is optional but considered a bonus.

---

## 📦 Deliverables

-   **Live Demo:** Hosted on [Vercel](https://vercel.com) / [Netlify](https://www.netlify.com) / [Github Pages](https://github.com)
-   **GitHub Repository:** With clean, descriptive commit messages and organized code.

---

## 🪞 Reflections

### Challenges Faced

-   **Designing the drag-and-drop rules for 1-level nesting.** The trickiest part was handling every combination of drag source and drop target (parent → parent, parent → subtask, subtask → parent, subtask → subtask) while guaranteeing the data never ends up more than one level deep. Cases like dropping a parent onto its *own* subtask needed special handling — the subtasks have to be "orphaned" back to the top level rather than creating a nesting loop.
-   **Keeping subtasks grouped with their parent during reordering.** Since todos are stored as a flat array, moving a parent task means its subtasks have to be pulled out and re-spliced alongside it so the underlying array order stays consistent with what's rendered.
-   **Deciding how to display a subtask when its parent is filtered out.** For example, under the "Active" filter, a completed parent with an active subtask would otherwise disappear along with context for that subtask. The solution was to render the parent in a muted "context-only" state whenever any of its subtasks are visible, even if the parent itself doesn't match the filter.
-   **Keeping filter state in sync with the URL hash.** Supporting bookmarkable/shareable filter links meant listening for `hashchange` events as well as button clicks, and making sure both stay in sync without causing redundant re-renders.
-   **Preventing XSS from user-entered text.** Since todo text is inserted via `innerHTML` for convenience, all user input is escaped before rendering to avoid script injection through task names.

### Suggestions for Improvement

-   **Touch support for drag-and-drop.** The current implementation relies on the HTML5 Drag and Drop API, which doesn't work well on mobile/touch devices. Adding pointer-event-based dragging (or a library-free touch polyfill) would make reordering usable on phones and tablets.
-   **Editing existing todos.** Currently there's no way to edit the text of a todo or subtask after creation — only add, complete, and delete. Inline editing (e.g., double-click to edit) would be a natural addition.
-   **Replacing `prompt()` for adding subtasks.** Using the native `prompt()` dialog works but feels dated and isn't very accessible. An inline input field that appears under the parent task would be more consistent with the rest of the UI.
-   **Drag-and-drop visual feedback.** Adding a placeholder/drop-indicator line to show exactly where an item will land (rather than just highlighting the target) would make reordering feel more precise.
-   **Undo for deletions.** Deleting a parent task also deletes all its subtasks with no confirmation — a brief "Undo" toast would help prevent accidental data loss.
-   **Animations for list changes.** Subtle transitions when items are added, removed, or reordered would make the UI feel more polished.
-   **Automated tests.** The app currently has no test coverage. Unit tests for the drag-and-drop reparenting logic in particular would help catch regressions, since that logic has many edge cases.
-   **Multiple lists or due dates.** Beyond the take-home requirements, supporting multiple todo lists, due dates, or priority levels could make the app more useful for real-world task management.
