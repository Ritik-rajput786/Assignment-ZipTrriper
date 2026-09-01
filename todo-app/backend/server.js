import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory (needed for ES modules)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;
const TODOS_FILE = path.join(__dirname, 'data', 'todos.json');

// Middleware
app.use(cors());
app.use(express.json());

// ============================================
// HELPER FUNCTIONS
// ============================================

// Read todos from JSON file
function readTodos() {
  try {
    const data = fs.readFileSync(TODOS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading todos file:', error);
    return [];
  }
}

// Write todos to JSON file
function writeTodos(todos) {
  try {
    fs.writeFileSync(TODOS_FILE, JSON.stringify(todos, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('Error writing todos file:', error);
    return false;
  }
}

// Generate a unique ID (uses current timestamp + random number)
function generateId(todos) {
  let maxId;

if (todos.length > 0) {
  maxId = Math.max(...todos.map(t => t.id));
} else {
  maxId = 0;
}
return maxId+1;
}

// Validate todo object
function validateTodo(todo) {
  if (!todo || typeof todo !== 'object') {
    return { valid: false, error: 'Todo must be an object' };
  }
  if (!todo.title || typeof todo.title !== 'string' || todo.title.trim() === '') {
    return { valid: false, error: 'Todo title is required and must be a non-empty string' };
  }
  return { valid: true };
}

// ============================================
// API ROUTES
// ============================================

// GET /api/todos - Get all todos
app.get('/api/todos', (req, res) => {
  try {
    const todos = readTodos();
    res.json(todos);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch todos' });
  }
});

// GET /api/todos/:id - Get a single todo by ID
app.get('/api/todos/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    // Validate ID is a number
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid ID. ID must be a number' });
    }

    const todos = readTodos();
    const todo = todos.find(t => t.id === id);

    if (!todo) {
      return res.status(404).json({ error: `Todo with ID ${id} not found` });
    }

    res.json(todo);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch todo' });
  }
});

// POST /api/todos - Create a new todo
app.post('/api/todos', (req, res) => {
  try {
    const { title } = req.body;

    // Validate request body
    const validation = validateTodo({ title });
    if (!validation.valid) {
      return res.status(400).json({ error: validation.error });
    }

    const todos = readTodos();
    
    // Create new todo object
    const newTodo = {
      id: generateId(todos),
      title: title.trim(),
      completed: false,
      createdAt: new Date().toISOString()
    };

    // Add to todos array
    todos.push(newTodo);

    // Save to file
    if (!writeTodos(todos)) {
      return res.status(500).json({ error: 'Failed to save todo' });
    }

    // Return the created todo with 201 status
    res.status(201).json(newTodo);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create todo' });
  }
});

// PUT /api/todos/:id - Update a todo
app.put('/api/todos/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { title, completed } = req.body;

    // Validate ID is a number
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid ID. ID must be a number' });
    }

    // At least one field must be provided
    if (title === undefined && completed === undefined) {
      return res.status(400).json({ error: 'At least one field (title or completed) must be provided' });
    }

    // Validate title if provided
    if (title !== undefined) {
      const validation = validateTodo({ title });
      if (!validation.valid) {
        return res.status(400).json({ error: validation.error });
      }
    }

    // Validate completed is boolean if provided
    if (completed !== undefined && typeof completed !== 'boolean') {
      return res.status(400).json({ error: 'Completed must be a boolean (true or false)' });
    }

    const todos = readTodos();
    const todoIndex = todos.findIndex(t => t.id === id);

    if (todoIndex === -1) {
      return res.status(404).json({ error: `Todo with ID ${id} not found` });
    }

    // Update fields
    if (title !== undefined) {
      todos[todoIndex].title = title.trim();
    }
    if (completed !== undefined) {
      todos[todoIndex].completed = completed;
    }

    // Save to file
    if (!writeTodos(todos)) {
      return res.status(500).json({ error: 'Failed to update todo' });
    }

    res.json(todos[todoIndex]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update todo' });
  }
});

// DELETE /api/todos/:id - Delete a todo
app.delete('/api/todos/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id);

    // Validate ID is a number
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid ID. ID must be a number' });
    }

    const todos = readTodos();
    const todoIndex = todos.findIndex(t => t.id === id);

    if (todoIndex === -1) {
      return res.status(404).json({ error: `Todo with ID ${id} not found` });
    }

    // Remove todo from array
    const deletedTodo = todos.splice(todoIndex, 1)[0];

    // Save to file
    if (!writeTodos(todos)) {
      return res.status(500).json({ error: 'Failed to delete todo' });
    }

    res.json({ message: 'Todo deleted successfully', todo: deletedTodo });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete todo' });
  }
});

// ============================================
// ERROR HANDLING & SERVER START
// ============================================

// 404 handler for undefined routes
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Backend server running at http://localhost:${PORT}`);
  console.log(`📁 Data stored in: ${TODOS_FILE}`);
});
