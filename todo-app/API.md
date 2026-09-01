# API Reference

Everything  need to hit the Todo API directly — endpoints, request/response shapes, and examples in curl, JS, and Postman.

## Base URL

```
http://localhost:3001/api
```

Every endpoint below is relative to this.

## Auth & content type

No auth — it's an open API, this was built for learning, not production. All requests/responses are `application/json`.

## Response shapes

A todo looks like this:
```json
{
  "id": 1,
  "title": "Learn React",
  "completed": false,
  "createdAt": "2026-08-31T10:00:00.000Z"
}
```

Errors always come back the same shape:
```json
{ "error": "Human-readable message explaining what went wrong" }
```

## Status codes

| Code | Meaning | Shows up on |
|---|---|---|
| 200 | success | GET, PUT, DELETE |
| 201 | resource created | POST |
| 400 | bad input | failed validation |
| 404 | not found | wrong/missing ID |
| 500 | server error | rare, but possible |

---

## GET /todos

Gets everything.

```bash
curl http://localhost:3001/api/todos
```
```javascript
const res = await fetch('http://localhost:3001/api/todos');
const todos = await res.json();
```
Postman: GET → `http://localhost:3001/api/todos` → Send.

**200 OK:**
```json
[
  { "id": 1, "title": "Learn React", "completed": false, "createdAt": "2026-08-31T10:00:00.000Z" },
  { "id": 2, "title": "Build Todo App", "completed": true, "createdAt": "2026-08-31T10:15:00.000Z" },
  { "id": 4, "title": "Master JavaScript", "completed": false, "createdAt": "2026-08-31T11:30:45.123Z" }
]
```

| Field | Type | Notes |
|---|---|---|
| id | number | auto-generated, unique |
| title | string | the task itself |
| completed | boolean | done or not |
| createdAt | string | ISO 8601 timestamp |

If there's nothing yet, you just get `[]`.

This is basically what powers the list page — fetched once on load, e.g.:
```javascript
useEffect(() => {
  fetch('http://localhost:3001/api/todos')
    .then(res => res.json())
    .then(data => setTodos(data))
    .catch(err => setError(err.message));
}, []);
```

---

## GET /todos/:id

Gets one specific todo.

```bash
curl http://localhost:3001/api/todos/2
```
```javascript
const res = await fetch(`http://localhost:3001/api/todos/${todoId}`);
const todo = await res.json();
```

**200 OK:**
```json
{ "id": 2, "title": "Build Todo App", "completed": true, "createdAt": "2026-08-31T10:15:00.000Z" }
```

**Errors:**
- Doesn't exist → `404`, `{ "error": "Todo with ID 999 not found" }`
- Bad ID → `400`, `{ "error": "Invalid ID. ID must be a number" }`

The ID has to be a positive number — `/todos/abc`, `/todos/-5`, and `/todos/0` all fail; `/todos/2` works.

This is what the details page uses:
```javascript
const id = new URL(window.location.href).searchParams.get('id');

fetch(`http://localhost:3001/api/todos/${id}`)
  .then(res => {
    if (!res.ok) throw new Error('Todo not found');
    return res.json();
  })
  .then(todo => setTodo(todo))
  .catch(err => setError(err.message));
```

---

## POST /todos

Creates a new todo.

**Body:** just needs a `title`, non-empty.
```json
{ "title": "Learn MongoDB" }
```

Things that'll get rejected: empty string, whitespace-only, `null`, or leaving `title` out entirely.

```bash
curl -X POST http://localhost:3001/api/todos \
  -H "Content-Type: application/json" \
  -d '{"title": "Learn MongoDB"}'
```
```javascript
const res = await fetch('http://localhost:3001/api/todos', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ title: 'Learn MongoDB' })
});
const newTodo = await res.json();
```
Postman: POST, `Content-Type: application/json` header, raw JSON body `{ "title": "Learn MongoDB" }`.

**201 Created:**
```json
{ "id": 7, "title": "Learn MongoDB", "completed": false, "createdAt": "2026-08-31T14:30:00.000Z" }
```

`id` gets auto-generated (highest existing ID + 1), `title` is trimmed of extra whitespace, `completed` always starts as `false`, and `createdAt` is set to the current time.

**400** if the title's missing or empty: `{ "error": "Todo title is required and must be a non-empty string" }`

Used like this on the form:
```javascript
async function handleAddTodo(title) {
  try {
    const response = await fetch('http://localhost:3001/api/todos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error);
    }

    const newTodo = await response.json();
    setTodos([...todos, newTodo]);
    setSuccessMessage('Todo added successfully!');
  } catch (err) {
    setError(err.message);
  }
}
```

---

## PUT /todos/:id

Updates a todo — title, completion status, or both. Send whatever fields you're changing.

```json
{ "title": "New Todo Title" }
```
```json
{ "completed": true }
```
```json
{ "title": "New Title", "completed": false }
```

**Not allowed:** an empty body (nothing to update), an empty/whitespace title, a non-boolean `completed` (like `"yes"`), or trying to change `id`/`createdAt` — those are ignored/rejected.

```bash
curl -X PUT http://localhost:3001/api/todos/2 \
  -H "Content-Type: application/json" \
  -d '{"title": "Master Todo App"}'
```
```bash
curl -X PUT http://localhost:3001/api/todos/2 \
  -H "Content-Type: application/json" \
  -d '{"completed": true}'
```
```javascript
const res = await fetch(`http://localhost:3001/api/todos/${todoId}`, {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ completed: true })
});
const updatedTodo = await res.json();
```

**200 OK** — returns the full updated todo:
```json
{ "id": 2, "title": "Master Todo App", "completed": true, "createdAt": "2026-08-31T10:15:00.000Z" }
```
`id` and `createdAt` never change, no matter what you send.

**Errors:**
- Doesn't exist → `404`, `{ "error": "Todo with ID 999 not found" }`
- Nothing to update → `400`, `{ "error": "At least one field (title or completed) must be provided" }`
- Empty title → `400`, `{ "error": "Title cannot be empty" }`
- Bad `completed` value → `400`, `{ "error": "Completed must be a boolean (true or false)" }`

Two common uses — toggling the checkbox:
```javascript
async function handleToggleTodo(id, currentStatus) {
  const newStatus = !currentStatus;

  const response = await fetch(`http://localhost:3001/api/todos/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ completed: newStatus })
  });

  const updated = await response.json();
  // update React state
}
```

And saving an edited title:
```javascript
async function handleSaveEdit(id, newTitle) {
  const response = await fetch(`http://localhost:3001/api/todos/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: newTitle })
  });

  const updated = await response.json();
  // update React state
}
```

---

## DELETE /todos/:id

Removes a todo — permanently, no undo, no trash bin.

```bash
curl -X DELETE http://localhost:3001/api/todos/2
```
```javascript
const res = await fetch(`http://localhost:3001/api/todos/${todoId}`, { method: 'DELETE' });
const result = await res.json();
```

**200 OK** — returns a confirmation plus the deleted todo, mostly so you can log/show what got removed:
```json
{
  "message": "Todo deleted successfully",
  "todo": { "id": 2, "title": "Build Todo App", "completed": true, "createdAt": "2026-08-31T10:15:00.000Z" }
}
```

**Errors:** `404` if the ID doesn't exist, `400` if the ID isn't a valid number.

```javascript
async function handleDeleteTodo(id) {
  const confirmed = confirm('Are you sure you want to delete this todo?');
  if (!confirmed) return;

  try {
    const response = await fetch(`http://localhost:3001/api/todos/${id}`, { method: 'DELETE' });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error);
    }

    const result = await response.json();
    setTodos(todos.filter(t => t.id !== id));
    setSuccess('Todo deleted successfully!');
  } catch (err) {
    setError(err.message);
  }
}
```

---

## Endpoints at a glance

| Method | Path | Does | Success | Failure |
|---|---|---|---|---|
| GET | /todos | list all | 200 | — |
| GET | /todos/:id | get one | 200 | 404 |
| POST | /todos | create | 201 | 400 |
| PUT | /todos/:id | update | 200 | 400 / 404 |
| DELETE | /todos/:id | remove | 200 | 400 / 404 |

---

## Common error scenarios

**Empty title on create**
```
POST /api/todos { "title": "" }
→ 400, "Todo title is required..."
```

**Fetching something that doesn't exist**
```
GET /api/todos/999
→ 404, "Todo with ID 999 not found"
```

**Garbage ID**
```
GET /api/todos/abc
→ 400, "Invalid ID. ID must be a number"
```

**Empty update body**
```
PUT /api/todos/2 {}
→ 400, "At least one field (title or completed) must be provided"
```

**Backend not running** — you'll just get a network error, not a proper JSON response. Handle it as "can't reach the server" on the frontend.

A pretty standard way to handle any of these client-side:
```javascript
async function makeApiCall() {
  try {
    const response = await fetch(url, options);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error);
    }

    return await response.json();
  } catch (err) {
    console.error('API Error:', err.message);
    setError(err.message);
  }
}
```

---

## A few other things worth knowing

- **No rate limiting** — fine for a learning project, wouldn't fly in production.
- **CORS is enabled** so the frontend (5173) can talk to the backend (3001) — you'll see `Access-Control-Allow-Origin: *` in responses.
- **Data lives in** `backend/data/todos.json` — every write updates the whole file, no partial writes.
- **No locking** on the file, so if two requests write at the same time, the last one wins. Not something you'd want for a real multi-user app.
- **Response times** are fast (sub-100ms typically) since it's just reading/writing a small local file — but this approach doesn't scale past small personal-project-sized data.

## Testing it yourself

**With curl:**
```bash
curl http://localhost:3001/api/todos
curl http://localhost:3001/api/todos/1

curl -X POST http://localhost:3001/api/todos \
  -H "Content-Type: application/json" \
  -d '{"title": "Test Todo"}'

curl -X PUT http://localhost:3001/api/todos/1 \
  -H "Content-Type: application/json" \
  -d '{"completed": true}'

curl -X DELETE http://localhost:3001/api/todos/1
```

**With Postman:** just make a collection with one request per endpoint above and swap IDs/bodies as needed.

---

## FAQ

**Can I use this without running the frontend?** Yeah — it's just an HTTP API, curl/Postman/any client works fine.

**What if two people hit it at once?** Last write wins, there's no locking. Not built for concurrent multi-user use.

**Can I change the port?** Sure, it's just a number in `backend/server.js`.

**Is the data encrypted?** No, `todos.json` is plain text. For anything real, you'd want a proper database with encryption.

**How do I back up my todos?** Just copy `backend/data/todos.json` somewhere safe.

---

## If something's not working

1. Make sure the backend's actually running on port 3001
2. Double check your request matches the examples above (headers, body shape)
3. Look at the response status code and error message — they're usually specific enough to tell you what's wrong
4. Check the backend's terminal output for anything unexpected

---

*Related: [README.md](README.md) for the project overview, [FEATURES.md](FEATURES.md) for a feature-by-feature breakdown.*