import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle2, 
  Circle, 
  Trash2, 
  Edit3, 
  Calendar, 
  AlertCircle,
  MoreVertical,
  ChevronRight,
  Clock,
  Check
} from 'lucide-react';

// --- Safe Date Helpers ---

const formatDateFormatted = (dateValue) => {
  if (!dateValue) return "No Date Set";
  try {
    const d = new Date(dateValue);
    if (isNaN(d.getTime())) return "Invalid Date";
    const day = String(d.getUTCDate()).padStart(2, '0');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = months[d.getUTCMonth()];
    const year = d.getUTCFullYear();
    return `${day} ${month} ${year}`;
  } catch (e) {
    return "Date Error";
  }
};

const toDateInputString = (dateValue) => {
  if (!dateValue) return '';
  try {
    const d = new Date(dateValue);
    if (isNaN(d.getTime())) return '';
    const year = d.getUTCFullYear();
    const month = String(d.getUTCMonth() + 1).padStart(2, '0');
    const day = String(d.getUTCDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  } catch (e) {
    return '';
  }
};

const getLocalYYYYMMDD = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const TaskItem = ({ task, onUpdate, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(task.title || '');
  const [editedDescription, setEditedDescription] = useState(task.description || '');
  const [editedDueDate, setEditedDueDate] = useState(toDateInputString(task.dueDate));
  const [editedPriority, setEditedPriority] = useState(task.priority || 'Medium');

  useEffect(() => {
    setEditedTitle(task.title || '');
    setEditedDescription(task.description || '');
    setEditedDueDate(toDateInputString(task.dueDate));
    setEditedPriority(task.priority || 'Medium');
  }, [task]);

  const isCompleted = task.status === 'completed';
  const localToday = getLocalYYYYMMDD();
  const taskDateISO = toDateInputString(task.dueDate);

  const isOverdue = taskDateISO && taskDateISO < localToday && !isCompleted;
  const isToday = taskDateISO && taskDateISO === localToday && !isCompleted;

  const handleToggleStatus = () => {
    onUpdate(task._id, {
      title: task.title,
      description: task.description,
      status: isCompleted ? 'pending' : 'completed',
      dueDate: task.dueDate,
      priority: task.priority
    });
  };

  const handleSave = () => {
    if (editedTitle.trim() && editedDescription.trim() && editedDueDate) {
      onUpdate(task._id, {
        title: editedTitle,
        description: editedDescription,
        status: task.status,
        dueDate: editedDueDate,
        priority: editedPriority
      });
      setIsEditing(false);
    }
  };

  const priorityColors = {
    High: 'var(--danger-color)',
    Medium: 'var(--warning-color)',
    Low: 'var(--success-color)'
  };

  const statusColors = {
    completed: 'var(--success-color)',
    pending: 'var(--primary-color)'
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3 }}
      className={`glass task-card-wrapper ${isCompleted ? 'task-completed' : ''}`}
      style={{
        padding: '1.25rem',
        borderRadius: 'var(--radius-lg)',
        borderLeft: `6px solid ${isCompleted ? 'var(--success-color)' : priorityColors[task.priority] || 'var(--primary-color)'}`,
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        transition: 'all 0.3s ease'
      }}
    >
      <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start' }}>
        {/* Toggle Button */}
        <button
          onClick={handleToggleStatus}
          style={{
            background: isCompleted ? 'var(--success-color)' : 'transparent',
            border: `2px solid ${isCompleted ? 'var(--success-color)' : 'var(--border-color)'}`,
            borderRadius: '10px',
            width: '28px',
            height: '28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            cursor: 'pointer',
            marginTop: '0.25rem',
            transition: 'all 0.2s ease'
          }}
          className="status-toggle"
        >
          {isCompleted && <Check size={18} />}
        </button>

        <div style={{ flex: 1 }}>
          {isEditing ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <input 
                value={editedTitle} 
                onChange={(e) => setEditedTitle(e.target.value)} 
                className="input-field" 
                placeholder="Title" 
              />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <input 
                   type="date" 
                   value={editedDueDate} 
                   onChange={(e) => setEditedDueDate(e.target.value)} 
                   className="input-field" 
                />
                <select 
                  value={editedPriority} 
                  onChange={(e) => setEditedPriority(e.target.value)} 
                  className="input-field"
                >
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>
              <textarea 
                value={editedDescription} 
                onChange={(e) => setEditedDescription(e.target.value)} 
                className="input-field" 
                style={{ minHeight: '80px', resize: 'vertical' }}
                placeholder="Description..." 
              />
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button onClick={handleSave} className="btn btn-primary">Save</button>
                <button onClick={() => setIsEditing(false)} className="btn btn-secondary">Cancel</button>
              </div>
            </div>
          ) : (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <h4 style={{
                  margin: 0,
                  fontSize: '1.15rem',
                  fontWeight: '700',
                  color: isCompleted ? 'var(--text-muted)' : 'var(--text-primary)',
                  textDecoration: isCompleted ? 'line-through' : 'none',
                  transition: 'color 0.3s ease'
                }}>
                  {task.title}
                </h4>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <span className={`badge ${task.priority === 'High' ? 'badge-danger' : task.priority === 'Medium' ? 'badge-warning' : 'badge-success'}`}>
                    {task.priority}
                  </span>
                  {isOverdue && <span className="badge badge-danger">Overdue</span>}
                </div>
              </div>

              <p style={{
                margin: '0 0 1rem 0',
                fontSize: '0.95rem',
                color: 'var(--text-secondary)',
                lineHeight: '1.5',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden'
              }}>
                {task.description}
              </p>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: isOverdue ? 'var(--danger-color)' : 'var(--text-muted)', fontSize: '0.85rem', fontWeight: '600' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Calendar size={14} />
                    <span>{formatDateFormatted(task.dueDate)}</span>
                  </div>
                  {isToday && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--warning-color)' }}>
                      <Clock size={14} />
                      <span>Today</span>
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '0.25rem' }}>
                  <button 
                    onClick={() => setIsEditing(true)} 
                    className="action-btn"
                    title="Edit"
                  >
                    <Edit3 size={18} />
                  </button>
                  <button 
                    onClick={() => onDelete(task._id)} 
                    className="action-btn delete"
                    title="Delete"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .task-card-wrapper:hover {
          transform: translateX(5px);
          box-shadow: var(--shadow-md);
          border-color: rgba(79, 70, 229, 0.2);
        }
        .status-toggle:hover {
          transform: scale(1.1);
          border-color: var(--primary-color);
        }
        .action-btn {
          background: transparent;
          border: none;
          color: var(--text-muted);
          padding: 0.5rem;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
          cursor: pointer;
        }
        .action-btn:hover {
          background: var(--primary-light);
          color: var(--primary-color);
        }
        .action-btn.delete:hover {
          background: rgba(239, 68, 68, 0.1);
          color: var(--danger-color);
        }
      `}</style>
    </motion.div>
  );
};

export default TaskItem;
