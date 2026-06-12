# Todo List – Three Matters Labs

A lightweight, dependency-free todo list app built with vanilla HTML, CSS, and JavaScript. Supports one level of subtasks, drag-and-drop reordering, hash-based filtering, and persistence via `localStorage`.

## Features

- **Add tasks** — type in the input box and press `Enter`.
- **Subtasks** — click the ➕ icon on any top-level task to add a nested subtask (one level deep).
- **Complete tasks** — check the box to mark a task done. Marking a parent task complete cascades to all its subtasks.
- **Delete tasks** — click 🗑️ to remove a task. Deleting a parent also removes its subtasks.
- **Filters** — switch between `#all`, `#active`, and `#completed` views. The active filter is reflected in the URL hash, so it's bookmarkable and shareable.
- **Drag and drop** — reorder tasks, turn a task into a subtask, promote a subtask to top-level, or regroup subtasks under a different parent, all while preserving the 1-level nesting rule.
- **Persistence** — all tasks are saved automatically to `localStorage` and restored on page reload.

## Getting Started

No build steps or dependencies required.

1. Clone or download this repository.
2. Open `index.html` in your browser.

That's it — the app runs entirely client-side.

## Project Structure

```
.
├── index.html   # App markup
├── style.css    # Styling
└── app.js       # App logic (state, rendering, drag & drop, persistence)
```

## How It Works

- **State**: Todos are stored as a flat array of objects, each with `id`, `text`, `completed`, and `parentId` (`null` for top-level tasks, or the parent's `id` for subtasks).
- **Rendering**: The list is fully re-rendered on every state change. Parent tasks are shown if they match the active filter, or if any of their subtasks do (so a visible subtask always has its parent for context).
- **Drag and drop**: Uses the native HTML5 Drag and Drop API. Dropping a task onto another applies a set of rules to keep the hierarchy at most one level deep — for example, dropping a subtask onto a parent makes it a subtask of that parent, and dropping a parent onto another parent's subtask demotes it to a sibling subtask while its own subtasks are promoted to top-level.
- **Persistence**: Todos are serialized to JSON and saved under the `three_matters_todos` key in `localStorage`.

## Browser Support

Works in any modern browser that supports the HTML5 Drag and Drop API, `localStorage`, and ES6 JavaScript (Chrome, Firefox, Edge, Safari).

## License

This project is provided as-is for personal or educational use. Feel free to fork and adapt it.
