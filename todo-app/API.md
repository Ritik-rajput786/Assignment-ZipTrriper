# Todo App - API Documentation

Complete reference for all REST API endpoints and their usage.

---

## Base URL

```
http://localhost:3001/api
```

All endpoints are prefixed with this URL.

---

## Authentication

**No authentication required** - This is an open API for learning purposes.

---

## Content Type

All requests and responses use:
```
Content-Type: application/json
```

---

## Response Format

### Success Response
```json
{
  "id": 1,
  "title": "Learn React",
  "completed": false,
  "createdAt": "2026-08-31T10:00:00.000Z"
}
```

### Error Response
```json
{
  "error": "Descriptive error message explaining what went wrong"
}
```

---

## HTTP Status Codes

| Code | Status | Meaning | When Used |
|------|--------|---------|-----------|
| 200 | OK | Request successful, data returned | GET, PUT, DELETE |
| 201 | Created | New resource created successfully | POST |
| 400 | Bad Request | Invalid input, validation failed | Invalid data |
| 404 | Not Found | Resource doesn't exist | Wrong ID |
| 500 | Server Error | Server encountered an error | Rare |

---

## Endpoint 1: Get All Todos

### Overview
Retrieve a list of all todos stored in the system.

### Request

**Method:** GET  
**Endpoint:** `/todos`  
**Full URL:** `http://localhost:3001/api/todos`  
**Authentication:** Not required  
**Body:** None  

### Example Request

**Using curl:**
```bash
curl http://localhost:3001/api/todos
```

**Using JavaScript:**
```javascript
const response = await fetch('http://localhost:3001/api/todos');
const todos = await response.json();
```

**Using Postman:**
- Method: GET
- URL: http://localhost:3001/api/todos
- Click: Send

### Response

**Status Code:** 200 OK

**Body:** Array of todo objects
```json
[
  {
    "id": 1,
    "title": "Learn React",
    "completed": false,
    "createdAt": "2026-08-31T10:00:00.000Z"
  },
  {
    "id": 2,
    "title": "Build Todo App",
    "completed": true,
    "createdAt": "2026-08-31T10:15:00.000Z"
  },
  {
    "id": 4,
    "title": "Master JavaScript",
    "completed": false,
    "createdAt": "2026-08-31T11:30:45.123Z"
  }
]
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| id | number | Unique identifier (auto-generated) |
| title | string | Todo task description |
| completed | boolean | true = done, false = not done |
| createdAt | string | ISO 8601 timestamp when created |

### Empty Response

If no todos exist:
```json
[]
```

### Use Cases

- ✅ Display all todos on dashboard
- ✅ Check how many todos exist
- ✅ Load initial data when page loads
- ✅ Refresh list to see updates

### Example Flow

```javascript
// React component
useEffect(() => {
  fetch('http://localhost:3001/api/todos')
    .then(res => res.json())
    .then(data => setTodos(data))
    .catch(err => setError(err.message));
}, []);
```

---

## Endpoint 2: Get Single Todo

### Overview
Retrieve details for one specific todo by its ID.

### Request

**Method:** GET  
**Endpoint:** `/todos/:id`  
**Full URL:** `http://localhost:3001/api/todos/2`  
**Authentication:** Not required  
**Body:** None  
**Parameters:** 
- `id` (required) - Todo ID as a positive number (path parameter)

### Example Requests

**Using curl:**
```bash
curl http://localhost:3001/api/todos/2
curl http://localhost:3001/api/todos/5
```

**Using JavaScript:**
```javascript
const todoId = 2;
const response = await fetch(`http://localhost:3001/api/todos/${todoId}`);
const todo = await response.json();
```

**Using Postman:**
- Method: GET
- URL: http://localhost:3001/api/todos/2
- Click: Send

### Response

**Status Code (Success):** 200 OK

**Body:**
```json
{
  "id": 2,
  "title": "Build Todo App",
  "completed": true,
  "createdAt": "2026-08-31T10:15:00.000Z"
}
```

### Error Responses

**Status Code (Not Found):** 404 Not Found
```json
{
  "error": "Todo with ID 999 not found"
}
```

**Status Code (Invalid ID):** 400 Bad Request
```json
{
  "error": "Invalid ID. ID must be a number"
}
```

**Invalid ID Examples:**
- `/api/todos/abc` → Error (not a number)
- `/api/todos/-5` → Error (negative)
- `/api/todos/0` → Error (zero)
- `/api/todos/2` → Success ✅

### Use Cases

- ✅ Display full details of one todo
- ✅ Fetch data for details page
- ✅ Check if todo exists before updating
- ✅ Verify todo status before deletion

### Example Flow

```javascript
// Details page - todoDetails.jsx
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

## Endpoint 3: Create New Todo

### Overview
Create a new todo and add it to the system.

### Request

**Method:** POST  
**Endpoint:** `/todos`  
**Full URL:** `http://localhost:3001/api/todos`  
**Authentication:** Not required  
**Headers:** `Content-Type: application/json`  
**Body:** JSON object with todo data  

### Request Body

```json
{
  "title": "Learn MongoDB"
}
```

**Required Fields:**
- `title` (string, non-empty)

**Optional Fields:** None

### Request Validation

**Valid Request:**
```json
{
  "title": "Buy Groceries"
}
```

**Invalid Requests:**
```json
{
  "title": ""            ❌ Empty string
}

{
  "title": "   "         ❌ Only whitespace
}

{
  "title": null          ❌ Null value
}

{
  "completed": true      ❌ Missing title
}
```

### Example Requests

**Using curl:**
```bash
curl -X POST http://localhost:3001/api/todos \
  -H "Content-Type: application/json" \
  -d '{"title": "Learn MongoDB"}'
```

**Using JavaScript:**
```javascript
const response = await fetch('http://localhost:3001/api/todos', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ title: 'Learn MongoDB' })
});
const newTodo = await response.json();
```

**Using Postman:**
- Method: POST
- URL: http://localhost:3001/api/todos
- Headers: Content-Type: application/json
- Body (raw JSON):
  ```json
  {
    "title": "Learn MongoDB"
  }
  ```
- Click: Send

### Response

**Status Code (Success):** 201 Created

**Response Body:**
```json
{
  "id": 7,
  "title": "Learn MongoDB",
  "completed": false,
  "createdAt": "2026-08-31T14:30:00.000Z"
}
```

### Response Fields

| Field | Value | Notes |
|-------|-------|-------|
| id | Auto-generated | Unique, incremented |
| title | User input | Trimmed of whitespace |
| completed | false | Always starts incomplete |
| createdAt | Current time | ISO 8601 format |

### Error Responses

**Status Code:** 400 Bad Request

**Missing Title:**
```json
{
  "error": "Todo title is required and must be a non-empty string"
}
```

**Empty Title:**
```json
{
  "error": "Todo title is required and must be a non-empty string"
}
```

### Use Cases

- ✅ Create new todo from form input
- ✅ Add task via API
- ✅ Bulk create todos from script
- ✅ Programmatically generate todos

### Example Flow

```javascript
// TodoForm.jsx - Adding a new todo
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
    setSuccessMessage('✅ Todo added successfully!');
  } catch (err) {
    setError(err.message);
  }
}
```

### Auto-Generated Values

**ID Generation:**
- Finds highest existing ID
- Adds 1
- Ensures unique IDs
- Example: If highest is 6, new todo gets ID 7

**Timestamp:**
- Always current time
- ISO 8601 format
- Example: 2026-08-31T14:30:00.000Z

---

## Endpoint 4: Update Todo

### Overview
Update an existing todo's title and/or completion status.

### Request

**Method:** PUT  
**Endpoint:** `/todos/:id`  
**Full URL:** `http://localhost:3001/api/todos/2`  
**Authentication:** Not required  
**Headers:** `Content-Type: application/json`  
**Body:** JSON object with fields to update  
**Parameters:**
- `id` (required) - Todo ID (path parameter)

### Request Body

**Update Title Only:**
```json
{
  "title": "New Todo Title"
}
```

**Update Status Only:**
```json
{
  "completed": true
}
```

**Update Both:**
```json
{
  "title": "New Title",
  "completed": false
}
```

### Request Validation

**Valid Requests:**
```json
{ "title": "New Title" }           ✅ Update title
{ "completed": true }              ✅ Update status
{ "title": "X", "completed": true} ✅ Update both
```

**Invalid Requests:**
```json
{}                                 ❌ No fields to update
{ "title": "" }                    ❌ Empty title
{ "title": "  " }                  ❌ Only whitespace
{ "completed": "yes" }             ❌ Not a boolean
{ "id": 5 }                        ❌ Cannot update ID
{ "createdAt": "2026-01-01" }     ❌ Cannot update timestamp
```

### Example Requests

**Using curl - Update Title:**
```bash
curl -X PUT http://localhost:3001/api/todos/2 \
  -H "Content-Type: application/json" \
  -d '{"title": "Master Todo App"}'
```

**Using curl - Update Status:**
```bash
curl -X PUT http://localhost:3001/api/todos/2 \
  -H "Content-Type: application/json" \
  -d '{"completed": true}'
```

**Using JavaScript - Toggle Completion:**
```javascript
const todoId = 2;
const response = await fetch(`http://localhost:3001/api/todos/${todoId}`, {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ completed: true })
});
const updatedTodo = await response.json();
```

**Using Postman:**
- Method: PUT
- URL: http://localhost:3001/api/todos/2
- Headers: Content-Type: application/json
- Body (raw JSON):
  ```json
  {
    "title": "Updated Title",
    "completed": true
  }
  ```
- Click: Send

### Response

**Status Code (Success):** 200 OK

**Response Body:**
```json
{
  "id": 2,
  "title": "Master Todo App",
  "completed": true,
  "createdAt": "2026-08-31T10:15:00.000Z"
}
```

### Response Notes

- Returns the **updated todo** with all fields
- `createdAt` does **not** change
- `id` does **not** change
- Shows current state after update

### Error Responses

**Status Code:** 404 Not Found
```json
{
  "error": "Todo with ID 999 not found"
}
```

**Status Code:** 400 Bad Request - No Fields
```json
{
  "error": "At least one field (title or completed) must be provided"
}
```

**Status Code:** 400 Bad Request - Empty Title
```json
{
  "error": "Title cannot be empty"
}
```

**Status Code:** 400 Bad Request - Invalid Completed
```json
{
  "error": "Completed must be a boolean (true or false)"
}
```

### Use Cases

- ✅ Mark todo as complete/incomplete
- ✅ Edit todo title
- ✅ Update both title and status
- ✅ Change task description
- ✅ Reopen completed tasks

### Example Flows

**Toggle Completion:**
```javascript
// TodoItem.jsx - Checkbox clicked
async function handleToggleTodo(id, currentStatus) {
  const newStatus = !currentStatus;
  
  const response = await fetch(`http://localhost:3001/api/todos/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ completed: newStatus })
  });
  
  const updated = await response.json();
  // Update React state
}
```

**Edit Title:**
```javascript
// Save after editing title
async function handleSaveEdit(id, newTitle) {
  const response = await fetch(`http://localhost:3001/api/todos/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: newTitle })
  });
  
  const updated = await response.json();
  // Update React state
}
```

---

## Endpoint 5: Delete Todo

### Overview
Permanently remove a todo from the system.

### Request

**Method:** DELETE  
**Endpoint:** `/todos/:id`  
**Full URL:** `http://localhost:3001/api/todos/2`  
**Authentication:** Not required  
**Body:** None (optional, usually empty)  
**Parameters:**
- `id` (required) - Todo ID (path parameter)

### Example Requests

**Using curl:**
```bash
curl -X DELETE http://localhost:3001/api/todos/2
```

**Using JavaScript:**
```javascript
const todoId = 2;
const response = await fetch(`http://localhost:3001/api/todos/${todoId}`, {
  method: 'DELETE'
});
const result = await response.json();
```

**Using Postman:**
- Method: DELETE
- URL: http://localhost:3001/api/todos/2
- Click: Send

### Response

**Status Code (Success):** 200 OK

**Response Body:**
```json
{
  "message": "Todo deleted successfully",
  "todo": {
    "id": 2,
    "title": "Build Todo App",
    "completed": true,
    "createdAt": "2026-08-31T10:15:00.000Z"
  }
}
```

### Response Fields

| Field | Description |
|-------|-------------|
| message | Confirmation message |
| todo | The deleted todo object (for reference) |

### Error Responses

**Status Code:** 404 Not Found
```json
{
  "error": "Todo with ID 999 not found"
}
```

**Status Code:** 400 Bad Request
```json
{
  "error": "Invalid ID. ID must be a number"
}
```

### Important Notes

- ✅ **Permanent** - Deleted todos cannot be recovered
- ✅ **Confirmed** - Response includes the deleted todo
- ✅ **Atomic** - Entire operation succeeds or fails together
- ❌ **No Undo** - No delete reversal/undo functionality
- ❌ **No Trash** - Deleted items go directly to permanent removal

### Use Cases

- ✅ Remove completed tasks
- ✅ Delete unwanted todos
- ✅ Clean up stale tasks
- ✅ Bulk deletion via script

### Example Flow

```javascript
// TodoItem.jsx - Delete button clicked
async function handleDeleteTodo(id) {
  const confirmed = confirm('Are you sure you want to delete this todo?');
  
  if (!confirmed) return;
  
  try {
    const response = await fetch(`http://localhost:3001/api/todos/${id}`, {
      method: 'DELETE'
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error);
    }
    
    const result = await response.json();
    console.log('Deleted:', result.todo);
    
    // Remove from React state
    setTodos(todos.filter(t => t.id !== id));
    setSuccess('✅ Todo deleted successfully!');
  } catch (err) {
    setError(err.message);
  }
}
```

---

## Complete API Summary Table

| Method | Endpoint | Purpose | Status | Response |
|--------|----------|---------|--------|----------|
| GET | /todos | Get all | 200 | Array of todos |
| GET | /todos/:id | Get one | 200 | Single todo or 404 |
| POST | /todos | Create | 201 | New todo |
| PUT | /todos/:id | Update | 200 | Updated todo or 404/400 |
| DELETE | /todos/:id | Delete | 200 | Deleted todo or 404/400 |

---

## Error Handling Guide

### Common Error Scenarios

**Scenario 1: Empty Title**
```
Request: POST /api/todos { "title": "" }
Response: 400 Bad Request
Body: { "error": "Todo title is required..." }
Frontend: Show alert to user
```

**Scenario 2: Todo Not Found**
```
Request: GET /api/todos/999
Response: 404 Not Found
Body: { "error": "Todo with ID 999 not found" }
Frontend: Redirect to list or show error page
```

**Scenario 3: Invalid ID Format**
```
Request: GET /api/todos/abc
Response: 400 Bad Request
Body: { "error": "Invalid ID. ID must be a number" }
Frontend: Show error message to user
```

**Scenario 4: No Update Fields**
```
Request: PUT /api/todos/2 {}
Response: 400 Bad Request
Body: { "error": "At least one field (title or completed) must be provided" }
Frontend: Prevent empty updates in form
```

**Scenario 5: Backend Offline**
```
Request: Any endpoint
Response: Network error (cannot connect)
Frontend: Show "Failed to load... Make sure backend is running"
```

### Error Response Pattern

All errors follow this pattern:
```json
{
  "error": "Human-readable error message"
}
```

### Handling in Frontend

```javascript
async function makeApiCall() {
  try {
    const response = await fetch(url, options);
    
    // Check if status is not 2xx
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error);
    }
    
    const data = await response.json();
    return data;
  } catch (err) {
    // Network error or error from response
    console.error('API Error:', err.message);
    // Show user-friendly message
    setError(err.message);
  }
}
```

---

## Rate Limiting

**Not Implemented** - No rate limits on API calls. For production, implement rate limiting.

---

## CORS

**Enabled** - Frontend (port 5173) can access backend (port 3001) due to CORS configuration.

**CORS Header:**
```
Access-Control-Allow-Origin: *
```

---

## Data Persistence

All data changes are immediately saved to:
```
backend/data/todos.json
```

## Testing the API

### Manual Testing with curl

```bash
# Get all todos
curl http://localhost:3001/api/todos

# Get one todo
curl http://localhost:3001/api/todos/1

# Create new todo
curl -X POST http://localhost:3001/api/todos \
  -H "Content-Type: application/json" \
  -d '{"title": "Test Todo"}'

# Update todo
curl -X PUT http://localhost:3001/api/todos/1 \
  -H "Content-Type: application/json" \
  -d '{"completed": true}'

# Delete todo
curl -X DELETE http://localhost:3001/api/todos/1
```

### Testing with Postman

1. Create new Postman Collection
2. Add requests for each endpoint
3. Test with different parameters
4. Verify responses
5. Save test cases

### Automated Testing

```bash
# Example: Test all endpoints
npm test

# Example: Test specific endpoint
npm test -- tests/api.test.js
```

---

## Performance Notes

- **Response Time**: < 100ms typically (file-based storage)
- **Concurrency**: Limited (JSON file has no locking)
- **Scalability**: File storage not suitable for large datasets
- **Best For**: Small projects, learning, prototyping

---

## API Versioning

Current API Version: **1.0**

Future versions may include `/api/v2/todos`

---

## Related Documentation

- [README.md](README.md) - Project overview
- [FEATURES.md](FEATURES.md) - Feature documentation
- [server.js](backend/server.js) - Backend source code
- [main.jsx](frontend/src/main.jsx) - Frontend implementation

---

## Quick Reference

### All Request Examples in One Place

```javascript
// 1. Get all todos
fetch('http://localhost:3001/api/todos')

// 2. Get one todo
fetch('http://localhost:3001/api/todos/2')

// 3. Create todo
fetch('http://localhost:3001/api/todos', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ title: 'Learn React' })
})

// 4. Update todo
fetch('http://localhost:3001/api/todos/2', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ completed: true })
})

// 5. Delete todo
fetch('http://localhost:3001/api/todos/2', {
  method: 'DELETE'
})
```

---

## Frequently Asked Questions

**Q: Can I use the API without running the frontend?**  
A: Yes! The API is independent. Use curl, Postman, or any HTTP client.

**Q: What happens if two users access the API simultaneously?**  
A: The last write wins (no locking). Not suitable for production multi-user scenarios.

**Q: Can I run the API on a different port?**  
A: Yes! Edit `backend/server.js` and change the port number.

**Q: Is the data encrypted?**  
A: No. todos.json is plain text. For production, use databases with encryption.

**Q: How do I backup my todos?**  
A: Copy the `backend/data/todos.json` file to another location.

---

## Support

For API issues:
1. Check if backend is running on port 3001
2. Verify request format matches examples
3. Check response status codes
4. Review error messages in response body
5. Check backend logs in terminal

---

**Last Updated:** August 2026  
**API Status:** ✅ Fully Functional  
**Version:** 1.0
