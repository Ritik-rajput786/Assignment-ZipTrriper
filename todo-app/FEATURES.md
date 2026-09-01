# Features

## What the app does

At its core, this is a basic todo manager — you can create a todo (title + description), see all of them in a list, click into one to see its full details, edit it later, mark it done, or delete it when you're finished with it.

## Frontend

Built with React, using Vite for the dev server since it's fast and needs almost no config. Kept it component-based rather than one big file:

- `TodoForm` — handles both creating and editing a todo
- `TodoList` — renders the whole list
- `TodoItem` — a single todo row
- `TodoDetails` — the full-detail view for one todo

Styling is plain CSS, and it's responsive enough to work on a phone screen without looking broken.

## Backend

An Express server exposing a REST API for the usual CRUD operations — create, read, update, delete. No database, just a JSON file for storage, which was enough for this project's scope.

## On the UI side

Nothing fancy — a clean, straightforward interface, input validation so you can't submit garbage data, the list updates dynamically as you add/edit/delete, and there's a dedicated details view when you want to see everything about a single todo at once.