import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, Car, Map, Settings, Menu, X } from 'lucide-react';

const SidebarItem = ({ to, icon: Icon, label, onClick }: any) => {
    return (
        <NavLink 
            to={to} 
            onClick={onClick}
            className={({ isActive }) => 
                `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                    isActive 
                    ? 'bg-blue-50 text-blue-700 font-semibold shadow-sm' 
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`
            }
        >
            <Icon size={20} />
            <span>{label}</span>
        </NavLink>
    );
};

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const location = useLocation();

  // Close sidebar on route change on mobile
  React.useEffect(() => {
    setIsSidebarOpen(false);
  }, [location]);

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 w-full bg-white border-b border-slate-200 z-30 px-4 py-3 flex justify-between items-center">
        <div className="flex items-center gap-2">
            <div className="bg-blue-600 text-white p-1.5 rounded-lg font-bold">Nx</div>
            <span className="font-bold text-slate-800 text-lg">Navexa</span>
        </div>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
            {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar / Overlay for Mobile */}
      <>
        {/* Overlay */}
        {isSidebarOpen && (
            <div 
                className="fixed inset-0 bg-black/50 z-20 lg:hidden backdrop-blur-sm"
                onClick={() => setIsSidebarOpen(false)}
            />
        )}
        
        {/* Aside */}
        <aside className={`
            fixed lg:static inset-y-0 left-0 z-30 w-64 bg-white border-r border-slate-200 transform transition-transform duration-300 ease-in-out
            ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            lg:translate-x-0 flex flex-col
        `}>
            <div className="p-6 border-b border-slate-100 hidden lg:flex items-center gap-3">
                 <div className="bg-blue-600 text-white w-8 h-8 flex items-center justify-center rounded-lg font-bold text-lg">N</div>
                 <span className="font-bold text-xl text-slate-800 tracking-tight">Navexa</span>
            </div>

            <nav className="flex-1 p-4 space-y-2 mt-14 lg:mt-0 overflow-y-auto">
                <SidebarItem to="/" icon={LayoutDashboard} label="Dashboard" />
                <SidebarItem to="/trips" icon={Map} label="Trip Management" />
                <SidebarItem to="/vehicles" icon={Car} label="Vehicles & Service" />
                {/* Placeholder for future settings */}
                <div className="pt-4 mt-4 border-t border-slate-100">
                    <div className="px-4 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">System</div>
                    <SidebarItem to="/settings" icon={Settings} label="Settings" />
                </div>
            </nav>

            <div className="p-4 border-t border-slate-100">
                <div className="bg-slate-50 rounded-xl p-4">
                    <p className="text-xs text-slate-500 mb-1">Logged in as</p>
                    <p className="font-semibold text-slate-800 text-sm">Admin User</p>
                </div>
            </div>
        </aside>
      </>

      {/* Main Content */}
      <main className="flex-1 lg:ml-0 pt-16 lg:pt-0 h-screen overflow-y-auto p-4 lg:p-8">
        <div className="max-w-7xl mx-auto">
            {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;