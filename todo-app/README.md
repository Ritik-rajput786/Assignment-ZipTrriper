Todo App

A simple full-stack todo list app I built to practice React + Express. Frontend is React (with Vite), backend is Express, and instead of a database it just reads/writes a JSON file — kept things simple since this was mainly a learning project.

It's a multi-page app, not a single-page app — there are two actual HTML pages:

Todo List page — add, edit, complete, and delete todos
Todo Details page — click into a todo to see its full info (created date/time, status, etc.)
Features
See all your todos in one list
Add new ones with a quick form
Check them off as complete/incomplete
Edit a title inline (with save/cancel)
Delete with a confirmation prompt so you don't nuke something by accident
Click a todo to open a details page with more info
Works fine on mobile too
Shows success/error messages and loading states so you're not left guessing what's happening
Everything gets saved to a file automatically, so data survives a server restart
Stack
Layer	Tech	Why
Frontend	React 18	UI
Frontend build	Vite	dev server + bundling
Backend	Express.js	API server
Runtime	Node.js	runs the backend
Storage	a JSON file	good enough for this scope, no DB setup needed
Styling	plain CSS3	nothing fancy
Communication	HTTP/REST	frontend and backend talk over JSON
How it's structured

This isn't a SPA on purpose — the assignment specifically called for a multi-page setup, and honestly it does keep things cleanly separated: two pages, two entry points, both bookmarkable, no routing library needed.

Todo App (Multi-Page)
│
├─ Frontend
│  ├─ index.html              → main.jsx → App
│  │                              ├─ TodoForm
│  │                              ├─ TodoList
│  │                              └─ TodoItem
│  │
│  └─ todo.html?id=X          → todoDetails.jsx → TodoDetailsApp
│                                 ├─ reads ?id from the URL
│                                 ├─ fetches that one todo
│                                 └─ shows its details
│
├─ Backend (server.js)
│  ├─ GET    /api/todos
│  ├─ GET    /api/todos/:id
│  ├─ POST   /api/todos
│  ├─ PUT    /api/todos/:id
│  └─ DELETE /api/todos/:id
│  (CORS + JSON body parsing middleware)
│
└─ Data
   └─ backend/data/todos.json
Folder layout
todo-app/
├── frontend/
│   ├── index.html              # todo list entry point
│   ├── todo.html                # todo details entry point
│   ├── package.json
│   ├── vite.config.js
│   └── src/
│       ├── main.jsx             # loads on index.html
│       ├── todoDetails.jsx      # loads on todo.html
│       ├── styles.css
│       └── components/
│           ├── TodoForm.jsx
│           ├── TodoList.jsx
│           └── TodoItem.jsx
│
├── backend/
│   ├── server.js
│   ├── package.json
│   └── data/
│       └── todos.json
│
├── README.md
├── API.md
├── FEATURES.md
└── .gitignore
Before you start

You'll need:

Node.js v16+ (get it here)
npm (comes bundled with Node)
Git
Any modern browser

Quick check:

bash
node --version
npm --version
git --version
Setup
bash
git clone https://github.com/yourusername/todo-app.git
cd todo-app

cd backend
npm install

cd ../frontend
npm install
Running it

You need two terminals open — one for the backend, one for the frontend.

Terminal 1 — backend:

bash
cd backend
npm start

It'll say something like:

✅ Backend server running at http://localhost:3001
📁 Data stored in: /path/to/backend/data/todos.json

Runs on port 3001.

Terminal 2 — frontend:

bash
cd frontend
npm run dev
VITE v5.4.21  ready in 1014 ms
➜  Local:   http://localhost:5173/

Runs on port 5173.

Then just open http://localhost:5173 in your browser and you should see the todo list with whatever's in todos.json.

How the two sides talk to each other

React (running in the browser on 5173) hits the Express API (on 3001) over plain fetch/HTTP, and Express reads and writes todos.json on disk.

Browser (React, :5173)
      │  fetch() → JSON over HTTP
      ▼
Express server (:3001) — /api/todos routes, CORS enabled
      │  fs read/write
      ▼
todos.json

Example — adding a todo:

javascript
// frontend
async function handleAddTodo(title) {
  const response = await fetch('http://localhost:3001/api/todos', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title })
  });

  const newTodo = await response.json();
  setTodos([...todos, newTodo]);
}

Backend gets the POST, validates the title, reads the JSON file, adds the new todo with a fresh ID, writes the file back, and responds with the new todo:

json
{
  "id": 4,
  "title": "Learn React",
  "completed": false,
  "createdAt": "2026-08-31T14:30:00.000Z"
}

React then just appends it to state and re-renders.

The details page

The details page pulls the todo ID from a query param:

http://localhost:5173/todo.html?id=2

What happens when you land there:

You click "View" on a todo → window.location.href = /todo.html?id=${id}
Browser navigates to todo.html?id=2
That page loads todoDetails.jsx, which mounts TodoDetailsApp
The component grabs the id: new URL(window.location.href).searchParams.get('id')
It checks the id is valid before doing anything (no id, NaN, or <= 0 → error shown)
Fetches /api/todos/2
Renders the ID, title, status, created date/time, and a back button

Error cases it handles:

Situation	Result
No id in the URL	"No todo ID provided"
Non-numeric id (?id=abc)	"Invalid ID must be a number"
ID that doesn't exist (?id=999)	"Todo with ID 999 not found"
Backend not reachable	"Failed to load todo"
API

Base URL: http://localhost:3001/api

GET /todos

Returns everything.

bash
curl http://localhost:3001/api/todos
json
[
  { "id": 1, "title": "Learn React", "completed": false, "createdAt": "2026-08-31T10:00:00.000Z" },
  { "id": 2, "title": "Build Todo App", "completed": true, "createdAt": "2026-08-31T10:15:00.000Z" }
]
GET /todos/:id
bash
curl http://localhost:3001/api/todos/2

200 → the todo object. 404 → { "error": "Todo with ID 2 not found" }

POST /todos
bash
curl -X POST http://localhost:3001/api/todos \
  -H "Content-Type: application/json" \
  -d '{"title": "Learn MongoDB"}'

201 → the created todo (with auto-generated id and createdAt). 400 if title is missing/empty: { "error": "Todo title is required and must be a non-empty string" }

PUT /todos/:id

Update title and/or completion status — send whichever fields you want to change.

bash
curl -X PUT http://localhost:3001/api/todos/2 \
  -H "Content-Type: application/json" \
  -d '{"title": "Master Todo App"}'
bash
curl -X PUT http://localhost:3001/api/todos/2 \
  -H "Content-Type: application/json" \
  -d '{"completed": false}'
DELETE /todos/:id
bash
curl -X DELETE http://localhost:3001/api/todos/2

Returns a confirmation message plus the deleted todo.

Status codes
Code	Meaning
200	Success (GET/PUT/DELETE)
201	Created (POST)
400	Bad input / failed validation
404	Todo doesn't exist
500	Something broke server-side
Error handling

Frontend wraps fetch calls in try/catch and surfaces backend errors to the UI:

javascript
try {
  const response = await fetch(`/api/todos/${id}`);
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error);
  }
  setTodo(await response.json());
} catch (err) {
  setError(err.message);
}

Messages users actually see: things like "Failed to load todos, make sure the backend is running on port 3001", "Todo title cannot be empty", or "Todo with ID 2 not found — it may have been deleted."

Backend validates before doing anything:

javascript
if (!todo.title || todo.title.trim() === '') {
  return res.status(400).json({ error: 'Title required' });
}

const todo = todos.find(t => t.id === id);
if (!todo) {
  return res.status(404).json({ error: 'Todo not found' });
}

There's also basic loading/pending state — "Loading your todos...", the add button says "Adding..." while a request is in flight, delete asks for confirmation first, and success messages auto-dismiss after a few seconds.

Example walkthrough
bash
# 1. create
curl -X POST http://localhost:3001/api/todos \
  -H "Content-Type: application/json" \
  -d '{"title": "Buy Groceries"}'
# → { "id": 7, "title": "Buy Groceries", "completed": false, "createdAt": "..." }

# 2. view it in the browser
# http://localhost:5173/todo.html?id=7

# 3. mark it done
curl -X PUT http://localhost:3001/api/todos/7 \
  -H "Content-Type: application/json" \
  -d '{"completed": true}'
Tests

There are 13 integration tests covering the basics — fetching, creating, updating, deleting, persistence across restarts, invalid/missing ID handling, and validation errors. Right now they're meant to be run manually with curl or Postman rather than through a test runner.

Troubleshooting

Backend won't start / port in use

bash
netstat -ano | grep 3001
taskkill /PID <PID> /F     # Windows

Or just change the port in server.js.

Frontend says "Failed to load todos" — usually just means the backend isn't running. Start it and sanity-check with curl http://localhost:3001/api/todos.

Weird errors from todos.json — probably malformed JSON (trailing comma is the usual culprit). Worst case, delete the file and restart the backend to get a fresh one.

CORS errors — means the frontend can't reach the backend. Check the backend's actually running, on port 3001, and that CORS middleware is still enabled in server.js.

Ideas for later

Nothing here is done, just stuff I'd add if I kept going:

Sorting/filtering, tags/categories, due dates, search
Better mobile polish
Auth + real user accounts
Sharing todos between users, recurring todos, reminders
Swap the JSON file for an actual database (MongoDB probably)
Deploy it somewhere (Vercel/Heroku/AWS)
Real-time sync, offline support, maybe a mobile app eventually
Contributing

Fork it, branch off (git checkout -b feature/thing), commit, push, open a PR. Nothing formal here.

License

MIT.

Built as a technical assignment to practice full-stack development with React, Express, and Node — happy to walk through any part of it if you're curious how something works.