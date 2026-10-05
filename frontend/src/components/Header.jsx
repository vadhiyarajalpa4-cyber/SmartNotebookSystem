import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import { Bell, Search, Plus, Moon, Sun } from 'lucide-react';

const Header = ({ onAddTask, searchQuery, setSearchQuery }) => {
  const { user } = useContext(AuthContext);
  const { theme, toggleTheme } = useContext(ThemeContext);

  return (
    <>
      <header style={{
        position: 'sticky',
        top: '1.25rem',
        zIndex: 90,
        margin: '1.25rem 1.5rem 0',
        height: 'var(--header-height)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 1.5rem',
        borderRadius: 'var(--radius-xl)',
        background: 'var(--header-bg)',
        backdropFilter: 'var(--glass-blur)',
        WebkitBackdropFilter: 'var(--glass-blur)',
        border: '1px solid var(--border-color)',
        boxShadow: '0 8px 32px rgba(124, 58, 237, 0.08)',
        transition: 'all 0.3s ease'
      }}>
        {/* Search */}
        <div style={{ position: 'relative', width: '380px', maxWidth: '50vw' }}>
          <Search size={17} style={{
            position: 'absolute', left: '1.1rem', top: '50%',
            transform: 'translateY(-50%)', color: 'var(--text-muted)',
            pointerEvents: 'none'
          }} />
          <input
            type="text"
            placeholder="Search tasks, statuses, priorities..."
            className="input-search"
            style={{ paddingLeft: '3rem', height: '46px', fontSize: '0.9rem' }}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Right Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
          {/* Add Task */}
          <button
            onClick={onAddTask}
            className="btn btn-primary"
            style={{ height: '44px', padding: '0 1.25rem', gap: '0.5rem' }}
          >
            <Plus size={19} />
            <span>New Task</span>
          </button>

          {/* Divider */}
          <div style={{ width: '1px', height: '28px', background: 'var(--border-color)' }} />

          {/* Dark Mode Toggle */}
          <button
            onClick={toggleTheme}
            className="btn-icon"
            title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
          >
            {theme === 'light' ? <Moon size={19} /> : <Sun size={19} />}
          </button>

          {/* Notifications */}
          <div style={{ position: 'relative' }}>
            <button className="btn-icon" title="Notifications">
              <Bell size={19} />
            </button>
            <span style={{
              position: 'absolute',
              top: '8px', right: '8px',
              width: '8px', height: '8px',
              background: 'var(--danger-color)',
              borderRadius: '50%',
              border: '2px solid var(--card-bg)'
            }} className="pulse-dot" />
          </div>

          {/* User Avatar */}
          <div style={{
            width: '40px', height: '40px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, var(--primary-color), #6d28d9)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontWeight: '800', fontSize: '0.95rem',
            cursor: 'pointer',
            boxShadow: '0 4px 12px var(--primary-glow)',
            flexShrink: 0
          }} title={user?.name}>
            {user?.name?.charAt(0).toUpperCase()}
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;
