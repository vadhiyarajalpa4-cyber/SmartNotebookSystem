import Sidebar from './Sidebar';
import Header from './Header';

const MainLayout = ({ children, activeFilter, setFilter, onAddTask, searchQuery, setSearchQuery }) => {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-gradient)' }}>
      {/* Fixed Sidebar */}
      <Sidebar 
        activeFilter={activeFilter} 
        setFilter={setFilter} 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      {/* Main Content Area */}
      <div style={{
        flex: 1,
        marginLeft: 'var(--sidebar-width)',
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        position: 'relative',
        transition: 'all 0.3s ease'
      }}>
        {/* Sticky Header */}
        <Header onAddTask={onAddTask} searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

        {/* Dynamic Page Content */}
        <main className="container" style={{
          paddingTop: '2.5rem',
          paddingBottom: '4rem',
          flex: 1,
          maxWidth: '1200px',
          width: '100%',
          margin: '0 auto',
          position: 'relative',
          zIndex: 1
        }}>
          {children}
        </main>
      </div>

      <style>{`
        @media (max-width: 1024px) {
          .sidebar-hidden {
            display: none;
          }
          .main-content-full {
             margin-left: 0 !important;
          }
        }
      `}</style>
    </div>
  );
};

export default MainLayout;
