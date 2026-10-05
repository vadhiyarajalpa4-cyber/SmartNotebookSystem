import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import TaskItem from '../components/TaskItem';
import MainLayout from '../components/MainLayout';
import {
  Plus,
  Search,
  Filter,
  BarChart3,
  CheckCircle2,
  Clock,
  AlertCircle,
  X,
  Calendar,
  Layers,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Dashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [allTasks, setAllTasks] = useState([]); // always holds ALL tasks for stats
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [isAdding, setIsAdding] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [localToday, setLocalToday] = useState('');

  // States for Filtering & Sorting
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('dueDate');

  const { user } = useContext(AuthContext);

  // Helper to get true local YYYY-MM-DD
  const getLocalYYYYMMDD = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  useEffect(() => {
    setLocalToday(getLocalYYYYMMDD());
    fetchTasks();
  }, [filter, sortBy, user]);

  const fetchTasks = async () => {
    try {
      if (!user || !user.token) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError('');
      const clientDate = getLocalYYYYMMDD();

      // Fetch filtered tasks for the task list
      const { data } = await axios.get(`http://localhost:5000/api/tasks`, {
        params: { filter, sort: sortBy, clientDate },
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setTasks(data || []);

      // Always fetch ALL tasks separately for accurate stat counts
      const { data: allData } = await axios.get(`http://localhost:5000/api/tasks`, {
        params: { filter: 'all', sort: sortBy, clientDate },
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setAllTasks(allData || []);
    } catch (error) {
      setError('Sync failed. Please check your connection.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !dueDate) return;

    try {
      if (!user || !user.token) {
        setError('You must be logged in to create tasks.');
        return;
      }

      console.log('Creating task, token:', user.token);

      await axios.post('http://localhost:5000/api/tasks', {
        title,
        description,
        status: 'pending',
        dueDate,
        priority
      }, {
        headers: { Authorization: `Bearer ${user.token}` }
      });

      setTitle('');
      setDescription('');
      setDueDate('');
      setPriority('Medium');
      setIsAdding(false);
      fetchTasks();
    } catch (error) {
      setError('Failed to create task.');
      console.error('Create task error:', error?.response?.status, error?.response?.data || error.message);
    }
  };

  const handleUpdateTask = async (id, updatedData) => {
    try {
      if (!user || !user.token) return;

      await axios.put(`http://localhost:5000/api/tasks/${id}`, updatedData, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      fetchTasks();
    } catch (error) {
      console.error('Failed to update task', error);
    }
  };

  const handleDeleteTask = async (id) => {
    try {
      if (!user || !user.token) return;

      await axios.delete(`http://localhost:5000/api/tasks/${id}`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setTasks(tasks.filter(t => t._id !== id));
    } catch (error) {
      console.error('Failed to delete task', error);
    }
  };

  const filteredTasksList = tasks.filter(t =>
    t.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Dynamic Greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  // Stats always computed from ALL tasks so counts are never affected by the active filter
  const stats = {
    total: allTasks.length,
    pending: allTasks.filter(t => t.status === 'pending').length,
    completed: allTasks.filter(t => t.status === 'completed').length,
    overdue: allTasks.filter(t => {
      if (!t.dueDate) return false;
      const taskDateStr = t.dueDate.split('T')[0]; // "YYYY-MM-DD"
      return taskDateStr < localToday && t.status !== 'completed';
    }).length
  };

  const statCards = [
    { label: 'Total Tasks', value: stats.total, icon: BarChart3, color: 'var(--primary-color)', bg: 'var(--primary-light)', filterId: 'all' },
    { label: 'Pending', value: stats.pending, icon: Clock, color: 'var(--warning-color)', bg: 'var(--warning-light)', filterId: 'pending' },
    { label: 'Completed', value: stats.completed, icon: CheckCircle2, color: 'var(--success-color)', bg: 'var(--success-light)', filterId: 'completed' },
    { label: 'Overdue', value: stats.overdue, icon: AlertCircle, color: 'var(--danger-color)', bg: 'var(--danger-light)', filterId: 'overdue' }
  ];

  return (
    <MainLayout
      activeFilter={filter}
      setFilter={setFilter}
      onAddTask={() => setIsAdding(true)}
      searchQuery={searchQuery}
      setSearchQuery={setSearchQuery}
    >
      {/* Greeting Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: '2.5rem' }}
      >
        <h2 style={{ fontSize: '2rem', fontWeight: '800', letterSpacing: '-0.5px' }}>
          {getGreeting()}, {user.name?.split(' ')[0]} 👋
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', fontWeight: '500' }}>
          Here’s what’s on your plate today.
        </p>
      </motion.div>

      {/* Stats Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '1.5rem',
        marginBottom: '3rem'
      }}>
        {statCards.map((card, index) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => setFilter(card.filterId)}
            className="glass"
            style={{
              padding: '1.5rem',
              borderRadius: 'var(--radius-lg)',
              display: 'flex',
              alignItems: 'center',
              gap: '1.25rem',
              transition: 'all 0.3s ease',
              cursor: 'pointer',
              border: filter === card.filterId ? `1px solid ${card.color}` : '1px solid transparent',
              boxShadow: filter === card.filterId ? `0 4px 20px ${card.color}20` : 'var(--shadow-sm)'
            }}
            whileHover={{ y: -5, boxShadow: 'var(--shadow-lg)', border: `1px solid ${card.color}` }}
          >
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '16px',
              backgroundColor: card.bg,
              color: card.color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <card.icon size={28} />
            </div>
            <div>
              <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {card.label}
              </p>
              <h3 style={{ margin: 0, fontSize: '1.75rem', fontWeight: '900', color: 'var(--text-primary)' }}>
                {loading ? '...' : card.value}
              </h3>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Task Section */}
      <div className="glass" style={{
        borderRadius: 'var(--radius-xl)',
        padding: '2rem',
        minHeight: '400px'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Layers className="text-primary" size={24} />
            <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '800' }}>{filter.toUpperCase()} TASKS</h3>
            <span style={{
              background: 'var(--primary-color)',
              color: 'white',
              padding: '2px 10px',
              borderRadius: '6px',
              fontSize: '0.8rem',
              fontWeight: '700'
            }}>{filteredTasksList.length}</span>
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ position: 'relative' }}>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={{
                  appearance: 'none',
                  padding: '0.6rem 1.25rem 0.6rem 2.5rem',
                  borderRadius: '10px',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'var(--card-bg)',
                  color: 'var(--text-primary)',
                  fontSize: '0.85rem',
                  fontWeight: '700',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                <option value="dueDate">Near Date</option>
                <option value="priority">Priority</option>
              </select>
              <Filter size={16} style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            </div>
          </div>
        </div>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {[1, 2, 3].map(i => (
              <div key={i} className="skeleton" style={{ height: '100px', borderRadius: '16px' }} />
            ))}
          </div>
        ) : filteredTasksList.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '5rem 1rem',
            color: 'var(--text-muted)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1rem'
          }}>
            <div style={{ width: '120px', height: '120px', opacity: 0.2, marginBottom: '1rem' }}>
              <CheckCircle2 size={120} />
            </div>
            <h4 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-secondary)' }}>No tasks found</h4>
            <p style={{ margin: 0 }}>Try changing your filter or add a new task to get started.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <AnimatePresence>
              {filteredTasksList.map((task, index) => (
                <TaskItem
                  key={task._id}
                  task={task}
                  onUpdate={handleUpdateTask}
                  onDelete={handleDeleteTask}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Add Task Modal */}
      <AnimatePresence>
        {isAdding && (
          <div style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
            overflowY: 'auto'
          }}>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAdding(false)}
              style={{
                position: 'absolute',
                inset: 0,
                background: 'rgba(15, 23, 42, 0.4)',
                backdropFilter: 'blur(4px)'
              }}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="glass"
              style={{
                width: '100%',
                maxWidth: '600px',
                maxHeight: '90vh',
                overflowY: 'auto',
                padding: '2.5rem',
                borderRadius: 'var(--radius-xl)',
                position: 'relative',
                boxShadow: 'var(--shadow-lg)',
                margin: 'auto'
              }}
            >
              <button
                onClick={() => setIsAdding(false)}
                style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'none', border: 'none', color: 'var(--text-muted)' }}
              >
                <X size={24} />
              </button>

              <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '1.75rem', fontWeight: '800', margin: '0 0 0.5rem 0' }}>Create New Task</h3>
                <p style={{ color: 'var(--text-muted)', margin: 0 }}>Organize your workflow with precision.</p>
              </div>

              <form onSubmit={handleAddTask}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <div className="input-group">
                    <label style={{ color: 'var(--text-primary)', fontWeight: '700', fontSize: '0.9rem', marginBottom: '0.6rem', display: 'block' }}>Task Title</label>
                    <input
                      type="text"
                      className="input-field"
                      style={{ width: '100%', height: '52px' }}
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Design System Overhaul"
                      required
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                    <div className="input-group">
                      <label style={{ color: 'var(--text-primary)', fontWeight: '700', fontSize: '0.9rem', marginBottom: '0.6rem', display: 'block' }}>Due Date</label>
                      <div style={{ position: 'relative' }}>
                        <input
                          type="date"
                          className="input-field"
                          style={{ width: '100%', height: '52px' }}
                          value={dueDate}
                          onChange={(e) => setDueDate(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    <div className="input-group">
                      <label style={{ color: 'var(--text-primary)', fontWeight: '700', fontSize: '0.9rem', marginBottom: '0.6rem', display: 'block' }}>Priority</label>
                      <select
                        value={priority}
                        onChange={(e) => setPriority(e.target.value)}
                        className="input-field"
                        style={{ width: '100%', height: '52px' }}
                      >
                        <option value="High">🔴 High Priority</option>
                        <option value="Medium">🟡 Medium Priority</option>
                        <option value="Low">🟢 Low Priority</option>
                      </select>
                    </div>
                  </div>

                  <div className="input-group">
                    <label style={{ color: 'var(--text-primary)', fontWeight: '700', fontSize: '0.9rem', marginBottom: '0.6rem', display: 'block' }}>Notes & Instructions</label>
                    <textarea
                      className="input-field"
                      style={{ width: '100%', minHeight: '120px', resize: 'vertical' }}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Add any specific details here..."
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                    <button type="submit" className="btn btn-primary" style={{ flex: 1, height: '52px' }}>Create Task</button>
                    <button type="button" onClick={() => setIsAdding(false)} className="btn btn-secondary" style={{ flex: 1, height: '52px' }}>Discard</button>
                  </div>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </MainLayout>
  );
};

export default Dashboard;
