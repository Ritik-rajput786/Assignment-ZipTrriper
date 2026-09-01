export function TodoItem({ todo, onToggle, onEdit, onDelete, onViewDetails }) {
  return (
    <li className="todo-item">
      <input
        type="checkbox"
        checked={todo.completed}
        onChange={() => onToggle(todo.id)}
        aria-label={`Mark "${todo.title}" as ${todo.completed ? 'incomplete' : 'complete'}`}
      />
      <div className="todo-content">
        <div className="todo-title">{todo.title}</div>
        <div className="todo-meta">
          Created: {new Date(todo.createdAt).toLocaleDateString()} at{' '}
          {new Date(todo.createdAt).toLocaleTimeString()}
        </div>
      </div>
      <div className="todo-actions">
        <button className="btn-view" onClick={() => onViewDetails(todo.id)}>
          View
        </button>
        <button className="btn-edit" onClick={() => onEdit(todo.id)}>
          Edit
        </button>
        <button className="btn-delete" onClick={() => onDelete(todo.id)}>
          Delete
        </button>
      </div>
    </li>
  );
}
