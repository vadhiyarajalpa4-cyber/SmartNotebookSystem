import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  CheckCircle2, 
  Clock, 
  Search, 
  LogOut
} from 'lucide-react';

const Sidebar = ({ activeFilter, setFilter, searchQuery, setSearchQuery }) => {
  const { user, logout } = useContext(AuthContext);

  const navItems = [
    { id: 'all',       label: 'All Tasks',  icon: LayoutDashboard },
    { id: 'pending',   label: 'Pending',    icon: Clock },
    { id: 'completed', label: 'Completed',  icon: CheckCircle2 },
  ];

  const navColors = {
    all:       'var(--primary-color)',
    pending:   'var(--warning-color)',
    completed: 'var(--success-color)',
  };

  return (
    <aside style={{
      width: 'var(--sidebar-width)',
      height: '100vh',
      position: 'fixed',
      left: 0,
      top: 0,
      zIndex: 100,
      display: 'flex',
      flexDirection: 'column',
      padding: '2rem 1.5rem',
      background: 'var(--sidebar-bg)',
      backdropFilter: 'var(--glass-blur)',
      WebkitBackdropFilter: 'var(--glass-blur)',
      borderRight: '1px solid var(--border-color)',
      transition: 'all 0.3s ease'
    }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', marginBottom: '2.5rem', paddingLeft: '0.25rem' }}>
        <div style={{
          background: 'linear-gradient(135deg, var(--primary-color) 0%, #6d28d9 100%)',
          width: '42px',
          height: '42px',
          borderRadius: '14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          flexShrink: 0,
          boxShadow: '0 6px 16px var(--primary-glow)'
        }}>
          <CheckCircle2 size={22} />
        </div>
        <div>
          <h1 style={{ fontSize: '1.2rem', fontWeight: '800', margin: 0, letterSpacing: '-0.4px', color: 'var(--text-primary)' }}>
            Smart<span style={{ color: 'var(--primary-color)' }}>Task</span>
          </h1>
          <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: '700', margin: 0, letterSpacing: '1px', textTransform: 'uppercase' }}>
            Management
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div style={{ position: 'relative', marginBottom: '2rem' }}>
        <Search size={16} style={{
          position: 'absolute', left: '0.9rem', top: '50%',
          transform: 'translateY(-50%)', color: 'var(--text-muted)',
          pointerEvents: 'none'
        }} />
        <input
          type="text"
          placeholder="Search tasks..."
          className="input-search"
          style={{ paddingLeft: '2.75rem', height: '42px', fontSize: '0.85rem' }}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1 }}>
        <p style={{
          fontSize: '0.7rem', fontWeight: '700',
          color: 'var(--text-muted)', textTransform: 'uppercase',
          letterSpacing: '1.2px', marginBottom: '0.75rem', paddingLeft: '0.5rem'
        }}>
          Views
        </p>
        <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          {navItems.map((item) => {
            const isActive = activeFilter === item.id;
            return (
              <li key={item.id}>
                <button
                  onClick={() => setFilter(item.id)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.875rem',
                    padding: '0.8rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    border: 'none',
                    background: isActive ? 'var(--primary-light)' : 'transparent',
                    color: isActive ? 'var(--primary-color)' : 'var(--text-secondary)',
                    fontWeight: isActive ? '700' : '500',
                    fontSize: '0.9rem',
                    transition: 'all 0.2s ease',
                    position: 'relative',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                  className="nav-item-btn"
                >
                  {isActive && (
                    <span style={{
                      position: 'absolute',
                      left: '-1.5rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: '4px',
                      height: '22px',
                      background: navColors[item.id],
                      borderRadius: '0 4px 4px 0',
                      boxShadow: `2px 0 8px ${navColors[item.id]}50`
                    }} />
                  )}
                  <item.icon
                    size={19}
                    style={{
                      color: isActive ? navColors[item.id] : 'var(--text-muted)',
                      transform: isActive ? 'scale(1.1)' : 'scale(1)',
                      transition: 'all 0.2s ease',
                      flexShrink: 0
                    }}
                  />
                  <span>{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Status Legend */}
      <div style={{
        padding: '1rem',
        borderRadius: 'var(--radius-md)',
        background: 'var(--primary-light)',
        marginBottom: '1.5rem',
        border: '1px solid var(--border-color)'
      }}>
        <p style={{ fontSize: '0.72rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.6rem' }}>Status</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          {[
            { label: 'Completed', color: 'var(--success-color)', bg: 'var(--success-light)' },
            { label: 'Pending',   color: 'var(--warning-color)', bg: 'var(--warning-light)' },
            { label: 'Overdue',   color: 'var(--danger-color)',  bg: 'var(--danger-light)'  },
          ].map(s => (
            <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: s.color, flexShrink: 0 }} />
              <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: '500' }}>{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* User Profile */}
      <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: '40px', height: '40px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, var(--primary-color), #6d28d9)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontWeight: '800', fontSize: '1rem',
            flexShrink: 0, boxShadow: '0 4px 10px var(--primary-glow)'
          }}>
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <p style={{
              margin: 0, fontSize: '0.875rem', fontWeight: '700',
              color: 'var(--text-primary)',
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
            }}>{user?.name}</p>
            <p style={{
              margin: 0, fontSize: '0.72rem', color: 'var(--text-muted)',
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
            }}>{user?.email}</p>
          </div>
          <button
            onClick={logout}
            title="Logout"
            style={{
              background: 'none', border: 'none',
              color: 'var(--text-muted)', padding: '0.5rem',
              borderRadius: '8px', transition: 'all 0.2s ease',
              flexShrink: 0, cursor: 'pointer'
            }}
            className="logout-btn"
          >
            <LogOut size={17} />
          </button>
        </div>
      </div>

      <style>{`
        .nav-item-btn:hover {
          background: var(--primary-light) !important;
          color: var(--primary-color) !important;
        }
        .logout-btn:hover {
          background: var(--danger-light) !important;
          color: var(--danger-color) !important;
        }
      `}</style>
    </aside>
  );
};

export default Sidebar;
