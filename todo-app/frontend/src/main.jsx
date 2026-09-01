import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { TodoForm } from './components/TodoForm';
import { TodoList } from './components/TodoList';
import './styles.css';

// ============================================================
// This is the address of our backend server.
// All our todo data lives there - we just ask it for info
// or tell it to change something.
// ============================================================
const API_URL = 'http://localhost:3001/api/todos';

function App() {
  // ------------------------------------------------------------
  // STATE: these are all the pieces of data that can change
  // while the app is running. Whenever one of these changes,
  // React automatically redraws the screen for us.
  // ------------------------------------------------------------

  // the list of all todos we got from the server
  const [todos, setTodos] = useState([]);

  // true while we're still waiting for the todos to load
  const [loading, setLoading] = useState(true);

  // if something goes wrong, we put a message here
  const [errorMessage, setErrorMessage] = useState('');

  // if something goes right, we put a message here
  const [successMessage, setSuccessMessage] = useState('');

  // if we are editing a todo, this stores its id (otherwise null)
  const [editingTodoId, setEditingTodoId] = useState(null);

  // this stores the text currently typed in the edit box
  const [editingTodoTitle, setEditingTodoTitle] = useState('');

  // true while we're waiting on an add/edit/delete request
  const [isSaving, setIsSaving] = useState(false);

  // ------------------------------------------------------------
  // LOAD TODOS WHEN THE APP FIRST OPENS
  //
  // useEffect with an empty array [] means:
  // "run this code one time, right when the app starts"
  // ------------------------------------------------------------
  useEffect(() => {
    loadTodos();
  }, []);

  // ------------------------------------------------------------
  // AUTO-HIDE THE SUCCESS MESSAGE
  //
  // Every time successMessage changes, this checks if there IS
  // a message. If there is, it waits 3 seconds and then clears it.
  // ------------------------------------------------------------
  useEffect(() => {
    if (successMessage === '') {
      return; // nothing to hide, so do nothing
    }

    const timer = setTimeout(() => {
      setSuccessMessage('');
    }, 3000); // 3000ms = 3 seconds

    // cleanup: if the message changes again before 3 seconds,
    // cancel the old timer so we don't hide things too early
    return () => clearTimeout(timer);
  }, [successMessage]);

  // ==============================================================
  // FUNCTIONS THAT TALK TO THE BACKEND
  // Each one below sends a request to the server and then
  // updates our state based on what comes back.
  // ==============================================================

  // GET request: ask the server for every todo we have
  async function loadTodos() {
    setLoading(true);
    setErrorMessage('');

    try {
      const response = await fetch(API_URL);

      if (!response.ok) {
        throw new Error('Failed to fetch todos');
      }

      const todosFromServer = await response.json();
      setTodos(todosFromServer);
    } catch (err) {
      console.log('Error fetching todos:', err);
      setErrorMessage('Failed to load todos. Make sure the backend is running on port 3001.');
    }

    setLoading(false);
  }

  // POST request: send a brand new todo to the server
  async function handleAddTodo(title) {
    setIsSaving(true);
    setErrorMessage('');

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: title }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error);
      }

      const newTodo = await response.json();

      // add the new todo onto the end of our existing list
      setTodos([...todos, newTodo]);
      setSuccessMessage('Todo added successfully!');
    } catch (err) {
      console.log('Error adding todo:', err);
      setErrorMessage(err.message || 'Failed to add todo');
    }

    setIsSaving(false);
  }

  // PUT request: flip a todo between "done" and "not done"
  async function handleToggleTodo(id) {
    setErrorMessage('');

    // first, find the todo we clicked on in our current list
    const todoToToggle = todos.find((todo) => todo.id === id);

    // if we somehow can't find it, just stop here
    if (!todoToToggle) {
      return;
    }

    try {
      const response = await fetch(API_URL + '/' + id, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        // send the OPPOSITE of whatever "completed" currently is
        body: JSON.stringify({ completed: !todoToToggle.completed }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error);
      }

      const updatedTodo = await response.json();

      // build a new list where only the matching todo is replaced
      const updatedTodos = todos.map((todo) =>
        todo.id === id ? updatedTodo : todo
      );
      setTodos(updatedTodos);

      setSuccessMessage(
        updatedTodo.completed
          ? 'Todo marked as completed!'
          : 'Todo marked as incomplete!'
      );
    } catch (err) {
      console.log('Error toggling todo:', err);
      setErrorMessage('Failed to toggle todo');
    }
  }

  // opens the little edit box for one specific todo
  function handleStartEdit(id) {
    const todo = todos.find((t) => t.id === id);
    if (!todo) {
      return;
    }
    setEditingTodoId(id);
    setEditingTodoTitle(todo.title);
  }

  // closes the edit box without saving any changes
  function handleCancelEdit() {
    setEditingTodoId(null);
    setEditingTodoTitle('');
  }

  // PUT request: save the new title for the todo being edited
  async function handleSaveEdit() {
    // don't allow saving an empty title
    if (editingTodoTitle.trim() === '') {
      setErrorMessage('Todo title cannot be empty');
      return;
    }

    setErrorMessage('');

    try {
      const response = await fetch(API_URL + '/' + editingTodoId, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: editingTodoTitle }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error);
      }

      const updatedTodo = await response.json();

      const updatedTodos = todos.map((todo) =>
        todo.id === editingTodoId ? updatedTodo : todo
      );
      setTodos(updatedTodos);

      // close the edit box now that we're done
      setEditingTodoId(null);
      setEditingTodoTitle('');
      setSuccessMessage('Todo updated successfully!');
    } catch (err) {
      console.log('Error editing todo:', err);
      setErrorMessage('Failed to edit todo');
    }
  }

  // DELETE request: remove a todo completely
  async function handleDeleteTodo(id) {
    // ask the user to confirm before deleting anything
    const userConfirmed = confirm('Are you sure you want to delete this todo?');
    if (!userConfirmed) {
      return;
    }

    setErrorMessage('');

    try {
      const response = await fetch(API_URL + '/' + id, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error);
      }

      // keep every todo EXCEPT the one we just deleted
      const remainingTodos = todos.filter((todo) => todo.id !== id);
      setTodos(remainingTodos);
      setSuccessMessage('Todo deleted successfully!');
    } catch (err) {
      console.log('Error deleting todo:', err);
      setErrorMessage('Failed to delete todo');
    }
  }

  // sends the user to a separate page showing one todo's details
  function handleViewDetails(id) {
    window.location.href = '/todo.html?id=' + id;
  }

  // ------------------------------------------------------------
  // Small piece of text shown at the top, like "3 total todos"
  // ------------------------------------------------------------
  const todoCountText =
    todos.length === 1
      ? '1 total todo'
      : todos.length + ' total todos';

  // ------------------------------------------------------------
  // WHAT GETS DRAWN ON SCREEN
  // ------------------------------------------------------------
  return (
    <div className="container">
      <header>
        <h1>📋 My Todo List</h1>
        <p>{todoCountText}</p>
      </header>

      {/* only show these messages if they actually have text in them */}
      {errorMessage && <div className="error">❌ {errorMessage}</div>}
      {successMessage && <div className="success">✅ {successMessage}</div>}

      <TodoForm onSubmit={handleAddTodo} isLoading={isSaving} />

      {loading ? (
        <div className="loading">Loading your todos...</div>
      ) : (
        <TodoList
          todos={todos}
          editingId={editingTodoId}
          editingTitle={editingTodoTitle}
          onToggle={handleToggleTodo}
          onEdit={handleStartEdit}
          onDelete={handleDeleteTodo}
          onViewDetails={handleViewDetails}
          onSaveEdit={handleSaveEdit}
          onCancelEdit={handleCancelEdit}
          onEditingTitleChange={setEditingTodoTitle}
        />
      )}
    </div>
  );
}

// this finds the <div id="root"></div> in our HTML file
// and tells React "draw our whole app inside this spot"
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);