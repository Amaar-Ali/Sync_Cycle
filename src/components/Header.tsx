import { Calendar, User, BarChart3, Shield, LogOut, FileText, List, HeartPulse } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

interface HeaderProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const Header = ({ activeTab, onTabChange }: HeaderProps) => {
  const { user, isAdmin, logout } = useAuth();

  const tabs = [
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'log', label: 'Log Entry', icon: User },
    { id: 'entries', label: 'Entries', icon: List },
    { id: 'insights', label: 'Insights', icon: BarChart3 },
    { id: 'relief', label: 'Relief Ideas', icon: HeartPulse },
  ];

  if (isAdmin) {
    tabs.push(
      { id: 'admin', label: 'Admin', icon: Shield },
      { id: 'logs', label: 'System Logs', icon: FileText }
    );
  }

  return (
    <header className="mt-3">
      <div className="w-100 px-3 px-md-4 py-4 py-md-5 bg-gradient-to-r from-pink-50 to-purple-50 border-bottom border-pink-100 rounded-4 shadow">
        <div className="d-flex flex-column flex-md-row align-items-center justify-content-between mb-4">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 leading-tight pb-2 mb-3 mb-md-0" style={{fontFamily: 'Poppins, Nunito, Inter, sans-serif'}}>SyncCycle</h1>
          <div className="d-flex align-items-center gap-3">
            <div className="d-flex align-items-center gap-2">
              <img 
                src={user?.photoURL || ''} 
                alt={user?.displayName || 'User'} 
                className="rounded-circle" 
                style={{width: "32px", height: "32px"}}
              />
              <span className="small text-secondary">{user?.displayName}</span>
            </div>
            <Button
              onClick={logout}
              variant="ghost"
              size="sm"
              className="d-flex align-items-center gap-2 btn btn-sm btn-light"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
        <nav className="d-flex justify-content-center overflow-auto">
          <div className="d-flex bg-white rounded-pill p-1 shadow-sm">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={`d-flex align-items-center gap-2 px-2 px-md-3 py-2 rounded-pill transition ${
                    activeTab === tab.id
                      ? 'bg-primary text-white shadow-sm'
                      : 'text-secondary hover:text-dark hover:bg-light'
                  }`}
                >
                  <Icon size={16} />
                  <span className="d-none d-md-inline fw-medium">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;
