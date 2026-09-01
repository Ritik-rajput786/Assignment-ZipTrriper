import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import './styles.css';

const API_URL = 'http://localhost:3001/api/todos';

function TodoDetailsApp() {
  const [todo, setTodo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Extract todo ID from URL query parameter
  useEffect(() => {
    const url = new URL(window.location.href);
    const id = url.searchParams.get('id');

    // Validate that ID exists
    if (!id) {
      setError('No todo ID provided. Please go back to the list and select a todo.');
      setLoading(false);
      return;
    }

    // Validate that ID is a number
    if (isNaN(id) || id <= 0) {
      setError('Invalid todo ID. ID must be a positive number.');
      setLoading(false);
      return;
    }

    // Fetch the specific todo
    fetchTodo(id);
  }, []);

  // Fetch single todo from backend
  async function fetchTodo(id) {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_URL}/${id}`);

      if (!response.ok) {
        if (response.status === 404) {
          setError(`Todo with ID ${id} not found. It may have been deleted.`);
        } else {
          setError('Failed to load todo. Please try again.');
        }
        setLoading(false);
        return;
      }

      const data = await response.json();
      setTodo(data);
    } catch (err) {
      setError('Failed to load todo. Make sure the backend is running on port 3001.');
      console.error('Error fetching todo:', err);
    } finally {
      setLoading(false);
    }
  }

  // Go back to todo list
  function handleGoBack() {
    window.location.href = '/';
  }

  return (
    <div className="container">
      <header>
        <h1>📝 Todo Details</h1>
        <p>View complete information about this todo</p>
      </header>

      {error && (
        <div className="error">
          ❌ {error}
          <br />
          <button
            onClick={handleGoBack}
            style={{
              marginTop: '15px',
              padding: '10px 20px',
              background: '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600',
            }}
          >
            ← Back to Todo List
          </button>
        </div>
      )}

      {loading && <div className="loading">Loading todo details...</div>}

      {todo && !error && (
        <div className="todo-details">
          <div className="detail-section">
            <div className="detail-label">📌 Todo ID</div>
            <div className="detail-value">{todo.id}</div>
          </div>

          <div className="detail-section">
            <div className="detail-label">📋 Title</div>
            <div className="detail-value todo-title-detail">{todo.title}</div>
          </div>

          <div className="detail-section">
            <div className="detail-label">✅ Status</div>
            <div className="detail-value">
              <span className={`status-badge ${todo.completed ? 'completed' : 'pending'}`}>
                {todo.completed ? '✓ Completed' : '⏳ Pending'}
              </span>
            </div>
          </div>

          <div className="detail-section">
            <div className="detail-label">📅 Created Date</div>
            <div className="detail-value">
              {new Date(todo.createdAt).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </div>
          </div>

          <div className="detail-section">
            <div className="detail-label">⏰ Created Time</div>
            <div className="detail-value">
              {new Date(todo.createdAt).toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
              })}
            </div>
          </div>

          <div className="detail-section">
            <div className="detail-label">🕐 Created At (ISO)</div>
            <div className="detail-value code-value">{todo.createdAt}</div>
          </div>

          <div className="detail-actions">
            <button onClick={handleGoBack} className="btn-back">
              ← Back to Todo List
            </button>
          </div>
        </div>
      )}

      {!loading && !error && !todo && (
        <div className="empty-state">
          <p>No data available</p>
          <button onClick={handleGoBack} className="btn-back" style={{ marginTop: '20px' }}>
            ← Back to Todo List
          </button>
        </div>
      )}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <TodoDetailsApp />
  </React.StrictMode>
);
