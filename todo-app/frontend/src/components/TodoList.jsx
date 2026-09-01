import { TodoItem } from './TodoItem';
import { useEffect, useState } from 'react';

export function TodoList({
  todos,
  editingId,
  editingTitle,
  onToggle,
  onEdit,
  onDelete,
  onViewDetails,
  onSaveEdit,
  onCancelEdit,
  onEditingTitleChange,
}) {
  if (!todos || todos.length === 0) {
    return (
      <div className="empty-state">
        <p>📝 No todos yet! Add one to get started.</p>
      </div>
    );
  }

  return (
    <div>
      {editingId && (
        <div className="edit-form">
          <input
            type="text"
            value={editingTitle}
            onChange={(e) => onEditingTitleChange(e.target.value)}
            placeholder="Edit your todo..."
            autoFocus
          />
          <div className="edit-actions">
            <button className="btn-save" onClick={onSaveEdit}>
              Save
            </button>
            <button className="btn-cancel" onClick={onCancelEdit}>
              Cancel
            </button>
          </div>
        </div>
      )}

      <ul className="todo-list">
        {todos.map((todo) => (
          <TodoItem
            key={todo.id}
            todo={todo}
            onToggle={onToggle}
            onEdit={onEdit}
            onDelete={onDelete}
            onViewDetails={onViewDetails}
          />
        ))}
      </ul>
    </div>
  );
}
