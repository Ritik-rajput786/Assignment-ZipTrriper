import { useState } from 'react';

export function TodoForm({ onSubmit, isLoading }) {
  const [title, setTitle] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!title.trim()) {
      alert('Please enter a todo title');
      return;
    }

    // Call the parent handler with the title
    onSubmit(title);

    // Clear the input
    setTitle('');
  };

  return (
    <form className="todo-form" onSubmit={handleSubmit}>
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Add a new todo..."
        disabled={isLoading}
        aria-label="New todo title"
      />
      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Adding...' : 'Add'}
      </button>
    </form>
  );
}
